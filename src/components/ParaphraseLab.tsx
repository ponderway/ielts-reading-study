import React, { useState } from 'react';
import './ParaphraseLab.css';

interface ParaphrasePair {
  id: number;
  questionWord: string;
  originalWord: string;
  explanation: string;
}

interface SentencePart {
  id: number;
  text: string;
  type: 'subject' | 'verb' | 'object' | 'modifier';
}

interface ComplexSentence {
  id: number;
  original: string;
  parts: SentencePart[];
  explanation: string;
}

const ParaphraseLab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'matching' | 'sentence'>('matching');
  const [selectedPairs, setSelectedPairs] = useState<{ [key: number]: number }>({});
  const [shuffledSentenceParts, setShuffledSentenceParts] = useState<SentencePart[]>([]);
  const [draggedItem, setDraggedItem] = useState<SentencePart | null>(null);
  const [completedPairs, setCompletedPairs] = useState<number[]>([]);

  // 同义替换配对数据
  const paraphrasePairs: ParaphrasePair[] = [
    {
      id: 1,
      questionWord: 'mitigate',
      originalWord: 'reduce',
      explanation: 'mitigate 意为减轻、缓解，与 reduce 同义'
    },
    {
      id: 2,
      questionWord: 'significant',
      originalWord: 'important',
      explanation: 'significant 表示重要的、显著的，与 important 同义'
    },
    {
      id: 3,
      questionWord: 'substantial',
      originalWord: 'large',
      explanation: 'substantial 表示大量的、实质的，与 large 同义'
    },
    {
      id: 4,
      questionWord: 'persistent',
      originalWord: 'continuous',
      explanation: 'persistent 表示持续的、持久的，与 continuous 同义'
    },
    {
      id: 5,
      questionWord: 'accelerate',
      originalWord: 'speed up',
      explanation: 'accelerate 表示加速，与 speed up 同义'
    }
  ];

  // 长难句数据
  const complexSentences: ComplexSentence[] = [
    {
      id: 1,
      original: 'The rapid development of technology, which has transformed nearly every aspect of modern life, has also created new challenges for society.',
      parts: [
        { id: 1, text: 'The rapid development of technology', type: 'subject' },
        { id: 2, text: 'which has transformed nearly every aspect of modern life', type: 'modifier' },
        { id: 3, text: 'has created', type: 'verb' },
        { id: 4, text: 'new challenges for society', type: 'object' }
      ],
      explanation: '这是一个包含定语从句的复合句，which 引导的从句修饰主语 The rapid development of technology'
    },
    {
      id: 2,
      original: 'Despite the fact that renewable energy sources are becoming more affordable, many countries still rely heavily on fossil fuels.',
      parts: [
        { id: 1, text: 'Despite the fact that renewable energy sources are becoming more affordable', type: 'modifier' },
        { id: 2, text: 'many countries', type: 'subject' },
        { id: 3, text: 'still rely heavily on', type: 'verb' },
        { id: 4, text: 'fossil fuels', type: 'object' }
      ],
      explanation: '这是一个包含让步状语从句的复合句，Despite the fact that 引导让步状语'
    }
  ];

  const [currentSentence, setCurrentSentence] = useState<ComplexSentence>(complexSentences[0]);

  // 处理配对选择
  const handlePairSelect = (questionId: number, originalId: number) => {
    setSelectedPairs(prev => ({
      ...prev,
      [questionId]: originalId
    }));
  };

  // 检查配对是否正确
  const checkMatches = () => {
    const correctPairs = paraphrasePairs.filter(pair => 
      selectedPairs[pair.id] === pair.id
    );
    setCompletedPairs(correctPairs.map(pair => pair.id));
    
    if (correctPairs.length === paraphrasePairs.length) {
      alert('所有配对都正确！');
    }
  };

  // 重置配对游戏
  const resetMatchingGame = () => {
    setSelectedPairs({});
    setCompletedPairs([]);
  };

  // 处理句子部分拖拽开始
  const handleDragStart = (_e: React.DragEvent, part: SentencePart) => {
    setDraggedItem(part);
  };

  // 处理句子部分拖拽结束
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // 处理放置
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedItem) {
      const newParts = [...shuffledSentenceParts];
      const draggedIndex = newParts.findIndex(part => part.id === draggedItem.id);
      
      // 移除拖拽项
      newParts.splice(draggedIndex, 1);
      // 插入到目标位置
      newParts.splice(targetIndex, 0, draggedItem);
      
      setShuffledSentenceParts(newParts);
    }
  };

  // 允许放置
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 加载新句子
  const loadSentence = (sentence: ComplexSentence) => {
    setCurrentSentence(sentence);
    // 打乱句子部分
    const shuffled = [...sentence.parts].sort(() => Math.random() - 0.5);
    setShuffledSentenceParts(shuffled);
  };

  // 检查句子重组是否正确
  const checkSentence = () => {
    const isCorrect = shuffledSentenceParts.every((part, index) => 
      part.id === currentSentence.parts[index].id
    );
    
    if (isCorrect) {
      alert('句子重组正确！');
    } else {
      alert('句子重组不正确，请再试一次！');
    }
  };

  return (
    <div className="paraphrase-lab">
      <h2>改写训练场</h2>
      
      <div className="mode-selector">
        <button 
          className={`mode-button ${activeMode === 'matching' ? 'active' : ''}`}
          onClick={() => setActiveMode('matching')}
        >
          连连看模式
        </button>
        <button 
          className={`mode-button ${activeMode === 'sentence' ? 'active' : ''}`}
          onClick={() => {
            setActiveMode('sentence');
            loadSentence(currentSentence);
          }}
        >
          长难句手术
        </button>
      </div>

      {activeMode === 'matching' && (
        <div className="matching-game">
          <h3>同义替换连连看</h3>
          <p>将左侧的题目词与右侧的原文词进行配对</p>
          
          <div className="matching-container">
            <div className="matching-column">
              <h4>题目词</h4>
              {paraphrasePairs.map(pair => (
                <div 
                  key={pair.id}
                  className={`matching-item question-item ${completedPairs.includes(pair.id) ? 'completed' : ''}`}
                >
                  {pair.questionWord}
                </div>
              ))}
            </div>
            
            <div className="matching-column">
              <h4>原文词</h4>
              {paraphrasePairs.map(pair => (
                <div 
                  key={pair.id}
                  className={`matching-item original-item ${selectedPairs[pair.id] === pair.id ? 'selected' : ''} ${completedPairs.includes(pair.id) ? 'completed' : ''}`}
                  onClick={() => handlePairSelect(pair.id, pair.id)}
                >
                  {pair.originalWord}
                </div>
              ))}
            </div>
          </div>
          
          <div className="matching-controls">
            <button onClick={checkMatches} className="check-button">
              检查答案
            </button>
            <button onClick={resetMatchingGame} className="reset-button">
              重置游戏
            </button>
          </div>
          
          {Object.keys(selectedPairs).length > 0 && (
            <div className="matching-explanations">
              <h4>解释</h4>
              {paraphrasePairs.map(pair => {
                if (selectedPairs[pair.id] === pair.id) {
                  return (
                    <div key={pair.id} className="explanation-item">
                      <strong>{pair.questionWord} → {pair.originalWord}</strong>: {pair.explanation}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      )}

      {activeMode === 'sentence' && (
        <div className="sentence-surgery">
          <h3>长难句手术</h3>
          <p>拖拽句子成分到正确的位置，重组句子</p>
          
          <div className="sentence-container">
            <div className="original-sentence">
              <h4>原句</h4>
              <p>{currentSentence.original}</p>
            </div>
            
            <div className="sentence-parts">
              <h4>句子成分</h4>
              <div className="parts-container">
                {shuffledSentenceParts.map((part, index) => (
                  <div
                    key={part.id}
                    className={`sentence-part ${part.type}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, part)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <span className="part-type">{part.type === 'subject' ? '主' : part.type === 'verb' ? '谓' : part.type === 'object' ? '宾' : '定'}</span>
                    <span className="part-text">{part.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="sentence-controls">
              <div className="sentence-selector">
                {complexSentences.map(sentence => (
                  <button 
                    key={sentence.id}
                    className={`sentence-button ${currentSentence.id === sentence.id ? 'active' : ''}`}
                    onClick={() => loadSentence(sentence)}
                  >
                    句子 {sentence.id}
                  </button>
                ))}
              </div>
              <button onClick={checkSentence} className="check-button">
                检查答案
              </button>
            </div>
            
            <div className="sentence-explanation">
              <h4>解析</h4>
              <p>{currentSentence.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParaphraseLab;
