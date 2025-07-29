import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type PipelineStep, type StepConfig, STEP_CONFIGS } from '@/types/pipeline';

interface StepConfigDialogProps {
  step: PipelineStep | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (stepId: string, config: StepConfig) => void;
}

export const StepConfigDialog: React.FC<StepConfigDialogProps> = ({
  step,
  open,
  onOpenChange,
  onSave,
}) => {
  const [config, setConfig] = useState<StepConfig>({});

  useEffect(() => {
    if (step) {
      setConfig(step.config);
    }
  }, [step]);

  const handleSave = () => {
    if (step) {
      onSave(step.id, config);
      onOpenChange(false);
    }
  };

  if (!step) return null;

  const stepConfig = STEP_CONFIGS[step.type];

  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{stepConfig.icon}</span>
              <span>Configure {stepConfig.title}</span>
            </DialogTitle>
            <DialogDescription>
              Customize the settings for this pipeline step
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-4 py-4">
          {step.type === 'summarize' && (
            <>
              <div className="space-y-2">
                <Label>Summary Length</Label>
                <Select
                  value={config.length || 'medium'}
                  onValueChange={(value) => updateConfig('length', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                    <SelectItem value="medium">Medium (3-5 sentences)</SelectItem>
                    <SelectItem value="long">Long (6+ sentences)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={config.format || 'paragraph'}
                  onValueChange={(value) => updateConfig('format', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                    <SelectItem value="bullets">Bullet Points</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step.type === 'translate' && (
            <div className="space-y-2">
              <Label>Target Language</Label>
              <Select
                value={config.targetLanguage || 'English'}
                onValueChange={(value) => updateConfig('targetLanguage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(stepConfig.options as any).targetLanguage?.map((lang: string) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step.type === 'rewrite' && (
            <>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select
                  value={config.tone || 'professional'}
                  onValueChange={(value) => updateConfig('tone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(stepConfig.options as any).tone?.map((tone: string) => (
                      <SelectItem key={tone} value={tone}>
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Style</Label>
                <Select
                  value={config.style || 'informative'}
                  onValueChange={(value) => updateConfig('style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(stepConfig.options as any).style?.map((style: string) => (
                      <SelectItem key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step.type === 'extract' && (
            <div className="space-y-2">
              <Label>Extract Type</Label>
              <Select
                value={config.extractType || 'keywords'}
                onValueChange={(value) => updateConfig('extractType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(stepConfig.options as any).extractType?.map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="ai" onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};