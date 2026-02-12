import { STORAGE_KEYS, DEFAULT_SCHEDULE_TEMPLATE, INITIAL_KNOWLEDGE_BASE, INITIAL_FLASHCARDS, DEFAULT_EXAM_DATE_TEMPLATE } from '../constants';
import { MockTest, ErrorLogEntry, DailyLog, InfoItem, SyllabusStatus, SchedulePhase, KnowledgeItem, DrillStats, CheatSheetData, Flashcard, UserProfile } from '../types';
import { saveFileToDisk } from '../utils/fileSystem';

const BACKUP_KEY = 'gate_forge_backup';

export const getUserProfile = (): UserProfile => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (data) {
    const profile = JSON.parse(data);
    if (!profile.targetYears) {
        profile.targetYears = [2027];
    }
    return profile;
  }
  return { name: 'Candidate', examDate: DEFAULT_EXAM_DATE_TEMPLATE, targetYears: [2027], isSetupComplete: false };
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  createBackup();
};

export const getMocks = (): MockTest[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MOCKS);
  return data ? JSON.parse(data) : [];
};

export const getErrors = (): ErrorLogEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ERRORS);
  return data ? JSON.parse(data) : [];
};

export const getDailyLogs = (): DailyLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY);
  return data ? JSON.parse(data) : [];
};

export const getInfoItems = (): InfoItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INFO_IMAGES);
  if (!data) return [];
  const parsed = JSON.parse(data);
  return parsed.map((item: any) => ({
    ...item,
    type: item.type || 'image'
  }));
};

export const getSyllabusStatus = (): SyllabusStatus => {
  const data = localStorage.getItem(STORAGE_KEYS.SYLLABUS);
  return data ? JSON.parse(data) : {};
};

export const getSchedule = (): SchedulePhase[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
  if (data) {
    return JSON.parse(data);
  }
  return DEFAULT_SCHEDULE_TEMPLATE; 
};

export const getKnowledgeBase = (): KnowledgeItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
  if (data) {
    const parsed = JSON.parse(data);
    if (parsed.length === 0) return INITIAL_KNOWLEDGE_BASE;
    return parsed;
  }
  return INITIAL_KNOWLEDGE_BASE;
};

export const saveKnowledgeItem = (item: KnowledgeItem) => {
  try {
    const current = getKnowledgeBase();
    const index = current.findIndex(i => i.id === item.id);
    let updated;
    if (index >= 0) {
      updated = [...current];
      updated[index] = item;
    } else {
      updated = [...current, item];
    }
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(updated));
    createBackup();
  } catch (error) {
    console.error("Failed to save knowledge item:", error);
    alert("Storage full.");
  }
};

export const getCalcStats = (): DrillStats => {
  const data = localStorage.getItem(STORAGE_KEYS.CALC_STATS);
  return data ? JSON.parse(data) : { totalAttempts: 0, correct: 0, avgTimeSec: 0, bestTimeSec: 9999 };
};

export const saveCalcStats = (stats: DrillStats) => {
  localStorage.setItem(STORAGE_KEYS.CALC_STATS, JSON.stringify(stats));
};

export const getCheatSheet = (): CheatSheetData => {
  const data = localStorage.getItem(STORAGE_KEYS.CHEAT_SHEET);
  return data ? JSON.parse(data) : { content: "# My GATE Cheat Sheet\n\n- Add formulas here...", lastModified: new Date().toISOString() };
};

export const saveCheatSheet = (data: CheatSheetData) => {
  localStorage.setItem(STORAGE_KEYS.CHEAT_SHEET, JSON.stringify(data));
};

export const getFlashcards = (): Flashcard[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
  return data ? JSON.parse(data) : INITIAL_FLASHCARDS;
};

export const saveFlashcards = (cards: Flashcard[]) => {
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(cards));
  createBackup();
};

export const addFlashcard = (card: Flashcard) => {
  const current = getFlashcards();
  saveFlashcards([...current, card]);
};

export const createBackup = () => {
  try {
    const backup = {
      profile: getUserProfile(),
      mocks: getMocks(),
      errors: getErrors(),
      daily: getDailyLogs(),
      infoImages: getInfoItems(),
      syllabus: getSyllabusStatus(),
      schedule: getSchedule(),
      knowledge: getKnowledgeBase(),
      calcStats: getCalcStats(),
      cheatSheet: getCheatSheet(),
      flashcards: getFlashcards(),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
  } catch (e) {
    console.error("Auto-backup failed:", e);
  }
};

export const saveMock = (mock: MockTest) => {
  try {
    const mocks = getMocks();
    localStorage.setItem(STORAGE_KEYS.MOCKS, JSON.stringify([mock, ...mocks]));
    createBackup(); 
  } catch (error) {
    console.error("Failed to save mock:", error);
    alert("Failed to save mock test. Your local storage might be full.");
  }
};

export const saveError = (error: ErrorLogEntry) => {
  try {
    if (error.imageUrl && error.imageUrl.startsWith('data:')) {
       const fileName = `err_${Date.now()}.jpg`;
       error.imageUrl = saveFileToDisk(error.imageUrl, fileName);
    }

    const errors = getErrors();
    localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify([error, ...errors]));
    createBackup(); 
  } catch (error) {
    console.error("Failed to save error log:", error);
    alert("Failed to save error log. Your local storage might be full.");
  }
};

export const saveDailyLog = (log: DailyLog) => {
  try {
    const logs = getDailyLogs();
    const filtered = logs.filter(l => l.date !== log.date);
    localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify([log, ...filtered]));
    createBackup(); 
  } catch (error) {
    console.error("Failed to save daily log:", error);
    alert("Failed to save daily log. Your local storage might be full.");
  }
};

export const saveInfoItem = (item: InfoItem) => {
  try {
    if (item.dataUrl && item.dataUrl.startsWith('data:')) {
        const ext = item.type === 'pdf' ? 'pdf' : 'jpg';
        const fileName = `res_${Date.now()}.${ext}`;
        item.dataUrl = saveFileToDisk(item.dataUrl, fileName);
    }

    const items = getInfoItems();
    localStorage.setItem(STORAGE_KEYS.INFO_IMAGES, JSON.stringify([item, ...items]));
    createBackup();
  } catch (error) {
    console.error("Failed to save info item:", error);
    alert("Failed to save item. Your local storage might be full. Try deleting old items or using smaller files.");
  }
};

export const deleteInfoItem = (id: string) => {
  try {
    const items = getInfoItems().filter(img => img.id !== id);
    localStorage.setItem(STORAGE_KEYS.INFO_IMAGES, JSON.stringify(items));
    createBackup();
  } catch (error) {
    console.error("Failed to delete info item:", error);
  }
};

export const saveSyllabusStatus = (status: SyllabusStatus) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SYLLABUS, JSON.stringify(status));
    createBackup();
  } catch (error) {
    console.error("Failed to save syllabus status:", error);
  }
};

export const saveSchedule = (schedule: SchedulePhase[]) => {
  try {
    const sorted = [...schedule].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(sorted));
    createBackup();
  } catch (error) {
    console.error("Failed to save schedule:", error);
  }
};

export const resetSchedule = () => {
  saveSchedule(DEFAULT_SCHEDULE_TEMPLATE);
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.MOCKS);
  localStorage.removeItem(STORAGE_KEYS.ERRORS);
  localStorage.removeItem(STORAGE_KEYS.DAILY);
  localStorage.removeItem(STORAGE_KEYS.INFO_IMAGES);
  localStorage.removeItem(STORAGE_KEYS.SYLLABUS);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
  localStorage.removeItem(STORAGE_KEYS.KNOWLEDGE);
  localStorage.removeItem(STORAGE_KEYS.CALC_STATS);
  localStorage.removeItem(STORAGE_KEYS.CHEAT_SHEET);
  localStorage.removeItem(STORAGE_KEYS.FLASHCARDS);
};

export const restoreBackup = (): boolean => {
  const data = localStorage.getItem(BACKUP_KEY);
  if (!data) return false;
  
  try {
    const parsed = JSON.parse(data);
    if (parsed.profile) localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(parsed.profile));
    if (parsed.mocks) localStorage.setItem(STORAGE_KEYS.MOCKS, JSON.stringify(parsed.mocks));
    if (parsed.errors) localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(parsed.errors));
    if (parsed.daily) localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(parsed.daily));
    if (parsed.infoImages) localStorage.setItem(STORAGE_KEYS.INFO_IMAGES, JSON.stringify(parsed.infoImages));
    if (parsed.syllabus) localStorage.setItem(STORAGE_KEYS.SYLLABUS, JSON.stringify(parsed.syllabus));
    if (parsed.schedule) localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(parsed.schedule));
    if (parsed.knowledge) localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(parsed.knowledge));
    if (parsed.calcStats) localStorage.setItem(STORAGE_KEYS.CALC_STATS, JSON.stringify(parsed.calcStats));
    if (parsed.cheatSheet) localStorage.setItem(STORAGE_KEYS.CHEAT_SHEET, JSON.stringify(parsed.cheatSheet));
    if (parsed.flashcards) localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(parsed.flashcards));
    return true;
  } catch (e) {
    console.error("Restore failed:", e);
    return false;
  }
};

export const getBackupTimestamp = (): string | null => {
  const data = localStorage.getItem(BACKUP_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data).timestamp;
  } catch {
    return null;
  }
};

export const getAllDataForExport = () => {
  return {
    profile: getUserProfile(),
    mocks: getMocks(),
    errors: getErrors(),
    daily: getDailyLogs(),
    infoImages: getInfoItems(),
    syllabus: getSyllabusStatus(),
    schedule: getSchedule(),
    knowledge: getKnowledgeBase(),
    calcStats: getCalcStats(),
    cheatSheet: getCheatSheet(),
    flashcards: getFlashcards(),
    timestamp: new Date().toISOString(),
    version: '1.5'
  };
};

export const importDataFromFile = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (!data.timestamp) throw new Error("Invalid backup file format");
    
    if (data.profile) localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.profile));
    if (data.mocks) localStorage.setItem(STORAGE_KEYS.MOCKS, JSON.stringify(data.mocks));
    if (data.errors) localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(data.errors));
    if (data.daily) localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(data.daily));
    if (data.infoImages) localStorage.setItem(STORAGE_KEYS.INFO_IMAGES, JSON.stringify(data.infoImages));
    if (data.syllabus) localStorage.setItem(STORAGE_KEYS.SYLLABUS, JSON.stringify(data.syllabus));
    if (data.schedule) localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(data.schedule));
    if (data.knowledge) localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(data.knowledge));
    if (data.calcStats) localStorage.setItem(STORAGE_KEYS.CALC_STATS, JSON.stringify(data.calcStats));
    if (data.cheatSheet) localStorage.setItem(STORAGE_KEYS.CHEAT_SHEET, JSON.stringify(data.cheatSheet));
    if (data.flashcards) localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(data.flashcards));
    
    createBackup(); 
    return true;
  } catch (e) {
    console.error("File import failed", e);
    return false;
  }
};
