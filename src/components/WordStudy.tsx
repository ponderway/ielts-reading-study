import React, { useState, useEffect } from 'react';
import './WordStudy.css';
import { storageManager, WordProgress } from '../utils/storage';
import { mockWords, Word } from '../data/words';

const WordStudy: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [showDefinition, setShowDefinition] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [studiedWords, setStudiedWords] = useState(0);

  // 从本地存储加载进度
  useEffect(() => {
    setWords(mockWords);
    setTotalWords(mockWords.length);
    
    const savedProgress = storageManager.getWordStudyProgress();
    if (savedProgress) {
      setProgress(savedProgress.progress);
      setStudiedWords(savedProgress.studiedWords);
      const savedWord = mockWords.find(word => word.id === savedProgress.currentWordId) || mockWords[0];
      setCurrentWord(savedWord);
    } else {
      setCurrentWord(mockWords[0]);
    }
  }, []);

  // 保存进度到本地存储
  useEffect(() => {
    if (currentWord) {
      const progressData: WordProgress = {
        studiedWords,
        progress,
        currentWordId: currentWord.id
      };
      storageManager.saveWordStudyProgress(progressData);
    }
  }, [studiedWords, progress, currentWord]);

  const handleNextWord = () => {
    const currentIndex = words.findIndex(word => word.id === currentWord?.id);
    if (currentIndex < words.length - 1) {
      setCurrentWord(words[currentIndex + 1]);
      setShowDefinition(false);
      setProgress([...progress, currentIndex]);
      setStudiedWords(progress.length + 1);
    } else {
      // 学习完成
      setProgress([...progress, currentIndex]);
      setStudiedWords(progress.length + 1);
      alert('You have studied all words!');
    }
  };

  const handlePreviousWord = () => {
    const currentIndex = words.findIndex(word => word.id === currentWord?.id);
    if (currentIndex > 0) {
      setCurrentWord(words[currentIndex - 1]);
      setShowDefinition(false);
    }
  };

  const handleToggleDefinition = () => {
    setShowDefinition(!showDefinition);
  };

  return (
    <div className="word-study">
      <h2>Word Study</h2>
      
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(studiedWords / totalWords) * 100}%` }}
          ></div>
        </div>
        <p>Progress: {studiedWords} / {totalWords}</p>
      </div>

      {currentWord && (
        <div className="word-card">
          <div className="word-header">
            <h3>{currentWord.word}</h3>
            <div className="word-meta">
              <span className={`difficulty ${currentWord.difficulty}`}>
                {currentWord.difficulty === 'easy' ? 'Easy' : 
                 currentWord.difficulty === 'medium' ? 'Medium' : 'Hard'}
              </span>
              {currentWord.frequency && (
                <span className="frequency">
                  考频: {'★'.repeat(currentWord.frequency)}{'☆'.repeat(5 - currentWord.frequency)}
                </span>
              )}
            </div>
          </div>
          
          <button 
            className="definition-toggle" 
            onClick={handleToggleDefinition}
          >
            {showDefinition ? 'Hide Definition' : 'Show Definition'}
          </button>
          
          {showDefinition && (
            <div className="word-details">
              <p className="definition">{currentWord.definition}</p>
              <p className="example">Example: {currentWord.example}</p>
              {currentWord.paraphrases && currentWord.paraphrases.length > 0 && (
                <div className="paraphrases">
                  <h4>同义替换:</h4>
                  <div className="paraphrase-tags">
                    {currentWord.paraphrases.map((paraphrase, index) => (
                      <span key={index} className="paraphrase-tag">
                        {paraphrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {currentWord.topics && currentWord.topics.length > 0 && (
                <div className="topics">
                  <h4>话题分类:</h4>
                  <div className="topic-tags">
                    {currentWord.topics.map((topic, index) => (
                      <span key={index} className="topic-tag">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="word-navigation">
            <button 
              onClick={handlePreviousWord} 
              disabled={words.findIndex(word => word.id === currentWord.id) === 0}
            >
              Previous
            </button>
            <button 
              onClick={handleNextWord} 
              disabled={words.findIndex(word => word.id === currentWord.id) === words.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordStudy;