import React, { useState, useEffect } from 'react';
import './WordStudy.css';
import { storageManager, WordProgress } from '../utils/storage';

interface Word {
  id: number;
  word: string;
  definition: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const WordStudy: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [showDefinition, setShowDefinition] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [studiedWords, setStudiedWords] = useState(0);

  // 模拟雅思单词数据
  const mockWords: Word[] = [
    {
      id: 1,
      word: 'abundant',
      definition: '丰富的，充裕的',
      example: 'There is an abundant supply of water in the region.',
      difficulty: 'medium'
    },
    {
      id: 2,
      word: 'ambiguous',
      definition: '模棱两可的，含糊不清的',
      example: 'The instructions were ambiguous and caused confusion.',
      difficulty: 'hard'
    },
    {
      id: 3,
      word: 'benevolent',
      definition: '仁慈的，慈善的',
      example: 'The benevolent millionaire donated a large sum to charity.',
      difficulty: 'medium'
    },
    {
      id: 4,
      word: 'coherence',
      definition: '连贯性，一致性',
      example: 'The essay lacks coherence and is difficult to follow.',
      difficulty: 'hard'
    },
    {
      id: 5,
      word: 'diligence',
      definition: '勤奋，努力',
      example: 'His success is due to his diligence and hard work.',
      difficulty: 'easy'
    }
  ];

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
            <span className={`difficulty ${currentWord.difficulty}`}>
              {currentWord.difficulty === 'easy' ? 'Easy' : 
               currentWord.difficulty === 'medium' ? 'Medium' : 'Hard'}
            </span>
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