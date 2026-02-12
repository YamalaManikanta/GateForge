
export enum Subject {
  CN = 'Computer Networks',
  OS = 'Operating Systems',
  DBMS = 'DBMS',
  TOC = 'Theory of Computation',
  CD = 'Compiler Design',
  DLD = 'Digital Logic',
  COA = 'COA',
  DS = 'Data Structures',
  ALGO = 'Algorithms',
  DM = 'Discrete Math',
  EM = 'Engg Math',
  GA = 'General Aptitude',
}

export enum MistakeType {
  CONCEPT = 'Conceptual Gap',
  SILLY = 'Silly Mistake',
  TIME = 'Time Management',
  GUESS = 'Guess Work',
  SKIPPED = 'Unattempted (Fear/Unknown)',
}

export interface UserProfile {
  name: string;
  examDate: string;
  targetYears: number[];
  isSetupComplete: boolean;
}

export interface SchedulePhase {
  id: string;
  name: string;
  start: string;
  end: string;
  isUndecided?: boolean;
}

export interface MockTest {
  id: string;
  date: string;
  provider: string;
  totalMarks: number;
  score: number;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  timeSpentMinutes: number;
}

export interface ErrorLogEntry {
  id: string;
  date: string;
  subject: Subject;
  topic: string;
  mistakeType: MistakeType;
  timeSpentSeconds: number;
  notes: string;
  reviewCount: number;
  imageUrl?: string;
}

// InfoItem represents a saved syllabus resource like an image or a PDF
export interface InfoItem {
  id: string;
  title: string;
  date: string;
  dataUrl: string;
  type: 'image' | 'pdf';
}

export interface DailyLog {
  id: string;
  date: string;
  studyHours: { [key in Subject]?: number };
  topicsCovered: string[];
  practiceQuestions: number;
  practiceCorrect: number;
  revisionDone: boolean;
  focusLevel: 1 | 2 | 3 | 4 | 5;
  weakestConcept: string;
}

export interface SyllabusStatus {
  [subjectKey: string]: {
    completed: boolean;
    rev1: boolean;
    rev2: boolean;
    rev3: boolean;
  };
}

export interface KnowledgeItem {
  id: string;
  keywords: string[];
  answer: string;
  category: Subject | 'General';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface DrillStats {
  totalAttempts: number;
  correct: number;
  avgTimeSec: number;
  bestTimeSec: number;
}

export interface CheatSheetData {
  content: string;
  lastModified: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: Subject;
  box: number;
  nextReviewDate: string;
  lastReviewed?: string;
}

export interface GhostData {
  name: string;
  chartData: { name: string; score: number }[];
}
