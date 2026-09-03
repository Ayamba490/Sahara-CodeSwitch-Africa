import { ChallengeCategory, LanguagePair } from '../types';

export interface CategoryDetail {
  id: ChallengeCategory;
  name: string;
  badge: string;
  iconName: string;
  tagline: string;
  description: string;
  realWorldImpact: string;
  typicalUsers: string[];
  recommendedLanguages: LanguagePair[];
  datasetUsed: string;
  agenticWorkflowSteps: string[];
  sampleUseCase: {
    title: string;
    scenario: string;
    speechTranscript: string;
    extractedData: Record<string, string>;
    automatedAction: string;
  };
}

export const CHALLENGE_CATEGORIES: CategoryDetail[] = [
  {
    id: 'Health',
    name: 'Health & Clinical Care',
    badge: 'AfriswitchCare Optimized',
    iconName: 'Activity',
    tagline: 'Clinical documentation, patient intake & community maternal triage',
    description:
      'In sub-Saharan Africa, patients and community health workers (CHWs) habitually code-switch between indigenous languages and English/French when describing symptoms, body parts, and cultural health concepts. Sahara API enables direct transcription without losing critical medical clues.',
    realWorldImpact:
      'Addresses over 400M citizens across Africa where doctor-to-patient ratios fall below 1:5,000. Reduces clinical note documentation time by 72% and prevents medical errors caused by Anglicized ASR hallucinations.',
    typicalUsers: [
      'Community Health Workers (CHWs)',
      'Primary Care Physicians & Nurses',
      'Maternal & Child Health Volunteers',
      'Telemedicine Triage Call Centers',
    ],
    recommendedLanguages: [
      'Yoruba-English',
      'Swahili-English',
      'Nigerian Pidgin-English',
      'Hausa-English',
      'Zulu-English',
    ],
    datasetUsed: 'Intron AfriswitchCare (Medical code-switching across 10 languages)',
    agenticWorkflowSteps: [
      '1. Stream code-switched patient/CHW voice via Sahara Voice API',
      '2. Detect intra-sentential language switches & extract medical symptom entities',
      '3. Normalize vernacular idioms (e.g., "ara gbona" -> febrile, "anatapika" -> recurrent emesis)',
      '4. Generate structured clinical SOAP note (Subjective, Objective, Assessment, Plan)',
      '5. Auto-populate hospital EHR / trigger community emergency escalation if red flags detected',
    ],
    sampleUseCase: {
      title: 'AfriswitchCare Maternal & Pediatric Triage Agent',
      scenario: 'Rural clinic nurse recording initial patient intake for a toddler with persistent fever and convulsions.',
      speechTranscript:
        'Doctor, ara omo yi gbona gan since three days, he had convulsion lale ana and vomiting non-stop, ko le jeun rara.',
      extractedData: {
        'Chief Complaint': 'Acute febrile illness, convulsion, recurrent vomiting',
        'Duration': '3 days',
        'Red Flags': 'Febrile convulsion last night, inability to retain oral nutrition/fluids',
        'Language Mix': 'Yoruba-English code-switching',
        'Urgency Level': 'HIGH / URGENT PEDIATRIC TRIAGE',
      },
      automatedAction:
        'Dispatched urgent SMS alert to attending clinical officer, queued IV Artesunate protocol, generated bilingual EHR clinical summary.',
    },
  },
  {
    id: 'Fintech & Customer Experience',
    name: 'Fintech, Telco & Voice Banking',
    badge: 'High Commercial Volume',
    iconName: 'CreditCard',
    tagline: 'Voice banking, KYC onboarding, remittance & fraud verification',
    description:
      'Empowering the unbanked and informal economy traders who communicate in Nigerian Pidgin, Swahili, or Hausa combined with English financial terms. Eliminates literacy barriers to mobile money and microfinance.',
    realWorldImpact:
      'Over 60% of informal market transactions across Africa occur via vernacular speech. Conventional USSD text menus suffer 35%+ abandonment due to language and literacy friction. Voice agents powered by Sahara unlock seamless conversational financial services.',
    typicalUsers: [
      'Informal Market Traders & Bodaboda Drivers',
      'Mobile Money (M-Pesa, MoMo, OPay) Subscribers',
      'Microfinance Loan Officers',
      'Bank Customer Care Call Centers',
    ],
    recommendedLanguages: [
      'Nigerian Pidgin-English',
      'Hausa-English',
      'Swahili-English',
      'Kinyarwanda-French',
      'Akan-English',
    ],
    datasetUsed: 'Intron Afriswitch (Conversational & Financial Corpus)',
    agenticWorkflowSteps: [
      '1. Low-latency Sahara speech-to-text with continuous streaming (p50: 295ms)',
      '2. Conversational Intent and Entity Extraction (Recipient, Amount, Purpose)',
      '3. Multi-factor biometric or PIN vocal confirmation prompt',
      '4. Interfacing with Core Banking / Mobile Money API to execute transaction',
      '5. Vernacular voice playback receipt and instant transaction audit log',
    ],
    sampleUseCase: {
      title: 'SautiPay: Vernacular Voice Remittance & Airtime Agent',
      scenario: 'Market merchant in Lagos transferring funds to a supplier while busy handling physical goods.',
      speechTranscript:
        'Abeg help me send fifty thousand naira to Mama Chinedu Providus Bank account, make una put description as supply of yams.',
      extractedData: {
        'Intent': 'SEND_BANK_TRANSFER',
        'Amount': 'NGN 50,000',
        'Beneficiary': 'Mama Chinedu',
        'Destination Institution': 'Providus Bank',
        'Narration': 'Supply of yams',
      },
      automatedAction:
        'Resolved recipient NUBAN from saved contacts, prompted for 4-digit biometric voice PIN, executed NIP instant settlement.',
    },
  },
  {
    id: 'Agriculture & Education',
    name: 'Agriculture & Farmer Advisory',
    badge: 'Agronomy & Food Security',
    iconName: 'Sprout',
    tagline: 'Crop disease diagnosis, extension services & vernacular education',
    description:
      'Smallholder farmers describe pest infestations, soil symptoms, and rainfall patterns in regional dialects (Luganda, Akan, Swahili) interlaced with chemical or market terms. Sahara empowers multimodal voice bots to deliver instant agronomic extension.',
    realWorldImpact:
      'Smallholder agriculture sustains 70% of Africa’s population. Extension worker coverage is less than 1 officer per 3,000 farmers. Real-time voice advisory prevents up to 30% harvest loss from invasive pests like Fall Armyworm.',
    typicalUsers: [
      'Smallholder Grain & Coffee Farmers',
      'Government Agricultural Extension Agents',
      'Agro-dealer Input Distributors',
      'Rural Primary School Students & Tutors',
    ],
    recommendedLanguages: [
      'Luganda-English',
      'Swahili-English',
      'Akan-English',
      'Hausa-English',
      'Wolof-French',
    ],
    datasetUsed: 'Intron Afriswitch (Agricultural & Ecological Corpus)',
    agenticWorkflowSteps: [
      '1. Capture audio via low-bandwidth WhatsApp voice note or IVR toll-free line',
      '2. Transcribe mixed vernacular agrarian speech through Sahara ASR',
      '3. Match localized crop symptom description against regional agronomic knowledge base',
      '4. Generate calibrated dosage, safety guidelines, and local agro-dealer inventory link',
      '5. Return synthesized voice response in the farmer’s spoken dialect',
    ],
    sampleUseCase: {
      title: 'KilimoVoice: Smart Extension Agent for Smallholders',
      scenario: 'Coffee farmer in eastern Uganda calling extension hotline regarding diseased leaves.',
      speechTranscript:
        "Ebirime byange eby'ebijanjaalo birina amabala amamyufu ku makoola, what chemical spray can treat this bean rust?",
      extractedData: {
        'Crop Type': 'Common Beans (Ebijanjaalo)',
        'Symptom': 'Red/rust-colored lesions on leaves (Amabala amamyufu)',
        'Pathogen Suspected': 'Uromyces appendiculatus (Bean Rust)',
        'Recommended Action': 'Mancozeb or Copper-based systemic fungicide application',
      },
      automatedAction:
        'Calculated safe spray ratio (40g per 20L knapsack), mapped nearest certified agro-vet input shop in Mbale.',
    },
  },
  {
    id: 'Legal & Public Services',
    name: 'Legal Aid & Civic Governance',
    badge: 'Civic Justice & Access',
    iconName: 'Scale',
    tagline: 'Court transcription, legal aid, citizen services & civic reporting',
    description:
      'Enabling citizens in customary or magistrate courts to speak naturally in their mother tongue while referencing statute numbers, police reports, and administrative forms in English or French.',
    realWorldImpact:
      'Backlogged court registries and citizen hotlines in Nigeria, Kenya, and South Africa suffer months of delay due to manual tape transcription. Sahara provides verbatim multi-lingual records respecting evidentiary integrity.',
    typicalUsers: [
      'Magistrate Court Clerks & Stenographers',
      'Legal Aid Clinic Paralegals',
      'Municipal Infrastructure Dispatchers',
      'Human Rights Ombudsmen',
    ],
    recommendedLanguages: [
      'Hausa-English',
      'Yoruba-English',
      'Zulu-English',
      'Afrikaans-English',
      'Igbo-English',
    ],
    datasetUsed: 'Intron Afriswitch (Administrative & Civic Subsets)',
    agenticWorkflowSteps: [
      '1. Continuous session transcription with speaker diarization',
      '2. Verbatim preservation of witness code-switching statements for court record',
      '3. Extraction of complaint category, location, and statutory references',
      '4. Generation of official case brief and automated tracking ticket',
      '5. Dispatching notification to relevant municipal engineering or legal aid team',
    ],
    sampleUseCase: {
      title: 'HakiCivic: Municipal Infrastructure & Court Voice Dispatcher',
      scenario: 'Resident reporting dangerous municipal electric transformer hazard.',
      speechTranscript:
        'Ina son in yi reporting na transformer da ya lalace a community mu, wutar lantarki ta dade ba ta aiki.',
      extractedData: {
        'Category': 'Public Electrical Hazard & Outage',
        'Affected Asset': 'Neighborhood Power Distribution Transformer',
        'Status': 'Severe breakdown, extended power outage',
        'Language Switch': 'Hausa matrix with English technical terms',
      },
      automatedAction:
        'Logged priority municipal maintenance ticket #NG-KAN-8492, alerted regional distribution company DISCO emergency squad.',
    },
  },
];
