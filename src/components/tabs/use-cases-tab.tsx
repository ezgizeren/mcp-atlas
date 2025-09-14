import React, { useState } from 'react';
import { UseCase } from '@/types/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Code, Heart, Copy, Check } from 'lucide-react';

interface UseCasesTabProps {
  useCases: UseCase[];
}

export function UseCasesTab({ useCases }: UseCasesTabProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (useCases.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No use cases available yet. Be the first to contribute!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Use Cases & Examples</h3>
        <p className="text-sm text-muted-foreground">
          Practical examples and workflows using this server
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {useCases.map((useCase) => (
          <Card key={useCase.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                {useCase.title}
              </CardTitle>
              <CardDescription>{useCase.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {useCase.workflow && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Workflow</h4>
                  <p className="text-sm text-muted-foreground">
                    {useCase.workflow}
                  </p>
                </div>
              )}

              {useCase.codeSnippet && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Code Example
                  </h4>
                  <div className="relative">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>{useCase.codeSnippet}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(useCase.codeSnippet!, useCase.id)}
                    >
                      {copiedId === useCase.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-wrap gap-1">
                  {useCase.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm">
                  <Heart className="h-3 w-3 mr-1" />
                  {useCase.likes}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                By {useCase.author} •{' '}
                {new Date(useCase.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}