"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../database");
// 从 AWL JSON 文件中提取单词数据
async function processAWL() {
    try {
        // 初始化数据库
        await (0, database_1.initDatabase)();
        // 读取 AWL JSON 文件
        const awlPath = path_1.default.join(__dirname, '../../../machine_readable_wordlists/Academic/AWL/AWL.json');
        const awlData = JSON.parse(fs_1.default.readFileSync(awlPath, 'utf8'));
        // 遍历每个子列表
        for (const [sublistKey, words] of Object.entries(awlData)) {
            // 提取子列表编号
            const sublistNumber = parseInt(sublistKey.split('_')[1]);
            // 遍历每个单词
            for (const [word, data] of Object.entries(words)) {
                try {
                    // 插入单词到数据库
                    const result = await database_1.db.run(`INSERT OR IGNORE INTO words (word, awl_sublist, created_at, updated_at)
             VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, [word, sublistNumber]);
                    // 如果单词已存在，更新 AWL 子列表
                    if (result.changes === 0) {
                        await database_1.db.run(`UPDATE words SET awl_sublist = ?, updated_at = CURRENT_TIMESTAMP
               WHERE word = ?`, [sublistNumber, word]);
                    }
                    console.log(`Processed AWL word: ${word} (Sublist ${sublistNumber})`);
                }
                catch (error) {
                    console.error(`Error processing AWL word ${word}:`, error);
                }
            }
        }
        console.log('AWL processing completed!');
    }
    catch (error) {
        console.error('Error processing AWL data:', error);
    }
}
exports.default = processAWL;
