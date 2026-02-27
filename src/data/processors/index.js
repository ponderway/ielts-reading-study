"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const awlProcessor_1 = __importDefault(require("./awlProcessor"));
const mostRepeatedProcessor_1 = __importDefault(require("./mostRepeatedProcessor"));
const synonymsProcessor_1 = __importDefault(require("./synonymsProcessor"));
// 主函数，运行所有数据处理器
async function runProcessors() {
    console.log('Starting data processing...');
    console.log('\nProcessing AWL data...');
    await (0, awlProcessor_1.default)();
    console.log('\nProcessing most-repeated vocabulary data...');
    await (0, mostRepeatedProcessor_1.default)();
    console.log('\nProcessing synonyms data...');
    await (0, synonymsProcessor_1.default)();
    console.log('\nAll data processing completed!');
}
// 运行主函数
runProcessors().catch(console.error);
