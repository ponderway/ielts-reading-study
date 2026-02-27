import React, { useState, useEffect } from 'react';
import './VocabularyLibrary.css';
import { initDatabase, getWords, getSynonymsByWordId, Word, Synonym } from '../data/browserDatabase';

const VocabularyLibrary: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [synonyms, setSynonyms] = useState<Synonym[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const [wordsPerPage, setWordsPerPage] = useState(30);

  // 加载单词数据
  const loadWords = async () => {
    console.log('Loading words...');
    console.log(`Search term: ${searchTerm}, Filter: ${filter}, Page: ${currentPage}, Page size: ${wordsPerPage}`);
    try {
      console.log('Initializing database...');
      await initDatabase();
      console.log('Database initialized');
      
      // 使用新的getWords函数获取数据
      console.log('Getting words...');
      const result = await getWords(searchTerm, filter, currentPage, wordsPerPage);
      console.log(`Got ${result.words.length} words, total: ${result.total}`);
      setWords(result.words);
      setTotalWords(result.total);
      
      // 计算总页数
      const pages = Math.ceil(result.total / wordsPerPage);
      setTotalPages(pages);
      console.log(`Total pages: ${pages}`);
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      setLoading(false);
      console.log('Loading completed');
    }
  };

  // 强制重新导入数据
  const forceReloadData = async () => {
    console.log('Forcing data reload...');
    setLoading(true);
    try {
      console.log('Initializing database with force reload...');
      await initDatabase(true);
      console.log('Database reinitialized');
      await loadWords();
    } catch (error) {
      console.error('Error reloading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载单词数据
  useEffect(() => {
    loadWords();
  }, [searchTerm, filter, currentPage, wordsPerPage]);

  // 加载选中单词的同义词
  useEffect(() => {
    const loadSynonyms = async () => {
      if (selectedWord) {
        try {
          const result = await getSynonymsByWordId(selectedWord.id);
          setSynonyms(result);
        } catch (error) {
          console.error('Error loading synonyms:', error);
        }
      } else {
        setSynonyms([]);
      }
    };

    loadSynonyms();
  }, [selectedWord]);

  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
  };

  return (
    <div className="vocabulary-library">
      <h2>词库查看</h2>
      
      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索单词..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-options">
          <label>筛选:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">全部单词</option>
            <option value="awl">AWL 学术词汇</option>
            <option value="high-frequency">高频词汇</option>
          </select>
        </div>
        
        <div className="page-size-options">
          <label>每页:</label>
          <select 
            value={wordsPerPage} 
            onChange={(e) => setWordsPerPage(Number(e.target.value))}
            className="filter-select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div className="reload-data">
          <button 
            onClick={forceReloadData} 
            className="reload-button"
            disabled={loading}
          >
            {loading ? '加载中...' : '重新导入数据'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="library-content">
          <div className="words-list">
            <h3>单词列表</h3>
            {words.length > 0 ? (
              <div className="words-list-container">
                {words.map((word) => (
                  <div
                    key={word.id}
                    className={`word-item ${selectedWord?.id === word.id ? 'selected' : ''}`}
                    onClick={() => handleWordClick(word)}
                  >
                    <div className="word-left">
                      <span className="word-text">{word.word}</span>
                      {word.phonetic && (
                        <span className="phonetic-small">{word.phonetic}</span>
                      )}
                    </div>
                    <div className="word-middle">
                      <button className="play-button">
                        ▶
                      </button>
                    </div>
                    <div className="word-right">
                      <span className="word-definition">{word.definition || '无释义'}</span>
                      {word.awl_sublist && (
                        <span className="awl-badge">AWL {word.awl_sublist}</span>
                      )}
                      {word.frequency > 0 && (
                        <span className="frequency-badge">{word.frequency}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-words">未找到单词</p>
            )}
            
            {/* 分页控制 - 移到单词列表下方 */}
            {!loading && totalWords > 0 && (
              <div className="pagination">
                <div className="pagination-info">
                  共 {totalWords} 个单词，第 {currentPage} / {totalPages} 页
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-button"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    上一页
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`page-button ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    className="pagination-button"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedWord && (
            <div className="word-details">
              <h3>单词详情</h3>
              <div className="word-detail-card">
                <div className="word-header">
                  <h2>{selectedWord.word}</h2>
                  {selectedWord.phonetic && (
                    <p className="phonetic">{selectedWord.phonetic}</p>
                  )}
                  <div className="word-meta">
                    {selectedWord.awl_sublist && (
                      <span className="awl-sublist">
                        AWL Sublist: {selectedWord.awl_sublist}
                      </span>
                    )}
                    {selectedWord.frequency > 0 && (
                      <span className="frequency">
                        考频: {selectedWord.frequency}
                      </span>
                    )}
                    {selectedWord.difficulty_level && (
                      <span className="difficulty">
                        难度: {selectedWord.difficulty_level}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="word-content">
                  {selectedWord.definition && (
                    <p className="definition">{selectedWord.definition}</p>
                  )}
                  {selectedWord.example_sentence && (
                    <p className="example">例句: {selectedWord.example_sentence}</p>
                  )}
                  
                  {synonyms.length > 0 && (
                    <div className="synonyms">
                      <h4>同义词</h4>
                      <div className="synonym-tags">
                        {synonyms.map((synonym) => (
                          <span key={synonym.id} className="synonym-tag">
                            {synonym.synonym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VocabularyLibrary;
