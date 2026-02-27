import fs from 'fs';
import path from 'path';
import { initDatabase, db } from '../database';

// 从 AWL JSON 文件中提取单词数据
async function processAWL() {
  try {
    // 初始化数据库
    await initDatabase();

    // 读取 AWL JSON 文件
    const awlPath = path.join(__dirname, '../../../machine_readable_wordlists/Academic/AWL/AWL.json');
    const awlData = JSON.parse(fs.readFileSync(awlPath, 'utf8'));

    // 遍历每个子列表
    for (const [sublistKey, words] of Object.entries(awlData)) {
      // 提取子列表编号
      const sublistNumber = parseInt(sublistKey.split('_')[1]);
      
      // 遍历每个单词
      for (const [word, data] of Object.entries(words as any)) {
        try {
          // 插入单词到数据库
          const result = await db!.run(
            `INSERT OR IGNORE INTO words (word, awl_sublist, created_at, updated_at)
             VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [word, sublistNumber]
          );

          // 如果单词已存在，更新 AWL 子列表
          if (result.changes === 0) {
            await db!.run(
              `UPDATE words SET awl_sublist = ?, updated_at = CURRENT_TIMESTAMP
               WHERE word = ?`,
              [sublistNumber, word]
            );
          }

          console.log(`Processed AWL word: ${word} (Sublist ${sublistNumber})`);
        } catch (error) {
          console.error(`Error processing AWL word ${word}:`, error);
        }
      }
    }

    console.log('AWL processing completed!');
  } catch (error) {
    console.error('Error processing AWL data:', error);
  }
}

export default processAWL;
