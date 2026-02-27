import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// 定义单词表结构
interface Word {
  id: number;
  word: string;
  definition: string;
  part_of_speech: string;
  phonetic: string;
  frequency: number;
  difficulty_level: string;
  awl_sublist: number;
  example_sentence: string;
  created_at: string;
  updated_at: string;
}

// 定义同义词表结构
interface Synonym {
  id: number;
  word_id: number;
  synonym: string;
  created_at: string;
}

// 定义话题表结构
interface Topic {
  id: number;
  topic_name: string;
  created_at: string;
}

// 定义单词话题关联表结构
interface WordTopic {
  id: number;
  word_id: number;
  topic_id: number;
  created_at: string;
}

// 定义单词出现表结构
interface WordOccurrence {
  id: number;
  word_id: number;
  book_number: string;
  frequency: number;
  created_at: string;
}

// 数据库连接实例
let db: Database | null = null;

// 初始化数据库
async function initDatabase() {
  if (!db) {
    db = await open({
      filename: 'src/data/ielts_vocabulary.db',
      driver: sqlite3.Database
    });

    // 创建表结构
    await db.exec(`
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL UNIQUE,
        definition TEXT,
        part_of_speech TEXT,
        phonetic TEXT,
        frequency INTEGER DEFAULT 0,
        difficulty_level TEXT,
        awl_sublist INTEGER,
        example_sentence TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS synonyms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        synonym TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (word_id) REFERENCES words (id)
      );

      CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS word_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        topic_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (word_id) REFERENCES words (id),
        FOREIGN KEY (topic_id) REFERENCES topics (id)
      );

      CREATE TABLE IF NOT EXISTS word_occurrences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        book_number TEXT NOT NULL,
        frequency INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (word_id) REFERENCES words (id)
      );

      CREATE INDEX IF NOT EXISTS idx_words_word ON words (word);
      CREATE INDEX IF NOT EXISTS idx_synonyms_word_id ON synonyms (word_id);
      CREATE INDEX IF NOT EXISTS idx_word_topics_word_id ON word_topics (word_id);
      CREATE INDEX IF NOT EXISTS idx_word_topics_topic_id ON word_topics (topic_id);
      CREATE INDEX IF NOT EXISTS idx_word_occurrences_word_id ON word_occurrences (word_id);
      CREATE INDEX IF NOT EXISTS idx_word_occurrences_book_number ON word_occurrences (book_number);
    `);
  }
  return db;
}

// 导出数据库操作函数
export {
  initDatabase,
  db
};

export type {
  Word,
  Synonym,
  Topic,
  WordTopic,
  WordOccurrence
};
