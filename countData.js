const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function countData() {
  try {
    // 连接到数据库
    const db = await open({
      filename: 'src/data/ielts_vocabulary.db',
      driver: sqlite3.Database
    });

    // 统计words表的记录数
    const wordsCount = await db.get('SELECT COUNT(*) as count FROM words');
    console.log(`Words count: ${wordsCount.count}`);

    // 统计synonyms表的记录数
    const synonymsCount = await db.get('SELECT COUNT(*) as count FROM synonyms');
    console.log(`Synonyms count: ${synonymsCount.count}`);

    // 统计word_occurrences表的记录数
    const occurrencesCount = await db.get('SELECT COUNT(*) as count FROM word_occurrences');
    console.log(`Word occurrences count: ${occurrencesCount.count}`);

    // 关闭数据库连接
    await db.close();
  } catch (error) {
    console.error('Error counting data:', error);
  }
}

countData();