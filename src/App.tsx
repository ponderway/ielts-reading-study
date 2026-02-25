import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import WordStudy from './components/WordStudy';
import ReadingStudy from './components/ReadingStudy';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>IELTS Reading Study</h1>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/words">Word Study</Link></li>
              <li><Link to="/reading">Reading Study</Link></li>
            </ul>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/words" element={<WordStudy />} />
            <Route path="/reading" element={<ReadingStudy />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>© 2026 IELTS Reading Study</p>
        </footer>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="home">
      <h2>Welcome to IELTS Reading Study</h2>
      <p>This application is designed to help you prepare for the IELTS reading test.</p>
      <div className="home-buttons">
        <Link to="/words"><button>Start Word Study</button></Link>
        <Link to="/reading"><button>Start Reading Study</button></Link>
      </div>
    </div>
  );
}

export default App;