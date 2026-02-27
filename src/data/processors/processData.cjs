const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// 数据库连接实例
let db = null;

// 错误重试函数
async function retryOperation(operation, maxRetries = 3, delay = 100) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (error.code === 'SQLITE_BUSY' && i < maxRetries - 1) {
        console.log(`Database busy, retrying... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// 初始化数据库
async function initDatabase() {
  if (!db) {
    db = await open({
      filename: 'src/data/ielts_vocabulary.db',
      driver: sqlite3.Database
    });

    // 创建表结构
    await retryOperation(async () => {
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
    });
  }
  return db;
}

// 从 AWL JSON 文件中提取单词数据
async function processAWL() {
  try {
    // 初始化数据库
    await initDatabase();

    // 读取 AWL JSON 文件
    const awlPath = path.join(__dirname, '../../../machine_readable_wordlists/Academic/AWL/AWL.json');
    const awlData = JSON.parse(fs.readFileSync(awlPath, 'utf8'));

    // 开始事务
    await retryOperation(async () => {
      await db.run('BEGIN TRANSACTION');
    });

    try {
      // 遍历每个子列表
      for (const [sublistKey, words] of Object.entries(awlData)) {
        // 提取子列表编号
        const sublistNumber = parseInt(sublistKey.split('_')[1]);
        
        // 批量处理单词
        const wordValues = [];
        for (const [word, data] of Object.entries(words)) {
          wordValues.push([word, sublistNumber]);
        }

        // 批量插入或更新
        for (const [word, sublist] of wordValues) {
          await retryOperation(async () => {
            await db.run(
              `INSERT OR IGNORE INTO words (word, awl_sublist, created_at, updated_at)
               VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [word, sublist]
            );
          });

          // 如果单词已存在，更新 AWL 子列表
          await retryOperation(async () => {
            await db.run(
              `UPDATE words SET awl_sublist = ?, updated_at = CURRENT_TIMESTAMP
               WHERE word = ?`,
              [sublist, word]
            );
          });

          console.log(`Processed AWL word: ${word} (Sublist ${sublist})`);
        }
      }

      // 提交事务
      await retryOperation(async () => {
        await db.run('COMMIT');
      });
    } catch (error) {
      // 回滚事务
      await retryOperation(async () => {
        await db.run('ROLLBACK');
      });
      throw error;
    }

    console.log('AWL processing completed!');
  } catch (error) {
    console.error('Error processing AWL data:', error);
  }
}

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

    // 开始事务
    await retryOperation(async () => {
      await db.run('BEGIN TRANSACTION');
    });

    try {
      // 批量处理单词
      const batchSize = 100;
      for (let i = 0; i < wordMetadata.length; i += batchSize) {
        const batch = wordMetadata.slice(i, i + batchSize);

        for (const row of batch) {
          try {
            // 检查单词是否已存在
            const existingWord = await retryOperation(async () => {
              return await db.get(
                `SELECT id FROM words WHERE word = ?`,
                [row.word]
              );
            });

            let wordId;

            if (existingWord) {
              // 单词已存在，更新频率
              wordId = existingWord.id;
              await retryOperation(async () => {
                await db.run(
                  `UPDATE words SET frequency = frequency + ?, updated_at = CURRENT_TIMESTAMP
                   WHERE id = ?`,
                  [row.count, wordId]
                );
              });
            } else {
              // 单词不存在，插入新记录
              const result = await retryOperation(async () => {
                return await db.run(
                  `INSERT INTO words (word, frequency, created_at, updated_at)
                   VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                  [row.word, row.count]
                );
              });
              wordId = result.lastID;
            }

            // 插入单词出现记录
            await retryOperation(async () => {
              await db.run(
                `INSERT OR IGNORE INTO word_occurrences (word_id, book_number, frequency, created_at)
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [wordId, row.book, row.count]
              );
            });

            console.log(`Processed most-repeated word: ${row.word} (Count: ${row.count}, Book: ${row.book})`);
          } catch (error) {
            console.error(`Error processing most-repeated word ${row.word}:`, error);
          }
        }

        // 每处理完一批，提交一次事务并开始新事务
        await retryOperation(async () => {
          await db.run('COMMIT');
        });

        await retryOperation(async () => {
          await db.run('BEGIN TRANSACTION');
        });
      }

      // 提交最后一次事务
      await retryOperation(async () => {
        await db.run('COMMIT');
      });
    } catch (error) {
      // 回滚事务
      await retryOperation(async () => {
        await db.run('ROLLBACK');
      });
      throw error;
    }

    // 关闭连接
    await mostRepeatedDb.close();

    console.log('Most-repeated vocabulary processing completed!');
  } catch (error) {
    console.error('Error processing most-repeated vocabulary data:', error);
  }
}

// 从 ielts-materials 中提取同义词数据
async function processSynonyms() {
  try {
    // 初始化数据库
    await initDatabase();

    // 读取 vocabulary.md 文件
    const vocabularyPath = path.join(__dirname, '../../../ielts-materials/vocabulary.md');
    const content = fs.readFileSync(vocabularyPath, 'utf8');

    // 解析同义词数据
    const synonymMap = new Map();

    // 简单的解析逻辑，提取单词和其同义词
    const lines = content.split('\n');
    let currentWord = '';
    let synonyms = [];

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
      let list1Synonyms = [];

      for (const line of list1Lines) {
        // 查找单词行
        const wordMatch = line.match(/## \d+\. (\w+)/);
        if (wordMatch) {
          // 如果有当前单词和同义词，保存
          if (list1CurrentWord && list1Synonyms.length > 0) {
            if (synonymMap.has(list1CurrentWord)) {
              const existingSynonyms = synonymMap.get(list1CurrentWord);
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
          const existingSynonyms = synonymMap.get(list1CurrentWord);
          synonymMap.set(list1CurrentWord, [...new Set([...existingSynonyms, ...list1Synonyms])]);
        } else {
          synonymMap.set(list1CurrentWord, list1Synonyms);
        }
      }
    }

    // 开始事务
    await retryOperation(async () => {
      await db.run('BEGIN TRANSACTION');
    });

    try {
      // 批量处理同义词
      const batchSize = 50;
      const wordEntries = Array.from(synonymMap.entries());
      
      for (let i = 0; i < wordEntries.length; i += batchSize) {
        const batch = wordEntries.slice(i, i + batchSize);

        for (const [word, syns] of batch) {
          try {
            // 查找单词 ID
            const wordRecord = await retryOperation(async () => {
              return await db.get(
                `SELECT id FROM words WHERE word = ?`,
                [word]
              );
            });

            if (wordRecord) {
              const wordId = wordRecord.id;

              // 插入同义词
              for (const synonym of syns) {
                await retryOperation(async () => {
                  await db.run(
                    `INSERT OR IGNORE INTO synonyms (word_id, synonym, created_at)
                     VALUES (?, ?, CURRENT_TIMESTAMP)`,
                    [wordId, synonym]
                  );
                });
              }

              console.log(`Processed synonyms for word: ${word}`);
            }
          } catch (error) {
            console.error(`Error processing synonyms for word ${word}:`, error);
          }
        }

        // 每处理完一批，提交一次事务并开始新事务
        await retryOperation(async () => {
          await db.run('COMMIT');
        });

        await retryOperation(async () => {
          await db.run('BEGIN TRANSACTION');
        });
      }

      // 提交最后一次事务
      await retryOperation(async () => {
        await db.run('COMMIT');
      });
    } catch (error) {
      // 回滚事务
      await retryOperation(async () => {
        await db.run('ROLLBACK');
      });
      throw error;
    }

    console.log('Synonyms processing completed!');
  } catch (error) {
    console.error('Error processing synonyms data:', error);
  }
}

// 主函数，运行所有数据处理器
async function runProcessors() {
  console.log('Starting data processing...');
  
  console.log('\nProcessing AWL data...');
  await processAWL();
  
  console.log('\nProcessing most-repeated vocabulary data...');
  await processMostRepeated();
  
  console.log('\nProcessing synonyms data...');
  await processSynonyms();
  
  console.log('\nAll data processing completed!');
  
  // 关闭数据库连接
  if (db) {
    await retryOperation(async () => {
      await db.close();
    });
  }
}

// 运行主函数
runProcessors().catch(console.error);
