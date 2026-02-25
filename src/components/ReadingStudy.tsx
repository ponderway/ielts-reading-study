import React, { useState, useEffect } from 'react';
import './ReadingStudy.css';
import { storageManager, ArticleResult } from '../utils/storage';

interface Article {
  id: number;
  title: string;
  content: string;
  questions: Question[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const ReadingStudy: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<ArticleResult[]>([]);

  // 模拟雅思阅读文章数据
  const mockArticles: Article[] = [
    {
      id: 1,
      title: 'The History of the Internet',
      content: `The internet has become an integral part of modern life, but its origins date back to the 1960s. The United States Department of Defense created ARPANET, the precursor to the internet, as a way to share information between research institutions. In the 1970s, TCP/IP protocol was developed, allowing different networks to communicate with each other. The World Wide Web, created by Tim Berners-Lee in 1989, made the internet accessible to the general public. Since then, the internet has grown exponentially, connecting billions of people worldwide.`,
      difficulty: 'easy',
      questions: [
        {
          id: 1,
          question: 'When was the precursor to the internet created?',
          options: ['1950s', '1960s', '1970s', '1980s'],
          correctAnswer: 1
        },
        {
          id: 2,
          question: 'Who created the World Wide Web?',
          options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Mark Zuckerberg'],
          correctAnswer: 2
        },
        {
          id: 3,
          question: 'What protocol allowed different networks to communicate?',
          options: ['HTTP', 'TCP/IP', 'FTP', 'SMTP'],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 2,
      title: 'Climate Change and Its Impact',
      content: `Climate change is one of the most pressing issues facing our planet today. Rising global temperatures, caused by increased greenhouse gas emissions, are leading to melting ice caps, rising sea levels, and more extreme weather events. Scientists predict that if current trends continue, average global temperatures could rise by 2-4°C by the end of the century. This would have catastrophic effects on ecosystems, agriculture, and human societies. Efforts to mitigate climate change include reducing carbon emissions, transitioning to renewable energy sources, and promoting sustainable practices.`,
      difficulty: 'medium',
      questions: [
        {
          id: 1,
          question: 'What is causing rising global temperatures?',
          options: ['Natural cycles', 'Increased greenhouse gas emissions', 'Solar activity', 'Volcanic eruptions'],
          correctAnswer: 1
        },
        {
          id: 2,
          question: 'What is one predicted effect of climate change?',
          options: ['Decreasing sea levels', 'More stable weather patterns', 'Melting ice caps', 'Increased biodiversity'],
          correctAnswer: 2
        },
        {
          id: 3,
          question: 'What is a way to mitigate climate change?',
          options: ['Increasing fossil fuel use', 'Transitioning to renewable energy', 'Expanding deforestation', 'Ignoring the issue'],
          correctAnswer: 1
        }
      ]
    }
  ];

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