export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  questions: Question[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string; // 文章话题
}

export const mockArticles: Article[] = [
  {
    id: 1,
    title: 'The History of the Internet',
    content: `The internet has become an integral part of modern life, but its origins date back to the 1960s. The United States Department of Defense created ARPANET, the precursor to the internet, as a way to share information between research institutions. In the 1970s, TCP/IP protocol was developed, allowing different networks to communicate with each other. The World Wide Web, created by Tim Berners-Lee in 1989, made the internet accessible to the general public. Since then, the internet has grown exponentially, connecting billions of people worldwide.`,
    difficulty: 'easy',
    topic: 'Technology',
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
    topic: 'Environment',
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
