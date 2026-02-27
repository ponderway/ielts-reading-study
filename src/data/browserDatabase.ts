// 浏览器兼容的数据库模块 - 使用IndexedDB

interface Word {
  id: number;
  word: string;
  definition: string;
  part_of_speech: string;
  phonetic: string;
  frequency: number;
  difficulty_level: string;
  awl_sublist: number | null;
  example_sentence: string;
  created_at: string;
  updated_at: string;
}

interface Synonym {
  id: number;
  word_id: number;
  synonym: string;
  created_at: string;
}

// 数据库名称和版本
const DB_NAME = 'ielts_vocabulary';
const DB_VERSION = 1;

// 打开数据库连接
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (_event) => {
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建单词表
      if (!db.objectStoreNames.contains('words')) {
        const wordsStore = db.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
        wordsStore.createIndex('word', 'word', { unique: true });
        wordsStore.createIndex('awl_sublist', 'awl_sublist');
        wordsStore.createIndex('frequency', 'frequency');
      }

      // 创建同义词表
      if (!db.objectStoreNames.contains('synonyms')) {
        const synonymsStore = db.createObjectStore('synonyms', { keyPath: 'id', autoIncrement: true });
        synonymsStore.createIndex('word_id', 'word_id');
      }
    };
  });
}

// 清除数据库中的所有数据
async function clearDatabase() {
  try {
    console.log('Clearing database...');
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words', 'synonyms'], 'readwrite');
      const wordsStore = transaction.objectStore('words');
      const synonymsStore = transaction.objectStore('synonyms');
      
      // 清除单词表
      const clearWordsRequest = wordsStore.clear();
      clearWordsRequest.onsuccess = () => {
        console.log('Words table cleared');
      };
      
      // 清除同义词表
      const clearSynonymsRequest = synonymsStore.clear();
      clearSynonymsRequest.onsuccess = () => {
        console.log('Synonyms table cleared');
      };
      
      transaction.oncomplete = () => {
        console.log('Database cleared successfully');
        resolve(db);
      };
      
      transaction.onerror = (event) => {
        console.error('Error clearing database:', event);
        reject('Error clearing database');
      };
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

// 初始化示例数据
async function initSampleData(force = false) {
  try {
    console.log('Initializing sample data...');
    console.log(`Force parameter value: ${force}`);
    const db = await openDatabase();
    
    let shouldImport = false;
    
    // 如果强制导入，先清除数据
    if (force) {
      console.log('Force import requested, clearing database...');
      await clearDatabase();
      shouldImport = true;
    } else {
      // 检查是否已有数据
      const count = await new Promise<number>((resolve, reject) => {
        const transaction = db.transaction(['words'], 'readonly');
        const store = transaction.objectStore('words');
        const countRequest = store.count();
        
        countRequest.onsuccess = (event) => {
          const result = (event.target as IDBRequest).result as number;
          resolve(result);
        };
        
        countRequest.onerror = (_event) => {
          reject('Error checking database count');
        };
      });
      
      console.log(`Database count: ${count}`);
      
      // 如果没有数据，或者数据少于1000个，重新导入
      if (count === 0 || count < 1000) {
        console.log('Data count is less than 1000, reimporting...');
        await clearDatabase();
        shouldImport = true;
      } else {
        console.log('Data already exists, skipping import');
      }
    }
    
    if (shouldImport) {
      console.log('No data found or force import requested, importing from JSON...');
      
      try {
        // 先获取数据
        const words = await importDataFromJson();
        console.log(`Got ${words.length} words from JSON`);
        console.log(`First 10 words:`, words.slice(0, 10).map((w: any) => w.word));
        
        // 然后在事务中添加数据
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(['words'], 'readwrite');
          const store = transaction.objectStore('words');
          
          let count = 0;
          let added = 0;
          
          // 直接添加所有单词，不使用批处理
          console.log('Adding all words to database...');
          for (const word of words) {
            // 确保所有字段都存在
            const wordToAdd: Word = {
              id: word.id,
              word: word.word,
              definition: word.definition || '',
              part_of_speech: word.part_of_speech || '',
              phonetic: word.phonetic || '',
              frequency: word.frequency || 0,
              difficulty_level: word.difficulty_level || '',
              awl_sublist: word.awl_sublist || null,
              example_sentence: word.example_sentence || '',
              created_at: word.created_at || new Date().toISOString(),
              updated_at: word.updated_at || new Date().toISOString()
            };
            
            try {
              store.add(wordToAdd);
              added++;
              count++;
              
              // 每添加1000个单词打印一次进度
              if (count % 1000 === 0) {
                console.log(`Imported ${count} words`);
              }
            } catch (addError) {
              console.error(`Error adding word ${word.word}:`, addError);
              count++;
            }
          }
          
          console.log(`Successfully imported ${added} words out of ${count}`);
          
          transaction.oncomplete = () => {
            console.log('Transaction completed');
            resolve();
          };
          
          transaction.onerror = (_event) => {
            console.error('Transaction error:');
            reject('Error adding words to database');
          };
        });
        
        console.log('Data imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        // 如果导入失败，添加默认示例数据
        console.log('Adding default sample data...');
        
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(['words'], 'readwrite');
          const store = transaction.objectStore('words');
          addDefaultSampleData(store);
          
          transaction.oncomplete = () => {
            resolve();
          };
          
          transaction.onerror = () => {
            reject('Error adding default sample data');
          };
        });
      }
    }
    
    return db;
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
}

// 从 JSON 文件导入数据
async function importDataFromJson() {
  // 先获取数据，然后再在事务中添加
  try {
    console.log('Attempting to load exported_data.json...');
    
    // 导入数据（在浏览器环境中，我们将使用 fetch API 来加载 JSON 文件）
    const response = await fetch('/src/data/exported_data.json');
    console.log(`Fetch response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
    }
    
    console.log('Parsing JSON data...');
    const data = await response.json();
    console.log(`Data parsed successfully, found ${data.words.length} words`);
    
    return data.words;
  } catch (error) {
    console.error('Error importing data from JSON:', error);
    throw error;
  }
}

// 添加默认示例数据
function addDefaultSampleData(store: IDBObjectStore) {
  const sampleWords: Word[] = [
    {
      id: 1,
      word: 'abandon',
      definition: 'to leave a place, thing, or person, usually for ever',
      part_of_speech: 'verb',
      phonetic: '/əˈbændən/',
      frequency: 15,
      difficulty_level: 'medium',
      awl_sublist: 1,
      example_sentence: 'The baby had been abandoned by its mother.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      word: 'ability',
      definition: 'the fact that someone or something is able to do something',
      part_of_speech: 'noun',
      phonetic: '/əˈbɪləti/',
      frequency: 25,
      difficulty_level: 'easy',
      awl_sublist: 1,
      example_sentence: 'She has the ability to run fast.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      word: 'abnormal',
      definition: 'different from what is usual or average, especially in a way that is bad',
      part_of_speech: 'adjective',
      phonetic: '/æbˈnɔːrməl/',
      frequency: 10,
      difficulty_level: 'medium',
      awl_sublist: 2,
      example_sentence: 'The test showed some abnormal results.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      word: 'abroad',
      definition: 'in or to a foreign country',
      part_of_speech: 'adverb',
      phonetic: '/əˈbrɔːd/',
      frequency: 20,
      difficulty_level: 'easy',
      awl_sublist: null,
      example_sentence: "She's currently studying abroad",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      word: 'absolute',
      definition: 'total and complete',
      part_of_speech: 'adjective',
      phonetic: '/ˈæbsəluːt/',
      frequency: 18,
      difficulty_level: 'medium',
      awl_sublist: 1,
      example_sentence: 'There is no absolute proof of what happened.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  // 添加示例单词
  sampleWords.forEach(word => {
    store.add(word);
  });
  
  console.log('Default sample data initialized');
}

// 初始化数据库
async function initDatabase(force = false) {
  try {
    console.log('Initializing database...');
    const db = await openDatabase();
    console.log('Database opened successfully');
    await initSampleData(force);
    console.log('Sample data initialized');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// 获取单词列表
async function getWords(searchTerm: string = '', filter: string = 'all', page: number = 1, pageSize: number = 50): Promise<{ words: Word[], total: number }> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      const index = store.index('word');

      let request: IDBRequest;

      if (searchTerm) {
        // 搜索单词
        const range = IDBKeyRange.bound(searchTerm.toLowerCase(), searchTerm.toLowerCase() + '\uffff');
        request = index.openCursor(range);
      } else {
        // 获取所有单词
        request = index.openCursor();
      }

      const words: Word[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const word = cursor.value as Word;
          
          // 应用过滤条件
          if (filter === 'all' || 
              (filter === 'awl' && word.awl_sublist !== null) ||
              (filter === 'high-frequency' && word.frequency > 10)) {
            words.push(word);
          }
          cursor.continue();
        } else {
          // 排序和分页
          words.sort((a, b) => a.word.localeCompare(b.word));
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          const paginatedWords = words.slice(start, end);

          resolve({ words: paginatedWords, total: words.length });
        }
      };

      request.onerror = (_event) => {
        console.error('Error getting words:');
        reject('Error getting words');
      };
    });
  } catch (error) {
    console.error('Error getting words:', error);
    return { words: [], total: 0 };
  }
}

// 获取单词详情
async function getWordById(id: number): Promise<Word | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      const request = store.get(id);

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as Word | null);
      };

      request.onerror = (_event) => {
        reject('Error getting word');
      };
    });
  } catch (error) {
    console.error('Error getting word:', error);
    return null;
  }
}

// 获取单词的同义词
async function getSynonymsByWordId(wordId: number): Promise<Synonym[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['synonyms'], 'readonly');
      const store = transaction.objectStore('synonyms');
      const index = store.index('word_id');
      const request = index.openCursor(IDBKeyRange.only(wordId));

      const synonyms: Synonym[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          synonyms.push(cursor.value as Synonym);
          cursor.continue();
        } else {
          resolve(synonyms);
        }
      };

      request.onerror = () => {
        reject('Error getting synonyms');
      };
    });
  } catch (error) {
    console.error('Error getting synonyms:', error);
    return [];
  }
}

// 导出数据库操作函数
export {
  initDatabase,
  getWords,
  getWordById,
  getSynonymsByWordId
};

export type {
  Word,
  Synonym
};