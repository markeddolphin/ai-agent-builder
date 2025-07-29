import { useState } from 'react';
import { usePipelines } from '../../app/hooks/usePipelines';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Plus, Search, Trash2, Edit } from 'lucide-react';
import type { StepType, StepConfig } from '../../types/pipeline';

interface PipelineFormData {
  name: string;
  description: string;
  steps: Array<{
    type: StepType;
    config: StepConfig;
    order: number;
  }>;
}

export function PipelineManager() {
  const {
    pipelines,
    isLoadingPipelines,
    createPipeline,
    updatePipeline,
    deletePipeline,
    isCreatingPipeline,
    isUpdatingPipeline,
    isDeletingPipeline,
    error,
    clearError,
    searchPipelines,
  } = usePipelines();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof pipelines>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<string | null>(null);
  const [formData, setFormData] = useState<PipelineFormData>({
    name: '',
    description: '',
    steps: [
      {
        type: 'summarize',
        config: { length: 'medium', format: 'paragraph' },
        order: 1,
      },
    ],
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPipelines(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreatePipeline = async () => {
    if (!formData.name.trim()) {
      alert('Pipeline name is required');
      return;
    }

    try {
      await createPipeline({
        name: formData.name,
        description: formData.description,
        steps: formData.steps,
      });

      // reset form
      setFormData({
        name: '',
        description: '',
        steps: [
          {
            type: 'summarize',
            config: { length: 'medium', format: 'paragraph' },
            order: 1,
          },
        ],
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create pipeline:', error);
    }
  };

  const handleUpdatePipeline = async (pipelineId: string) => {
    try {
      await updatePipeline({
        id: pipelineId,
        data: {
          name: formData.name,
          description: formData.description,
          steps: formData.steps,
        },
      });

      setEditingPipeline(null);
      setFormData({
        name: '',
        description: '',
        steps: [
          {
            type: 'summarize',
            config: { length: 'medium', format: 'paragraph' },
            order: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to update pipeline:', error);
    }
  };

  const handleDeletePipeline = async (pipelineId: string) => {
    if (confirm('Are you sure you want to delete this pipeline?')) {
      try {
        await deletePipeline(pipelineId);
      } catch (error) {
        console.error('Failed to delete pipeline:', error);
      }
    }
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          type: 'summarize',
          config: { length: 'medium', format: 'paragraph' },
          order: prev.steps.length + 1,
        },
      ],
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };



  const displayPipelines = searchResults.length > 0 ? searchResults : pipelines;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pipeline Manager</h1>
          <p className="text-muted-foreground">
            Create and manage your AI processing pipelines
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Pipeline
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertDescription>
            {error}
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Search pipelines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {(showCreateForm || editingPipeline) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPipeline ? 'Edit Pipeline' : 'Create New Pipeline'}
            </CardTitle>
            <CardDescription>
              Define your AI processing pipeline with multiple steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pipeline Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter pipeline name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this pipeline does"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Steps</label>
              <div className="space-y-2">
                {formData.steps.map((step, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 border rounded">
                    <Badge>{step.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Order: {step.order}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      disabled={formData.steps.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addStep}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={editingPipeline ? () => handleUpdatePipeline(editingPipeline) : handleCreatePipeline}
                disabled={isCreatingPipeline || isUpdatingPipeline}
              >
                {isCreatingPipeline || isUpdatingPipeline ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingPipeline ? 'Update Pipeline' : 'Create Pipeline'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPipeline(null);
                  setFormData({
                    name: '',
                    description: '',
                    steps: [
                      {
                        type: 'summarize',
                        config: { length: 'medium', format: 'paragraph' },
                        order: 1,
                      },
                    ],
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingPipelines ? (
          <div className="col-span-full flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : displayPipelines.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            {searchResults.length > 0 ? 'No pipelines found matching your search.' : 'No pipelines created yet.'}
          </div>
        ) : (
          displayPipelines.map((pipeline) => (
            <Card key={pipeline.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                    <CardDescription>
                      {pipeline.description || 'No description'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPipeline(pipeline.id);
                        setFormData({
                          name: pipeline.name,
                          description: pipeline.description || '',
                          steps: pipeline.steps.map(step => ({
                            type: step.type as StepType,
                            config: step.config as StepConfig,
                            order: step.order,
                          })),
                        });
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePipeline(pipeline.id)}
                      disabled={isDeletingPipeline}
                    >
                      {isDeletingPipeline ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Steps:</span>
                    <Badge variant="secondary">{pipeline.steps.length}</Badge>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {pipeline.steps.map((step, index) => (
                      <Badge key={index} variant="outline">
                        {step.type}
                      </Badge>
                    ))}
                  </div>
                                     <div className="flex justify-between text-sm text-muted-foreground">
                     <span>Created:</span>
                     <span>{pipeline.createdAt ? new Date(pipeline.createdAt).toLocaleDateString() : 'Unknown'}</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 