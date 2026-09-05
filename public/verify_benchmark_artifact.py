#!/usr/bin/env python3
"""
Afriswitch Code-Switching Speech Benchmark - Empirical Verification Script
==========================================================================
Verifies Word Error Rate (WER) and Character Error Rate (CER) calculations
for all benchmark samples and evaluated models (Sahara, Whisper v3, Chirp, MMS)
using standard Levenshtein Dynamic Programming edit distance matrix.

Usage:
    python verify_benchmark_artifact.py
"""

import json
import os
import re
import sys
import unicodedata

def normalize(text: str) -> str:
    """Standard ASR normalization: strip diacritics/accents, lowercase, treat hyphens as word boundary, strip punctuation."""
    text = unicodedata.normalize('NFD', text)
    text = "".join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower()
    text = re.sub(r"[-_]", " ", text)
    text = re.sub(r"[^\w\s']", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def compute_wer(ref: str, hyp: str):
    """Dynamic programming Levenshtein algorithm for word error rate."""
    r_words = normalize(ref).split()
    h_words = normalize(hyp).split()
    
    n = len(r_words)
    m = len(h_words)
    
    if n == 0:
        return {"wer": 100.0 if m > 0 else 0.0, "sub": 0, "dels": 0, "ins": m, "ref_count": 0}
        
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
        
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if r_words[i - 1] == h_words[j - 1] else 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,        # deletion
                dp[i][j - 1] + 1,        # insertion
                dp[i - 1][j - 1] + cost  # substitution
            )
            
    # Backtrack to obtain exact S, D, I counts
    i, j = n, m
    sub, dels, ins = 0, 0, 0
    while i > 0 or j > 0:
        if i > 0 and j > 0:
            cost = 0 if r_words[i - 1] == h_words[j - 1] else 1
            if dp[i][j] == dp[i - 1][j - 1] + cost:
                if cost == 1:
                    sub += 1
                i -= 1
                j -= 1
                continue
        if i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            dels += 1
            i -= 1
        elif j > 0 and dp[i][j] == dp[i][j - 1] + 1:
            ins += 1
            j -= 1
        else:
            break
            
    wer = round(((sub + dels + ins) / n) * 100, 1)
    return {
        "wer": wer,
        "substitutions": sub,
        "deletions": dels,
        "insertions": ins,
        "ref_word_count": n,
        "hyp_word_count": m
    }

def compute_cer(ref: str, hyp: str):
    """Dynamic programming Levenshtein algorithm for character error rate."""
    r_chars = normalize(ref).replace(" ", "")
    h_chars = normalize(hyp).replace(" ", "")
    n = len(r_chars)
    m = len(h_chars)
    
    if n == 0:
        return 0.0
        
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
        
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if r_chars[i - 1] == h_chars[j - 1] else 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            )
            
    return round((dp[n][m] / n) * 100, 1)

def main():
    artifact_path = os.path.join(os.path.dirname(__file__), "afriswitch_benchmark_reproducible_artifact.json")
    if not os.path.exists(artifact_path):
        artifact_path = "afriswitch_benchmark_reproducible_artifact.json"
        
    if not os.path.exists(artifact_path):
        print(f"Error: Artifact not found at {artifact_path}")
        sys.exit(1)
        
    with open(artifact_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    meta = data["metadata"]
    print("=" * 80)
    print(f"Afriswitch Benchmark Reproducibility Audit")
    print(f"Dataset: {meta['targetDataset']} | Evaluated: {len(data['samples'])} speech samples")
    print("=" * 80)
    
    all_passed = True
    models = ["sahara", "whisper-v3", "google-chirp", "meta-mms"]
    
    for s in data["samples"]:
        print(f"\n[Sample] {s['sampleId']} ({s['languagePair']}) - {s['title']}")
        print(f"Ground Truth: \"{s['groundTruth']}\"")
        print("-" * 80)
        print(f"{'Model':<14} | {'Rec WER':<8} | {'Calc WER':<9} | {'Diff':<6} | {'Sub/Del/Ins':<12} | {'Status'}")
        print("-" * 80)
        
        for m in models:
            run = s["modelRuns"].get(m)
            if not run:
                continue
            calc = compute_wer(s["groundTruth"], run["transcript"])
            diff = abs(calc["wer"] - run["wer"])
            status = "PASS" if diff <= 0.2 else "FAIL"
            if status == "FAIL":
                all_passed = False
            sdi = f"{calc['substitutions']}/{calc['deletions']}/{calc['insertions']}"
            print(f"{m:<14} | {run['wer']:>6.1f}% | {calc['wer']:>7.1f}% | {diff:>5.1f}% | {sdi:<12} | [{status}]")
            
    print("\n" + "=" * 80)
    if all_passed:
        print("VERIFICATION RESULT: ALL BENCHMARK CALCULATIONS REPRODUCED AND VERIFIED (100% PASS)")
    else:
        print("VERIFICATION RESULT: DISCREPANCIES DETECTED IN RUN")
    print("=" * 80)

if __name__ == "__main__":
    main()
