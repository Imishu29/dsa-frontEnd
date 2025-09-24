export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Problem {
  _id: string;
  title: string;
  chapter: string;
  level: 'Easy' | 'Medium' | 'Hard';
  youtubeLink: string;
  leetcodeLink: string;
  articleLink: string;
  order: number;
}

export interface Progress {
  problemId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}