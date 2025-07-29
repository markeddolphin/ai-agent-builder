import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PipelineStep as PipelineStepComponent } from './PipelineStep';
import { AddStepDialog } from './AddStepDialog';
import { StepConfigDialog } from './StepConfigDialog';
import type { PipelineStep, StepType, StepConfig } from '../../types/pipeline';
import { Plus, Save } from 'lucide-react';
import { useIsMobile } from '../../app/hooks/use-mobile';

interface PipelineBuilderProps {
  steps: PipelineStep[];
  onStepsChange: (steps: PipelineStep[]) => void;
  onRunPipeline: () => void;
  onSavePipeline: () => void;
  isRunning?: boolean;
}

export const PipelineBuilder: React.FC<PipelineBuilderProps> = ({
  steps,
  onStepsChange,
  onSavePipeline,
}) => {
  const [addStepOpen, setAddStepOpen] = useState(false);
  const [configStep, setConfigStep] = useState<PipelineStep | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = steps.findIndex((step) => step.id === active.id);
      const newIndex = steps.findIndex((step) => step.id === over?.id);

      const newSteps = arrayMove(steps, oldIndex, newIndex).map((step, index) => ({
        ...step,
        order: index,
      }));

      onStepsChange(newSteps);
    }
  };

  const addStep = (stepType: StepType) => {
    const newStep: PipelineStep = {
      id: `step-${Date.now()}`,
      type: stepType,
      config: getDefaultConfig(stepType),
      order: steps.length,
    };

    onStepsChange([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    const newSteps = steps
      .filter((step) => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index }));
    onStepsChange(newSteps);
  };

  const configureStep = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (step) {
      setConfigStep(step);
      setConfigOpen(true);
    }
  };

  const saveStepConfig = (stepId: string, config: StepConfig) => {
    const newSteps = steps.map((step) =>
      step.id === stepId ? { ...step, config } : step
    );
    onStepsChange(newSteps);
  };

  const getDefaultConfig = (stepType: StepType): StepConfig => {
    switch (stepType) {
      case 'summarize':
        return { length: 'medium', format: 'paragraph' };
      case 'translate':
        return { targetLanguage: 'English' };
      case 'rewrite':
        return { tone: 'professional', style: 'informative' };
      case 'extract':
        return { extractType: 'keywords' };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center gap-2 sm:gap-3">
            <CardTitle className="flex items-center space-x-1 sm:space-x-2 text-ai-secondary">
              <span>Pipeline Steps</span>
              {steps.length > 0 && !isMobile && (
                <span className="text-sm font-normal text-ai-secondary">
                  ({steps.length} step{steps.length !== 1 ? 's' : ''})
                </span>
              )}
            </CardTitle>
            <div className="flex gap-1 sm:gap-2">
              <div
                className='flex items-center text-ai-secondary gap-1 cursor-pointer hover:text-ai-primary hover:bg-ai-primary/10 px-2 sm:px-3 py-2 rounded-md transition-all duration-200 ease-in-out'
                onClick={() => setAddStepOpen(true)}
              >
                <Plus className="w-4 h-4" />
                {!isMobile && (
                  <span className="text-sm">
                    Add Step
                  </span>
                )}
              </div>
              {steps.length > 0 && (
                <Button
                  variant="accent"
                  size="sm"
                  onClick={onSavePipeline}
                  className="px-2 sm:px-3 py-2"
                >
                  <Save className="w-4 h-4" />
                  {!isMobile && <span className="text-sm">Save</span>}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2 text-ai-secondary">No steps added yet</h3>
              <p className="text-ai-secondary mb-4">
                Start building your AI pipeline by adding your first step
              </p>
              <div
                className='text-ai-secondary flex justify-center items-center gap-1 cursor-pointer hover:text-ai-primary hover:bg-ai-primary/10 px-4 py-2 rounded-md transition-all duration-200 ease-in-out'
                onClick={() => setAddStepOpen(true)}
              >
                <Plus className="w-4 h-4 mt-1" />
                {!isMobile && (
                  <div>
                    Add First Step
                  </div>
                )}
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map((step) => step.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <PipelineStepComponent
                      key={step.id}
                      step={step}
                      isLast={index === steps.length - 1}
                      onRemove={removeStep}
                      onConfigure={configureStep}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <AddStepDialog
        open={addStepOpen}
        onOpenChange={setAddStepOpen}
        onSelectStep={addStep}
      />

      <StepConfigDialog
        step={configStep}
        open={configOpen}
        onOpenChange={setConfigOpen}
        onSave={saveStepConfig}
      />
    </div>
  );
};