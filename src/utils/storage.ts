// 本地存储管理工具

// 存储键名
const STORAGE_KEYS = {
  WORD_STUDY_PROGRESS: 'wordStudyProgress',
  READING_STUDY_RESULTS: 'readingStudyResults',
  USER_SETTINGS: 'userSettings'
};

// 存储数据类型
export interface WordProgress {
  studiedWords: number;
  progress: number[];
  currentWordId: number;
}

export interface ArticleResult {
  articleId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'zh';
  notifications: boolean;
}

// 默认用户设置
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  language: 'en',
  notifications: true
};

// 存储操作类
class StorageManager {
  // 保存数据
  save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  // 获取数据
  get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Error getting data from localStorage:', error);
      return defaultValue;
    }
  }

  // 删除数据
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data from localStorage:', error);
    }
  }

  // 清除所有数据
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // 导出所有数据
  exportData(): string {
    try {
      const data = {
        wordStudyProgress: this.getWordStudyProgress(),
        readingStudyResults: this.getReadingStudyResults(),
        userSettings: this.getUserSettings()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '{}';
    }
  }

  // 导入数据
  importData(data: string): boolean {
    try {
      const parsedData = JSON.parse(data);
      
      if (parsedData.wordStudyProgress) {
        this.saveWordStudyProgress(parsedData.wordStudyProgress);
      }
      
      if (parsedData.readingStudyResults) {
        this.saveReadingStudyResults(parsedData.readingStudyResults);
      }
      
      if (parsedData.userSettings) {
        this.saveUserSettings(parsedData.userSettings);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // 单词学习进度操作
  saveWordStudyProgress(progress: WordProgress): void {
    this.save(STORAGE_KEYS.WORD_STUDY_PROGRESS, progress);
  }

  getWordStudyProgress(): WordProgress | null {
    return this.get<WordProgress | null>(STORAGE_KEYS.WORD_STUDY_PROGRESS, null);
  }

  // 阅读学习结果操作
  saveReadingStudyResults(results: ArticleResult[]): void {
    this.save(STORAGE_KEYS.READING_STUDY_RESULTS, results);
  }

  getReadingStudyResults(): ArticleResult[] {
    return this.get<ArticleResult[]>(STORAGE_KEYS.READING_STUDY_RESULTS, []);
  }

  // 用户设置操作
  saveUserSettings(settings: UserSettings): void {
    this.save(STORAGE_KEYS.USER_SETTINGS, settings);
  }

  getUserSettings(): UserSettings {
    return this.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS, DEFAULT_SETTINGS);
  }
}

// 导出单例实例
export const storageManager = new StorageManager();
