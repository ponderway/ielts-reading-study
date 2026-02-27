"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const database_1 = require("../database");
// 从 most-repeated-vocabulary-IELTS 数据库中提取考频数据
async function processMostRepeated() {
    try {
        // 初始化目标数据库
        await (0, database_1.initDatabase)();
        // 连接到 most-repeated-vocabulary-IELTS 数据库
        const mostRepeatedDbPath = path_1.default.join(__dirname, '../../../most-repeated-vocabulary-IELTS/ielts_word_data.db');
        const mostRepeatedDb = await (0, sqlite_1.open)({
            filename: mostRepeatedDbPath,
            driver: sqlite3_1.default.Database
        });
        // 查询单词数据
        const wordMetadata = await mostRepeatedDb.all(`SELECT word, count, book FROM word_metadata`);
        // 处理每个单词
        for (const row of wordMetadata) {
            try {
                // 检查单词是否已存在
                const existingWord = await database_1.db.get(`SELECT id FROM words WHERE word = ?`, [row.word]);
                let wordId;
                if (existingWord) {
                    // 单词已存在，更新频率
                    wordId = existingWord.id;
                    await database_1.db.run(`UPDATE words SET frequency = frequency + ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`, [row.count, wordId]);
                }
                else {
                    // 单词不存在，插入新记录
                    const result = await database_1.db.run(`INSERT INTO words (word, frequency, created_at, updated_at)
             VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, [row.word, row.count]);
                    wordId = result.lastID;
                }
                // 插入单词出现记录
                await database_1.db.run(`INSERT OR IGNORE INTO word_occurrences (word_id, book_number, frequency, created_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`, [wordId, row.book, row.count]);
                console.log(`Processed most-repeated word: ${row.word} (Count: ${row.count}, Book: ${row.book})`);
            }
            catch (error) {
                console.error(`Error processing most-repeated word ${row.word}:`, error);
            }
        }
        // 关闭连接
        await mostRepeatedDb.close();
        console.log('Most-repeated vocabulary processing completed!');
    }
    catch (error) {
        console.error('Error processing most-repeated vocabulary data:', error);
    }
}
exports.default = processMostRepeated;
