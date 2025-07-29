import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { type StepType, STEP_CONFIGS } from '../../types/pipeline';

interface AddStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectStep: (stepType: StepType) => void;
}

export const AddStepDialog: React.FC<AddStepDialogProps> = ({
  open,
  onOpenChange,
  onSelectStep,
}) => {
  const handleSelectStep = (stepType: StepType) => {
    onSelectStep(stepType);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>Add Pipeline Step</DialogTitle>
                  <DialogDescription>
              Choose the type of AI operation to add to your pipeline
            </DialogDescription>
          </DialogHeader>
        
        <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-4">
          {Object.entries(STEP_CONFIGS).map(([type, config]) => (
            <Card
              key={type}
              className="cursor-pointer transition-all duration-200 hover:shadow-card hover:scale-105 border-border/50 bg-card/50 backdrop-blur-sm"
              onClick={() => handleSelectStep(type as StepType)}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-ai flex-shrink-0`}>
                    <span className="text-xl sm:text-2xl">{config.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg leading-tight">{config.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1">
                      {config.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {Object.keys(config.options).map((option) => (
                    <span
                      key={option}
                      className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};