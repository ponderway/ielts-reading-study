import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { initDatabase, db } from '../database';

// 从 most-repeated-vocabulary-IELTS 数据库中提取考频数据
async function processMostRepeated() {
  try {
    // 初始化目标数据库
    await initDatabase();

    // 连接到 most-repeated-vocabulary-IELTS 数据库
    const mostRepeatedDbPath = path.join(__dirname, '../../../most-repeated-vocabulary-IELTS/ielts_word_data.db');
    const mostRepeatedDb = await open({
      filename: mostRepeatedDbPath,
      driver: sqlite3.Database
    });

    // 查询单词数据
    const wordMetadata = await mostRepeatedDb.all(
      `SELECT word, count, book FROM word_metadata`
    );

    // 处理每个单词
    for (const row of wordMetadata) {
      try {
        // 检查单词是否已存在
        const existingWord = await db!.get(
          `SELECT id FROM words WHERE word = ?`,
          [row.word]
        );

        let wordId: number;

        if (existingWord) {
          // 单词已存在，更新频率
          wordId = existingWord.id;
          await db!.run(
            `UPDATE words SET frequency = frequency + ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [row.count, wordId]
          );
        } else {
          // 单词不存在，插入新记录
          const result = await db!.run(
            `INSERT INTO words (word, frequency, created_at, updated_at)
             VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [row.word, row.count]
          );
          wordId = result.lastID;
        }

        // 插入单词出现记录
        await db!.run(
          `INSERT OR IGNORE INTO word_occurrences (word_id, book_number, frequency, created_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [wordId, row.book, row.count]
        );

        console.log(`Processed most-repeated word: ${row.word} (Count: ${row.count}, Book: ${row.book})`);
      } catch (error) {
        console.error(`Error processing most-repeated word ${row.word}:`, error);
      }
    }

    // 关闭连接
    await mostRepeatedDb.close();

    console.log('Most-repeated vocabulary processing completed!');
  } catch (error) {
    console.error('Error processing most-repeated vocabulary data:', error);
  }
}

export default processMostRepeated;
