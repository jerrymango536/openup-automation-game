export type Category = 'pending' | 'quick-win' | 'achievable' | 'moonshot';

export interface Session {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Idea {
  id: string;
  session_id: string;
  content: string;
  author_name: string | null;
  category: Category;
  ai_reasoning: string | null;
  created_at: string;
}

export interface AnalysisResult {
  category: 'quick-win' | 'achievable' | 'moonshot';
  reasoning: string;
}

export const CATEGORY_INFO: Record<Category, {
  label: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
  glowClass: string;
}> = {
  'pending': {
    label: 'Analyzing',
    emoji: '...',
    description: 'AI is thinking...',
    color: 'var(--pending)',
    bgColor: 'var(--pending-bg)',
    glowClass: 'glow-amber',
  },
  'quick-win': {
    label: 'Quick Wins',
    emoji: '🚀',
    description: 'Automate this tomorrow',
    color: 'var(--quick-win)',
    bgColor: 'var(--quick-win-bg)',
    glowClass: 'glow-green',
  },
  'achievable': {
    label: 'Achievable',
    emoji: '⚡',
    description: 'Worth the investment',
    color: 'var(--achievable)',
    bgColor: 'var(--achievable-bg)',
    glowClass: 'glow-cyan',
  },
  'moonshot': {
    label: 'Moonshots',
    emoji: '🌙',
    description: 'Dream big, plan carefully',
    color: 'var(--moonshot)',
    bgColor: 'var(--moonshot-bg)',
    glowClass: 'glow-purple',
  },
};
