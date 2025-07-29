import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type PipelineStep as PipelineStepType, STEP_CONFIGS } from '@/types/pipeline';
import { GripVertical, X, Settings, ArrowDown } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useIsMobile } from '@/app/hooks/use-mobile';

interface PipelineStepProps {
  step: PipelineStepType;
  isLast: boolean;
  onRemove: (stepId: string) => void;
  onConfigure: (stepId: string) => void;
}

export const PipelineStep: React.FC<PipelineStepProps> = ({
  step,
  isLast,
  onRemove,
  onConfigure,
}) => {
  const isMobile = useIsMobile();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stepConfig = STEP_CONFIGS[step.type];

  return (
    <div className="relative">
      <Card
        ref={setNodeRef}
        style={style}
        className={`transition-all duration-200 hover:shadow-card ${
          isDragging ? 'opacity-50 rotate-3 shadow-glow' : ''
        } border-border/50 bg-card/50 backdrop-blur-sm`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{stepConfig.icon}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">{stepConfig.title}</h3>
                  {!isMobile && (
                    <p className="text-xs text-muted-foreground truncate">
                      {stepConfig.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onConfigure(step.id)}
                className="h-8 w-8 p-0"
              >
                <Settings className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(step.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1">
            {Object.entries(step.config).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {!isMobile && `${key}: `}{String(value)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {!isLast && (
        <div className="flex justify-center py-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-ai">
            <ArrowDown className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};