export type StepType = 'summarize' | 'translate' | 'rewrite' | 'extract';

export interface PipelineStep {
  id: string;
  type: StepType;
  config: StepConfig;
  order: number;
}

export interface StepConfig {
  length?: 'short' | 'medium' | 'long';
  format?: 'paragraph' | 'bullets' | 'outline';
  
  targetLanguage?: string;
  
  tone?: 'casual' | 'formal' | 'professional' | 'friendly' | 'academic';
  style?: 'concise' | 'detailed' | 'persuasive' | 'informative';
  
  extractType?: 'keywords' | 'entities' | 'topics' | 'sentiment';
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  steps: PipelineStep[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  input: string;
  outputs: Array<{
    stepId: string;
    output: string;
    processingTime: number;
  }>;
  totalProcessingTime: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
}

export const STEP_CONFIGS = {
  summarize: {
    title: 'Summarize',
    description: 'Condense text into a concise summary',
    icon: '📝',
    color: 'from-blue-500 to-blue-600',
    options: {
      length: ['short', 'medium', 'long'],
      format: ['paragraph', 'bullets', 'outline']
    }
  },
  translate: {
    title: 'Translate',
    description: 'Convert text to another language',
    icon: '🌐',
    color: 'from-green-500 to-green-600',
    options: {
      targetLanguage: [
        'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
        'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Hindi', 
        'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 
        'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Greek', 'Turkish', 
        'Hebrew', 'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Filipino'
      ]
    }
  },
  rewrite: {
    title: 'Rewrite',
    description: 'Adjust tone and style of text',
    icon: '✏️',
    color: 'from-purple-500 to-purple-600',
    options: {
      tone: ['casual', 'formal', 'professional', 'friendly', 'academic'],
      style: ['concise', 'detailed', 'persuasive', 'informative']
    }
  },
  extract: {
    title: 'Extract',
    description: 'Extract key information from text',
    icon: '🔍',
    color: 'from-orange-500 to-orange-600',
    options: {
      extractType: ['keywords', 'entities', 'topics', 'sentiment']
    }
  }
} as const;