import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Edit, Trash2, Plus } from 'lucide-react';
import { useIsMobile } from '@/app/hooks/use-mobile';

interface PipelineWithSteps {
  id: string;
  name: string;
  description?: string;
  userId: string;
  steps: Array<{
    id: string;
    type: string;
    config: any;
    order: number;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface PipelineListProps {
  pipelines: PipelineWithSteps[];
  isLoading: boolean;
  onSelectPipeline: (pipeline: PipelineWithSteps) => void;
  onDeletePipeline: (pipelineId: string) => void;
  onCreateNew: () => void;
}

export const PipelineList: React.FC<PipelineListProps> = ({
  pipelines,
  isLoading,
  onSelectPipeline,
  onDeletePipeline,
  onCreateNew,
}) => {
  const isMobile = useIsMobile();
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Saved Pipelines</h2>
          <Button onClick={onCreateNew} size="sm">
            <Plus className="w-4 h-4" />
            {!isMobile && <span className="ml-2">New Pipeline</span>}
          </Button>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (pipelines.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Saved Pipelines</h2>
          <Button onClick={onCreateNew} size="sm">
            <Plus className="w-4 h-4" />
            {!isMobile && <span className="ml-2">New Pipeline</span>}
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No pipelines yet</h3>
              <p className="text-sm">Create your first AI pipeline to get started</p>
            </div>
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4" />
              {!isMobile && <span className="ml-2">Create Your First Pipeline</span>}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Saved Pipelines</h2>
        <Button onClick={onCreateNew} size="sm">
          <Plus className="w-4 h-4" />
          {!isMobile && <span className="ml-2">New Pipeline</span>}
        </Button>
      </div>
      <div className="grid gap-4">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {pipeline.description || 'No description'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectPipeline(pipeline)}
                  >
                    <Edit className="w-4 h-4" />
                    {!isMobile && <span className="ml-1">Edit</span>}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeletePipeline(pipeline.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!isMobile && (
                    <Badge variant="secondary">
                      {pipeline.steps.length} step{pipeline.steps.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Created {new Date(pipeline.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSelectPipeline(pipeline)}
                  className="bg-ai-primary hover:bg-ai-primary/90"
                >
                  <Play className="w-4 h-4" />
                  {!isMobile && <span className="ml-1">Run</span>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 