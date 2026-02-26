import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import WordStudy from './components/WordStudy';
import ReadingStudy from './components/ReadingStudy';
import DeepSearch from './components/DeepSearch';
import ParaphraseLab from './components/ParaphraseLab';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>IELTS <span>Lexis</span> Master</h1>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/words">Word Study</Link></li>
              <li><Link to="/reading">Reading Study</Link></li>
              <li><Link to="/search">Deep Search</Link></li>
              <li><Link to="/paraphrase">Paraphrase Lab</Link></li>
            </ul>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/words" element={<WordStudy />} />
            <Route path="/reading" element={<ReadingStudy />} />
            <Route path="/search" element={<DeepSearch />} />
            <Route path="/paraphrase" element={<ParaphraseLab />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-links">
              <a href="#">About</a>
              <a href="#">Features</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
            </div>
            <div className="footer-copyright">
              © 2026 IELTS Lexis Master. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <>
      <div className="home">
        <h2>Master IELTS Vocabulary with Science</h2>
        <p>A scientific and fun way to improve your IELTS reading vocabulary. Learn words in context, master paraphrasing, and boost your test scores.</p>
        <div className="home-buttons">
          <Link to="/search"><button>Search Words</button></Link>
          <Link to="/words"><button className="secondary">Start Learning</button></Link>
        </div>
      </div>
      
      <div className="features-section">
        <h3>Powerful Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>Intelligent Search</h4>
            <p>Find words quickly with our smart search engine. Get detailed definitions, synonyms, and usage examples tailored for IELTS.</p>
          </div>
          <div className="feature-card">
            <h4>Contextual Learning</h4>
            <p>Learn words in real IELTS reading contexts. Understand how words are used in authentic passages and questions.</p>
          </div>
          <div className="feature-card">
            <h4>Paraphrase Practice</h4>
            <p>Master the art of paraphrasing with interactive exercises. Learn how examiners rephrase words in questions and answers.</p>
          </div>
        </div>
      </div>
      
      <div className="stats-section">
        <h3>Learning Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">1,000+</div>
            <div className="stat-label">IELTS Words</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Practice Exercises</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10k+</div>
            <div className="stat-label">Active Learners</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;