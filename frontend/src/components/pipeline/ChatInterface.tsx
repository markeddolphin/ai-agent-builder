import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { realAiService } from '../../app/services/realAiService';
import { toast } from 'sonner';
import type { PipelineStep } from '../../types/pipeline';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onStepsGenerated: (steps: PipelineStep[]) => void;
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onStepsGenerated,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI pipeline assistant. Describe what you want to accomplish with your text, and I'll build the perfect pipeline for you. For example:\n\n• \"Make this sound more professional and translate to Italian\"\n• \"Summarize this text and extract key topics\"\n• \"Rewrite this in a casual tone and translate to Spanish\"",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    try {
      // call the backend to generate pipeline steps
      const result = await realAiService.generateSteps(userMessage.content);
      const generatedSteps: PipelineStep[] = result.steps.map((step: any, index: number) => ({
        id: step.id,
        type: step.type,
        config: step.config,
        order: index + 1,
      }));

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Perfect! I've created a pipeline with ${generatedSteps.length} step${generatedSteps.length !== 1 ? 's' : ''} for you:\n\n${generatedSteps.map((step, index) => `${index + 1}. ${step.type.charAt(0).toUpperCase() + step.type.slice(1)}${step.config.targetLanguage ? ` to ${step.config.targetLanguage}` : ''}${step.config.style ? ` (${step.config.style} style)` : ''}`).join('\n')}\n\nWould you like me to add this to your pipeline?`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // store steps for later use
      (assistantMessage as any).generatedSteps = generatedSteps;

    } catch (error) {
      console.error('Failed to generate pipeline steps:', error);
      
      let errorContent = `Sorry, I couldn't generate the pipeline steps. Please try again with a different description.`;
      
      // check language restriction error
      if (error instanceof Error && error.message.includes('restricted')) {
        errorContent = `The suggested language is restricted. Please try again with a supported language like English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, or other common languages.`;
      } else if (error instanceof Error) {
        errorContent = `Sorry, I couldn't generate the pipeline steps. ${error.message}`;
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySteps = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && (message as any).generatedSteps) {
      onStepsGenerated((message as any).generatedSteps);
      toast.success('Pipeline steps added successfully!');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-card/95 backdrop-blur-sm border-ai-primary/30">
        <div className="flex items-center justify-between p-4 border-b border-ai-primary/20">
          <h3 className="text-lg font-semibold text-ai-secondary">AI Pipeline Assistant</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-ai-primary hover:text-ai-secondary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-ai-primary to-ai-secondary text-white'
                    : 'bg-muted/50 text-ai-secondary border border-ai-primary/20'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm text-white">{message.content}</div>
                {message.type === 'assistant' && (message as any).generatedSteps && (
                  <div className="mt-3 pt-3 border-t border-ai-primary/20">
                    <Button
                      size="sm"
                      onClick={() => handleApplySteps(message.id)}
                      className="bg-gradient-to-r from-ai-primary to-ai-secondary text-white hover:from-ai-primary/90 hover:to-ai-secondary/90"
                    >
                      Apply to Pipeline
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-muted/50 text-ai-secondary border border-ai-primary/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-ai-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Generating pipeline steps...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-ai-primary/20">
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe what you want to accomplish with your text..."
              className="flex-1 px-3 py-2 border border-ai-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-ai-primary/50 focus:border-ai-primary bg-card/80 backdrop-blur-sm text-white placeholder-white/50 resize-none"
              rows={2}
              disabled={isGenerating}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isGenerating}
              className="bg-gradient-to-r from-ai-primary to-ai-secondary text-white hover:from-ai-primary/90 hover:to-ai-secondary/90 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}; 