import React, { useState, useEffect } from 'react';
import './DeepSearch.css';
import { mockWords, Word } from '../data/words';

// 定义 API 响应类型
interface Phonetic {
  text: string;
  audio?: string;
  sourceUrl?: string;
  license?: {
    name: string;
    url: string;
  };
}

interface Definition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

interface DictionaryAPIResponse {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license: {
    name: string;
    url: string;
  };
  sourceUrls: string[];
}

const DeepSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Word[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // 处理搜索输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      // 基于本地模拟数据生成搜索建议
      const filteredWords = mockWords.filter(word => 
        word.word.toLowerCase().includes(value.toLowerCase()) ||
        word.definition.toLowerCase().includes(value.toLowerCase())
      );
      const wordSuggestions = filteredWords.map(word => word.word).slice(0, 5);
      setSuggestions(wordSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 将 API 响应转换为 Word 类型
  const convertApiResponseToWord = (apiData: DictionaryAPIResponse): Word => {
    // 提取第一个定义作为主要定义
    const firstMeaning = apiData.meanings[0];
    const firstDefinition = firstMeaning?.definitions[0]?.definition || 'No definition available';
    
    // 提取所有同义词
    const synonyms = apiData.meanings.flatMap(meaning => meaning.synonyms).filter((value, index, self) => self.indexOf(value) === index).slice(0, 5);
    
    // 提取所有反义词
    const antonyms = apiData.meanings.flatMap(meaning => meaning.antonyms).filter((value, index, self) => self.indexOf(value) === index).slice(0, 5);
    
    return {
      id: Date.now().toString(),
      word: apiData.word,
      definition: firstDefinition,
      phonetic: apiData.phonetic || apiData.phonetics.find(p => p.text)?.text || '',
      audio: apiData.phonetics.find(p => p.audio)?.audio || '',
      difficulty: 'medium', // 默认难度
      frequency: 3, // 默认考频
      example: '', // API 不提供例句，使用空字符串
      paraphrases: synonyms, // 使用同义词作为同义替换
      topics: [], // API 不提供话题分类，使用空数组
      antonyms: antonyms
    };
  };

  // 处理搜索提交
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLoading(true);
      setApiError(null);
      
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
          throw new Error('Word not found');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // 转换 API 响应为 Word 类型
          const word = convertApiResponseToWord(data[0]);
          setSearchResults([word]);
          setSelectedWord(word);
        } else {
          setSearchResults([]);
          setSelectedWord(null);
        }
        
        setShowSuggestions(false);

        // 更新搜索历史
        if (!searchHistory.includes(searchTerm)) {
          const newHistory = [searchTerm, ...searchHistory].slice(0, 10);
          setSearchHistory(newHistory);
        }
      } catch (error) {
        console.error('Error searching word:', error);
        setApiError('Word not found. Please try another word.');
        setSearchResults([]);
        setSelectedWord(null);
      } finally {
        setLoading(false);
      }
    }
  };

  // 处理回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 处理建议项点击
  const handleSuggestionClick = async (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setLoading(true);
    setApiError(null);
    
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(suggestion)}`);
      
      if (!response.ok) {
        throw new Error('Word not found');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // 转换 API 响应为 Word 类型
        const word = convertApiResponseToWord(data[0]);
        setSearchResults([word]);
        setSelectedWord(word);
      } else {
        setSearchResults([]);
        setSelectedWord(null);
      }

      // 更新搜索历史
      if (!searchHistory.includes(suggestion)) {
        const newHistory = [suggestion, ...searchHistory].slice(0, 10);
        setSearchHistory(newHistory);
      }
    } catch (error) {
      console.error('Error searching word:', error);
      setApiError('Word not found. Please try another word.');
      setSearchResults([]);
      setSelectedWord(null);
    } finally {
      setLoading(false);
    }
  };

  // 处理历史记录点击
  const handleHistoryClick = (term: string) => {
    setSearchTerm(term);
    handleSearch();
  };

  // 处理单词卡片点击
  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
  };

  return (
    <div className="deep-search">
      <h2>智能词典查询</h2>
      
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="输入单词或中文释义..."
            className="search-input"
            autoComplete="off"
          />
          <button onClick={handleSearch} className="search-button">
            搜索
          </button>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {searchHistory.length > 0 && (
        <div className="search-history">
          <h3>搜索历史</h3>
          <div className="history-tags">
            {searchHistory.map((term, index) => (
              <span 
                key={index} 
                className="history-tag"
                onClick={() => handleHistoryClick(term)}
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {apiError && (
        <div className="error-message">
          {apiError}
        </div>
      )}

      <div className="search-results">
        <h3>搜索结果</h3>
        {loading ? (
          <div className="loading">
            正在搜索单词...
          </div>
        ) : searchResults.length > 0 ? (
          <div className="results-grid">
            {searchResults.map(word => (
              <div 
                key={word.id} 
                className={`word-card ${selectedWord?.id === word.id ? 'selected' : ''}`}
                onClick={() => handleWordClick(word)}
              >
                <h4>{word.word}</h4>
                {word.phonetic && (
                  <p className="phonetic">{word.phonetic}</p>
                )}
                <p className="definition">{word.definition}</p>
                <span className={`difficulty ${word.difficulty}`}>
                  {word.difficulty === 'easy' ? 'Easy' : 
                   word.difficulty === 'medium' ? 'Medium' : 'Hard'}
                </span>
                {word.frequency && (
                  <span className="frequency">
                    {'★'.repeat(word.frequency)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-results">未找到结果</p>
        )}
      </div>

      {selectedWord && (
        <div className="word-details-panel">
          <h3>单词详情</h3>
          <div className="word-detail-card">
            <div className="word-header">
              <h2>{selectedWord.word}</h2>
              {selectedWord.phonetic && (
                <p className="phonetic">{selectedWord.phonetic}</p>
              )}
              {selectedWord.audio && (
                <div key={selectedWord.word} className="audio-player">
                  <audio controls>
                    <source src={selectedWord.audio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              <div className="word-meta">
                <span className={`difficulty ${selectedWord.difficulty}`}>
                  {selectedWord.difficulty === 'easy' ? 'Easy' : 
                   selectedWord.difficulty === 'medium' ? 'Medium' : 'Hard'}
                </span>
                {selectedWord.frequency && (
                  <span className="frequency">
                    考频: {'★'.repeat(selectedWord.frequency)}{'☆'.repeat(5 - selectedWord.frequency)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="word-content">
              <p className="definition">{selectedWord.definition}</p>
              <p className="example">Example: {selectedWord.example}</p>
              
              {selectedWord.paraphrases && selectedWord.paraphrases.length > 0 && (
                <div className="paraphrases">
                  <h4>同义替换</h4>
                  <div className="paraphrase-tags">
                    {selectedWord.paraphrases.map((paraphrase, index) => (
                      <span key={index} className="paraphrase-tag">
                        {paraphrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedWord.antonyms && selectedWord.antonyms.length > 0 && (
                <div className="antonyms">
                  <h4>反义词</h4>
                  <div className="antonym-tags">
                    {selectedWord.antonyms.map((antonym, index) => (
                      <span key={index} className="antonym-tag">
                        {antonym}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedWord.topics && selectedWord.topics.length > 0 && (
                <div className="topics">
                  <h4>话题分类</h4>
                  <div className="topic-tags">
                    {selectedWord.topics.map((topic, index) => (
                      <span key={index} className="topic-tag">
                        {topic}
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
  );
};

export default DeepSearch;
