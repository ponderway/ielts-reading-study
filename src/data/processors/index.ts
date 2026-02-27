import processAWL from './awlProcessor';
import processMostRepeated from './mostRepeatedProcessor';
import processSynonyms from './synonymsProcessor';

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
}

// 运行主函数
runProcessors().catch(console.error);
