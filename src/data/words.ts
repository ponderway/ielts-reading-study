export interface Word {
  id: number | string;
  word: string;
  definition: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
  frequency?: number; // 考频星级
  paraphrases?: string[]; // 同义替换
  topics?: string[]; // 话题分类
  phonetic?: string; // 音标
  audio?: string; // 音频链接
  antonyms?: string[]; // 反义词
}

export const mockWords: Word[] = [
  {
    id: 1,
    word: 'abundant',
    definition: '丰富的，充裕的',
    example: 'There is an abundant supply of water in the region.',
    difficulty: 'medium',
    frequency: 4,
    paraphrases: ['plentiful', 'ample', 'copious'],
    topics: ['Environment', 'Science']
  },
  {
    id: 2,
    word: 'ambiguous',
    definition: '模棱两可的，含糊不清的',
    example: 'The instructions were ambiguous and caused confusion.',
    difficulty: 'hard',
    frequency: 3,
    paraphrases: ['unclear', 'vague', 'equivocal'],
    topics: ['Language', 'Academic']
  },
  {
    id: 3,
    word: 'benevolent',
    definition: '仁慈的，慈善的',
    example: 'The benevolent millionaire donated a large sum to charity.',
    difficulty: 'medium',
    frequency: 2,
    paraphrases: ['kind', 'generous', 'charitable'],
    topics: ['Social', 'Ethics']
  },
  {
    id: 4,
    word: 'coherence',
    definition: '连贯性，一致性',
    example: 'The essay lacks coherence and is difficult to follow.',
    difficulty: 'hard',
    frequency: 3,
    paraphrases: ['consistency', 'logic', 'unity'],
    topics: ['Writing', 'Academic']
  },
  {
    id: 5,
    word: 'diligence',
    definition: '勤奋，努力',
    example: 'His success is due to his diligence and hard work.',
    difficulty: 'easy',
    frequency: 4,
    paraphrases: ['hard work', 'perseverance', 'industry'],
    topics: ['Personal Development', 'Education']
  }
];
