export type LanguagePair =
  | 'Swahili-English'
  | 'Hausa-English'
  | 'Yoruba-English'
  | 'Kinyarwanda-English'
  | 'Kinyarwanda-French'
  | 'Amharic-English'
  | 'Zulu-English'
  | 'Afrikaans-English'
  | 'Nigerian Pidgin-English'
  | 'Luganda-English'
  | 'Igbo-English'
  | 'Akan-English'
  | 'Wolof-French';

export type ChallengeCategory =
  | 'Health'
  | 'Fintech & Customer Experience'
  | 'Legal & Public Services'
  | 'Agriculture & Education'
  | 'Other High-Impact';

export type SpeechModelId =
  | 'sahara'
  | 'whisper-v3'
  | 'google-chirp'
  | 'meta-mms';

export interface SpeechModelInfo {
  id: SpeechModelId;
  name: string;
  provider: string;
  version: string;
  architecture: string;
  specialization: string;
  werAverage: number;
  cerAverage: number;
  codeSwitchAcc: number;
  latencyMs: number;
  medicalTermRecall: number;
  hallucinationRate: number;
  costPerHour: number;
  pros: string[];
  cons: string[];
  color: string;
}

export interface CodeSwitchToken {
  token: string;
  language: string;
  role: 'matrix' | 'embedded' | 'neutral';
  translation?: string;
  confidence?: number;
}

export interface BenchmarkAudioSample {
  id: string;
  title: string;
  dataset: 'Intron Afriswitch' | 'Intron AfriswitchCare' | 'LyngualLabs';
  category: ChallengeCategory;
  languagePair: LanguagePair;
  speakerGender: 'Female' | 'Male';
  accentRegion: string;
  durationSec: number;
  snrDb: number;
  groundTruth: string;
  tokens: CodeSwitchToken[];
  clinicalOrDomainContext: string;
  modelTranscripts: {
    [key in SpeechModelId]: {
      transcript: string;
      wer: number;
      cer: number;
      codeSwitchAcc: number;
      latencyMs: number;
      hallucinatedPhrases?: string[];
      notes: string;
    };
  };
}

export interface BenchmarkAggregateMetric {
  languagePair: LanguagePair;
  dataset: string;
  models: {
    [key in SpeechModelId]: {
      wer: number;
      cer: number;
      codeSwitchAcc: number;
      latencyMs: number;
      sampleCount: number;
    };
  };
}

export interface AgenticAction {
  actionType: string;
  summary: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  entities: Record<string, string>;
  soapNote?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  fintechAction?: {
    recipient: string;
    amount: string;
    action: string;
    channel: string;
  };
  agriAction?: {
    crop: string;
    pestOrDisease: string;
    remedyRecommendation: string;
    marketPriceInfo: string;
  };
}
