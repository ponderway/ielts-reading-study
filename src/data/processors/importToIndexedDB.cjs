const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// 打开 SQLite 数据库
async function openSqliteDb() {
  return await open({
    filename: 'src/data/ielts_vocabulary.db',
    driver: sqlite3.Database
  });
}

// 导出数据到 JSON 文件
async function exportDataToJson() {
  try {
    const db = await openSqliteDb();
    
    // 导出单词数据
    const words = await db.all(`
      SELECT id, word, definition, part_of_speech, phonetic, frequency, difficulty_level, awl_sublist, example_sentence, created_at, updated_at
      FROM words
    `);
    
    // 导出同义词数据
    const synonyms = await db.all(`
      SELECT id, word_id, synonym, created_at
      FROM synonyms
    `);
    
    // 关闭数据库连接
    await db.close();
    
    return { words, synonyms };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

// 主函数
async function main() {
  try {
    console.log('Exporting data from SQLite database...');
    const data = await exportDataToJson();
    
    console.log(`Exported ${data.words.length} words and ${data.synonyms.length} synonyms`);
    
    // 将数据写入 JSON 文件
    const fs = require('fs');
    fs.writeFileSync('src/data/exported_data.json', JSON.stringify(data, null, 2));
    
    console.log('Data exported to src/data/exported_data.json');
  } catch (error) {
    console.error('Error:', error);
  }
}

// 运行主函数
main();
