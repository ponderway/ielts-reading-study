import React, { useState, useEffect } from 'react';
import './ReadingStudy.css';
import { storageManager, ArticleResult } from '../utils/storage';
import { mockArticles, Article } from '../data/articles';

const ReadingStudy: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<ArticleResult[]>([]);

  // 从本地存储加载测试结果
  useEffect(() => {
    setArticles(mockArticles);
    
    const savedResults = storageManager.getReadingStudyResults();
    setResults(savedResults);
  }, []);

  // 保存测试结果到本地存储
  useEffect(() => {
    if (results.length > 0) {
      storageManager.saveReadingStudyResults(results);
    }
  }, [results]);

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
    setAnswers(new Array(article.questions.length).fill(-1));
    setShowResults(false);
    setScore(0);
  };

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (selectedArticle) {
      let correctCount = 0;
      answers.forEach((answer, index) => {
        if (answer === selectedArticle.questions[index].correctAnswer) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setShowResults(true);
      
      // 保存测试结果
      const newResult: ArticleResult = {
        articleId: selectedArticle.id,
        score: correctCount,
        totalQuestions: selectedArticle.questions.length,
        completedAt: new Date().toISOString()
      };
      
      setResults(prevResults => {
        // 移除该文章的旧结果（如果存在）
        const filteredResults = prevResults.filter(result => result.articleId !== selectedArticle.id);
        return [...filteredResults, newResult];
      });
    }
  };

  const handleBackToArticles = () => {
    setSelectedArticle(null);
    setShowResults(false);
    setScore(0);
  };

  return (
    <div className="reading-study">
      <h2>Reading Study</h2>
      
      {!selectedArticle ? (
        <div className="articles-list">
          <h3>Select an Article</h3>
          <div className="articles-grid">
            {articles.map(article => {
              const articleResult = results.find(result => result.articleId === article.id);
              return (
                <div 
                  key={article.id} 
                  className={`article-card ${article.difficulty}`}
                  onClick={() => handleArticleSelect(article)}
                >
                  <h4>{article.title}</h4>
                  <p className="article-difficulty">
                    {article.difficulty === 'easy' ? 'Easy' : 
                     article.difficulty === 'medium' ? 'Medium' : 'Hard'}
                  </p>
                  {articleResult && (
                    <p className="article-result">
                      Score: {articleResult.score} / {articleResult.totalQuestions}
                    </p>
                  )}
                  <p className="article-preview">
                    {article.content.substring(0, 100)}...
                  </p>
                  <button className="select-button">Select</button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="article-detail">
          <button className="back-button" onClick={handleBackToArticles}>
            Back to Articles
          </button>
          
          <div className="article-header">
            <h3>{selectedArticle.title}</h3>
            <span className={`difficulty ${selectedArticle.difficulty}`}>
              {selectedArticle.difficulty === 'easy' ? 'Easy' : 
               selectedArticle.difficulty === 'medium' ? 'Medium' : 'Hard'}
            </span>
          </div>
          
          <div className="article-content">
            <p>{selectedArticle.content}</p>
          </div>
          
          <div className="questions-section">
            <h4>Questions</h4>
            {selectedArticle.questions.map((question, questionIndex) => (
              <div key={question.id} className="question">
                <p className="question-text">{questionIndex + 1}. {question.question}</p>
                <div className="options">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="option">
                      <input
                        type="radio"
                        id={`q${questionIndex}_o${optionIndex}`}
                        name={`q${questionIndex}`}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                        disabled={showResults}
                      />
                      <label htmlFor={`q${questionIndex}_o${optionIndex}`}>
                        {option}
                        {showResults && optionIndex === question.correctAnswer && (
                          <span className="correct-mark"> ✅</span>
                        )}
                        {showResults && answers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer && (
                          <span className="incorrect-mark"> ❌</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {!showResults ? (
            <button className="submit-button" onClick={handleSubmit}>
              Submit Answers
            </button>
          ) : (
            <div className="results">
              <h4>Results</h4>
              <p>Your score: {score} / {selectedArticle.questions.length}</p>
              <button className="retake-button" onClick={() => {
                setAnswers(new Array(selectedArticle.questions.length).fill(-1));
                setShowResults(false);
                setScore(0);
              }}>
                Retake
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReadingStudy;