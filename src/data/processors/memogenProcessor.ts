import fs from 'fs';
import path from 'path';
import { initDatabase, db } from '../database';

// 从 memogen-ielts-flashcards 中提取难度等级信息
async function processMemogen() {
  try {
    // 初始化数据库
    await initDatabase();

    // 读取 memo.json 文件
    const memoPath = path.join(__dirname, '../../../memogen-ielts-flashcards/memo.json');
    const memoData = JSON.parse(fs.readFileSync(memoPath, 'utf8'));

    // 处理每个类别
    for (const category of memoData.categories) {
      // 处理每个单词
      for (const wordData of category.words) {
        try {
          const word = wordData.word;
          const difficultyLevel = wordData.level;
          const definition = wordData.definition;
          const partOfSpeech = wordData.type;
          const exampleSentence = wordData.examples?.sentence || '';

          // 检查单词是否已存在
          const existingWord = await db!.get(
            `SELECT id FROM words WHERE word = ?`,
            [word]
          );

          if (existingWord) {
            // 单词已存在，更新信息
            await db!.run(
              `UPDATE words SET 
               difficulty_level = ?, 
               definition = ?, 
               part_of_speech = ?, 
               example_sentence = ?, 
               updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`,
              [difficultyLevel, definition, partOfSpeech, exampleSentence, existingWord.id]
            );
          } else {
            // 单词不存在，插入新记录
            await db!.run(
              `INSERT INTO words (word, difficulty_level, definition, part_of_speech, example_sentence, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [word, difficultyLevel, definition, partOfSpeech, exampleSentence]
            );
          }

