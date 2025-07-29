import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export interface StepConfig {
  length?: 'short' | 'medium' | 'long';
  format?: 'paragraph' | 'bullets' | 'outline';
  targetLanguage?: string;
  style?: string;
  keywords?: string[];
}

export interface PipelineStep {
  id: string;
  type: 'summarize' | 'translate' | 'rewrite' | 'extract';
  config: StepConfig;
}

export interface PipelineExecution {
  pipelineId: string;
  input: string;
  outputs: Array<{
    stepId: string;
    output: string;
    processingTime: number;
  }>;
  totalProcessingTime: number;
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
}

// Supported languages for translation
const SUPPORTED_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 
  'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Russian',
  'Arabic', 'Hindi', 'Dutch', 'Swedish', 'Norwegian',
  'Danish', 'Finnish', 'Polish', 'Czech', 'Hungarian',
  'Romanian', 'Bulgarian', 'Greek', 'Turkish', 'Hebrew',
  'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Filipino'
];

export class AiService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ GROQ_API_KEY not found in environment variables');
    }
  }

  // validate if a language is supported
  private validateLanguage(language: string): boolean {
    return SUPPORTED_LANGUAGES.includes(language);
  }

  // get list of supported languages
  getSupportedLanguages(): string[] {
    return [...SUPPORTED_LANGUAGES];
  }

  async executePipeline(steps: PipelineStep[], input: string): Promise<PipelineExecution> {
    const startTime = Date.now();
    
    const execution: PipelineExecution = {
      pipelineId: 'backend-pipeline',
      input,
      outputs: [],
      totalProcessingTime: 0,
      status: 'running',
      createdAt: new Date().toISOString()
    };

    try {
      let currentInput = input;

      for (const step of steps) {
        const stepStartTime = Date.now();
        
        const output = await this.executeStep(step, currentInput);
        const processingTime = Date.now() - stepStartTime;

        execution.outputs.push({
          stepId: step.id,
          output,
          processingTime
        });

        currentInput = output;
      }

      execution.totalProcessingTime = Date.now() - startTime;
      execution.status = 'completed';

    } catch (error) {
      execution.status = 'failed';
      execution.totalProcessingTime = Date.now() - startTime;
      throw error;
    }

    return execution;
  }

  private async executeStep(step: PipelineStep, input: string): Promise<string> {
    switch (step.type) {
      case 'summarize':
        return this.summarize(input, step.config);
      case 'translate':
        return this.translate(input, step.config);
      case 'rewrite':
        return this.rewrite(input, step.config);
      case 'extract':
        return this.extract(input, step.config);
      default:
        return input;
    }
  }

  private async summarize(input: string, config: StepConfig): Promise<string> {
    const { length = 'medium', format = 'paragraph' } = config;
    
    const prompt = `Please summarize the following text. 
    
Requirements:
- Length: ${length} (short: 1-2 sentences, medium: 3-4 sentences, long: 5-6 sentences)
- Format: ${format} (paragraph: continuous text, bullets: bullet points, outline: numbered list)

Text to summarize:
"${input}"

Please provide only the summary without any additional explanations.`;

    try {
      const { text } = await generateText({
        model: groq('gemma2-9b-it'),
        prompt,
      });

      if (!text || text.trim() === '') {
        throw new Error('AI service returned empty response. Please check your API key and try again.');
      }

      return text;
    } catch (error) {
      throw new Error(`Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async translate(input: string, config: StepConfig): Promise<string> {
    const { targetLanguage = 'Spanish' } = config;
    
    if (!this.validateLanguage(targetLanguage)) {
      throw new Error(`The suggested language "${targetLanguage}" is restricted. Please choose from the supported languages.`);
    }
    
    const prompt = `Please translate the following text to ${targetLanguage}. 
    
Text to translate:
"${input}"

Please provide only the translation without any additional explanations or notes.`;

    try {
      const { text } = await generateText({
        model: groq('gemma2-9b-it'),
        prompt,
      });

      if (!text || text.trim() === '') {
        throw new Error('AI service returned empty response. Please check your API key and try again.');
      }

      return text;
    } catch (error) {
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async rewrite(input: string, config: StepConfig): Promise<string> {
    const { style = 'professional' } = config;
    
    const prompt = `Please rewrite the following text in a ${style} style. 
    
Text to rewrite:
"${input}"

Please provide only the rewritten text without any additional explanations.`;

    try {
      const { text } = await generateText({
        model: groq('gemma2-9b-it'),
        prompt,
      });

      if (!text || text.trim() === '') {
        throw new Error('AI service returned empty response. Please check your API key and try again.');
      }

      return text;
    } catch (error) {
      throw new Error(`Rewrite failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extract(input: string, config: StepConfig): Promise<string> {
    const { keywords = [] } = config;
    
    const prompt = `Please extract key information from the following text. 
    
${keywords.length > 0 ? `Focus on these keywords: ${keywords.join(', ')}` : 'Extract the most important information.'}

Text to extract from:
"${input}"

Please provide only the extracted information without any additional explanations.`;

    try {
      const { text } = await generateText({
        model: groq('gemma2-9b-it'),
        prompt,
      });

      if (!text || text.trim() === '') {
        throw new Error('AI service returned empty response. Please check your API key and try again.');
      }

      return text;
    } catch (error) {
      throw new Error(`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePipelineSteps(instruction: string): Promise<PipelineStep[]> {
    const prompt = `You are an AI pipeline builder. Based on the user's instruction, create a sequence of pipeline steps that will accomplish their goal.

Available step types:
1. summarize - Condense text into a concise summary
2. translate - Convert text to another language  
3. rewrite - Adjust tone and style of text
4. extract - Extract key information from text

IMPORTANT: For translation steps, only use these supported languages:
${SUPPORTED_LANGUAGES.join(', ')}

User instruction: "${instruction}"

Please respond with a JSON array of pipeline steps. Each step should have:
- id: unique identifier (e.g., "step1", "step2")
- type: one of the available step types
- config: configuration object with appropriate parameters

Example response format:
[
  {
    "id": "step1",
    "type": "rewrite",
    "config": {
      "style": "professional"
    }
  },
  {
    "id": "step2", 
    "type": "translate",
    "config": {
      "targetLanguage": "Spanish"
    }
  }
]

Respond with only the JSON array, no additional text.`;

    try {
      const { text } = await generateText({
        model: groq('gemma2-9b-it'),
        prompt,
      });

      if (!text || text.trim() === '') {
        throw new Error('AI service returned empty response. Please check your API key and try again.');
      }

      const steps = JSON.parse(text.trim());
      
      if (!Array.isArray(steps)) {
        throw new Error('AI service returned invalid response format');
      }

      for (const step of steps) {
        if (!step.id || !step.type || !step.config) {
          throw new Error('Invalid step format in AI response');
        }
        
        if (!['summarize', 'translate', 'rewrite', 'extract'].includes(step.type)) {
          throw new Error(`Invalid step type: ${step.type}`);
        }

        if (step.type === 'translate' && step.config.targetLanguage) {
          if (!this.validateLanguage(step.config.targetLanguage)) {
            throw new Error(`The suggested language "${step.config.targetLanguage}" is restricted. Please choose from the supported languages.`);
          }
        }
      }

      return steps;

    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('AI service returned invalid JSON. Please try again.');
      }
      throw new Error(`Pipeline step generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 