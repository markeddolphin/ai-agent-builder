import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { PipelineBuilder } from '../../components/pipeline/PipelineBuilder';
import { PipelineTestPanel } from '../../components/pipeline/PipelineTestPanel';
import { PipelineList } from '../../components/pipeline/PipelineList';
import { ChatInterface } from '../../components/pipeline/ChatInterface';
import { Button } from '@/components/ui/button';
import { usePipelines } from '../hooks/usePipelines';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from '../hooks/use-mobile';
import type { PipelineStep, Pipeline, PipelineExecution } from '../../types/pipeline';
import { realAiService } from '../services/realAiService';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const {
    pipelines,
    isLoadingPipelines,
    createPipeline,
    updatePipeline,
    deletePipeline,
    isCreatingPipeline,
    isUpdatingPipeline,
    error,
    clearError,
  } = usePipelines();

  const [currentPipeline, setCurrentPipeline] = useState<Pipeline>({
    id: 'default',
    name: 'My AI Pipeline',
    description: 'Custom AI processing workflow powered by Groq',
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [isNewPipeline, setIsNewPipeline] = useState(true);
  const [pipelineName, setPipelineName] = useState('My AI Pipeline');
  const [pipelineDescription, setPipelineDescription] = useState('Custom AI processing workflow powered by Groq');
  const [showPipelineList, setShowPipelineList] = useState(true);
  const [showChatInterface, setShowChatInterface] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleStepsChange = (steps: PipelineStep[]) => {
    setCurrentPipeline((prev: Pipeline) => ({
      ...prev,
      steps,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleRunPipeline = async (input: string): Promise<PipelineExecution> => {
    if (currentPipeline.steps.length === 0) {
      throw new Error('No steps in pipeline');
    }

    return realAiService.executePipeline(currentPipeline.steps, input);
  };

  const handleSavePipeline = async () => {
    if (!user?.id) {
      toast.error('Please log in to save pipelines');
      return;
    }

    if (currentPipeline.steps.length === 0) {
      toast.error('Please add at least one step to your pipeline');
      return;
    }

    if (!pipelineName.trim()) {
      toast.error('Please enter a pipeline name');
      return;
    }

    try {
      if (isNewPipeline) {
        await createPipeline({
          name: pipelineName.trim(),
          description: pipelineDescription.trim(),
          steps: currentPipeline.steps.map((step: PipelineStep, index: number) => ({
            type: step.type,
            config: step.config,
            order: index + 1,
          })),
        });
        toast.success('Pipeline created successfully!');
        setIsNewPipeline(false);
      } else {
        await updatePipeline({
          id: currentPipeline.id,
          data: {
            name: pipelineName.trim(),
            description: pipelineDescription.trim(),
            steps: currentPipeline.steps.map((step: PipelineStep, index: number) => ({
              type: step.type,
              config: step.config,
              order: index + 1,
            })),
          },
        });
        toast.success('Pipeline updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to save pipeline. Please try again.');
    }
  };

  const handleRunFromBuilder = async () => {
    toast.info('Use the Test Panel below to run your pipeline with custom input');
  };

  const handleSelectPipeline = (pipeline: any) => {
    const frontendPipeline: Pipeline = {
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description || '',
      steps: pipeline.steps.map((step: any) => ({
        id: step.id,
        type: step.type as any,
        config: step.config,
        order: step.order,
      })),
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt,
    };
    
    setCurrentPipeline(frontendPipeline);
    setPipelineName(pipeline.name);
    setPipelineDescription(pipeline.description || '');
    setIsNewPipeline(false);
    setShowPipelineList(false);
    toast.success(`Loaded pipeline: ${pipeline.name}`);
  };

  const handleDeletePipeline = async (pipelineId: string) => {
    try {
      await deletePipeline(pipelineId);
      toast.success('Pipeline deleted successfully');
      
      if (currentPipeline.id === pipelineId) {
        setCurrentPipeline({
          id: 'default',
          name: 'My AI Pipeline',
          description: 'Custom AI processing workflow powered by Groq',
          steps: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setPipelineName('My AI Pipeline');
        setPipelineDescription('Custom AI processing workflow powered by Groq');
        setIsNewPipeline(true);
      }
    } catch (error) {
      toast.error('Failed to delete pipeline. Please try again.');
    }
  };

  const handleCreateNew = () => {
    setCurrentPipeline({
      id: 'default',
      name: 'My AI Pipeline',
      description: 'Custom AI processing workflow powered by Groq',
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setPipelineName('My AI Pipeline');
    setPipelineDescription('Custom AI processing workflow powered by Groq');
    setIsNewPipeline(true);
    setShowPipelineList(false);
  };

  const handleStepsGenerated = (steps: PipelineStep[]) => {
    setCurrentPipeline((prev: Pipeline) => ({
      ...prev,
      steps,
      updatedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 text-ai-secondary">
        {showPipelineList ? (
          <div className="max-w-4xl mx-auto">
            <PipelineList
              pipelines={pipelines}
              isLoading={isLoadingPipelines}
              onSelectPipeline={handleSelectPipeline}
              onDeletePipeline={handleDeletePipeline}
              onCreateNew={handleCreateNew}
            />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setShowPipelineList(true)}
                  className="px-2 sm:px-4 py-2 border border-ai-primary/30 text-ai-primary rounded-lg hover:bg-ai-primary/10 hover:border-ai-primary/50 transition-all duration-200 flex items-center gap-1 sm:gap-2 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {!isMobile && 'Back to Pipelines'}
                </button>
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    onClick={() => setShowChatInterface(true)}
                    className="px-2 sm:px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-ai-primary text-white rounded-md hover:from-purple-600 hover:via-pink-600 hover:to-ai-secondary flex items-center gap-1 sm:gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {!isMobile && 'AI Assistant'}
                  </Button>
                  <button
                    onClick={handleSavePipeline}
                    disabled={!user?.id || currentPipeline.steps.length === 0}
                    className="px-2 sm:px-4 py-2 bg-gradient-to-r from-ai-primary to-ai-secondary text-white rounded-md hover:from-ai-primary/90 hover:to-ai-secondary/90 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isCreatingPipeline || isUpdatingPipeline ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {!isMobile && 'Saving...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {!isMobile && 'Save Pipeline'}
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="space-y-2">
                  <label htmlFor="pipeline-name" className="block text-sm font-semibold text-ai-secondary">
                    Pipeline Name
                  </label>
                  <input
                    id="pipeline-name"
                    type="text"
                    value={pipelineName}
                    onChange={(e) => setPipelineName(e.target.value)}
                    className="w-full px-4 py-3 border border-ai-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-ai-primary/50 focus:border-ai-primary bg-card/80 backdrop-blur-sm text-white placeholder-white/50 transition-all duration-200 shadow-sm"
                    placeholder="Enter pipeline name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="pipeline-description" className="block text-sm font-semibold text-ai-secondary">
                    Description
                  </label>
                  <textarea
                    id="pipeline-description"
                    value={pipelineDescription}
                    onChange={(e) => setPipelineDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-ai-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-ai-primary/50 focus:border-ai-primary bg-card/80 backdrop-blur-sm text-white placeholder-white/50 transition-all duration-200 resize-none shadow-sm"
                    placeholder="Describe your pipeline"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Pipeline Builder</h2>
                </div>
                <PipelineBuilder
                  steps={currentPipeline.steps}
                  onStepsChange={handleStepsChange}
                  onRunPipeline={handleRunFromBuilder}
                  onSavePipeline={handleSavePipeline}
                />
              </div>

              <div className="space-y-6">
                <PipelineTestPanel
                  steps={currentPipeline.steps}
                  onRunPipeline={handleRunPipeline}
                />
              </div>
            </div>
          </>
        )}

        {showChatInterface && (
          <ChatInterface
            onStepsGenerated={handleStepsGenerated}
            onClose={() => setShowChatInterface(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard