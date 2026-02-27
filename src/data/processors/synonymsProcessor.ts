import fs from 'fs';
import path from 'path';
import { initDatabase, db } from '../database';

// 从 ielts-materials 中提取同义词数据
async function processSynonyms() {
  try {
    // 初始化数据库
    await initDatabase();

    // 读取 vocabulary.md 文件
    const vocabularyPath = path.join(__dirname, '../../../ielts-materials/vocabulary.md');
    const content = fs.readFileSync(vocabularyPath, 'utf8');

    // 解析同义词数据
    const synonymMap = new Map<string, string[]>();

    // 简单的解析逻辑，提取单词和其同义词
    // 注意：这里的解析逻辑可能需要根据实际文件格式进行调整
    const lines = content.split('\n');
    let currentWord = '';
    let synonyms: string[] = [];

    for (const line of lines) {
      // 查找单词行
      const wordMatch = line.match(/\* \*\*(\w+)\*\*/);
      if (wordMatch) {
        // 如果有当前单词和同义词，保存
        if (currentWord && synonyms.length > 0) {
          synonymMap.set(currentWord, synonyms);
        }
        // 开始新单词
        currentWord = wordMatch[1];
        synonyms = [];
      }
      
      // 查找同义词行
      const synonymMatch = line.match(/Synonyms: (.+)/);
      if (synonymMatch && currentWord) {
        const syns = synonymMatch[1].split(',').map(s => s.trim());
        synonyms.push(...syns);
      }
    }

    // 保存最后一个单词
    if (currentWord && synonyms.length > 0) {
      synonymMap.set(currentWord, synonyms);
    }

    // 处理 List_1.md 文件
    const list1Path = path.join(__dirname, '../../../ielts-materials/assets/Vocabulary/List_1.md');
    if (fs.existsSync(list1Path)) {
      const list1Content = fs.readFileSync(list1Path, 'utf8');
      const list1Lines = list1Content.split('\n');
      let list1CurrentWord = '';
      let list1Synonyms: string[] = [];

      for (const line of list1Lines) {
        // 查找单词行
        const wordMatch = line.match(/## \d+\. (\w+)/);
        if (wordMatch) {
          // 如果有当前单词和同义词，保存
          if (list1CurrentWord && list1Synonyms.length > 0) {
            if (synonymMap.has(list1CurrentWord)) {
              const existingSynonyms = synonymMap.get(list1CurrentWord)!;
              synonymMap.set(list1CurrentWord, [...new Set([...existingSynonyms, ...list1Synonyms])]);
            } else {
              synonymMap.set(list1CurrentWord, list1Synonyms);
            }
          }
          // 开始新单词
          list1CurrentWord = wordMatch[1];
          list1Synonyms = [];
        }
        
        // 查找同义词行
        const synonymMatch = line.match(/Synonyms: (.+)/);
        if (synonymMatch && list1CurrentWord) {
          const syns = synonymMatch[1].split(',').map(s => s.trim());
          list1Synonyms.push(...syns);
        }
      }

      // 保存最后一个单词
      if (list1CurrentWord && list1Synonyms.length > 0) {
        if (synonymMap.has(list1CurrentWord)) {
          const existingSynonyms = synonymMap.get(list1CurrentWord)!;
          synonymMap.set(list1CurrentWord, [...new Set([...existingSynonyms, ...list1Synonyms])]);
        } else {
          synonymMap.set(list1CurrentWord, list1Synonyms);
        }
      }
    }

    // 导入同义词数据到数据库
    for (const [word, syns] of synonymMap.entries()) {
      try {
        // 查找单词 ID
        const wordRecord = await db!.get(
          `SELECT id FROM words WHERE word = ?`,
          [word]
        );

        if (wordRecord) {
          const wordId = wordRecord.id;

          // 插入同义词
          for (const synonym of syns) {
            await db!.run(
              `INSERT OR IGNORE INTO synonyms (word_id, synonym, created_at)
               VALUES (?, ?, CURRENT_TIMESTAMP)`,
              [wordId, synonym]
            );
          }

          console.log(`Processed synonyms for word: ${word}`);
        }
      } catch (error) {
        console.error(`Error processing synonyms for word ${word}:`, error);
      }
    }

    console.log('Synonyms processing completed!');
  } catch (error) {
    console.error('Error processing synonyms data:', error);
  }
}

export default processSynonyms;
