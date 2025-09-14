import React, { useState } from 'react';
import { ToolEntity, ServerEntity } from '@/types/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  PlayCircle,
  Code,
  ChevronDown,
  ChevronUp,
  Terminal,
  FileJson,
  ArrowRight,
} from 'lucide-react';

interface ToolsTabProps {
  tools: ToolEntity[];
  server: ServerEntity;
}

export function ToolsTab({ tools, server }: ToolsTabProps) {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const toggleTool = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
  };

  const handleTestInPlayground = (tool: ToolEntity) => {
    const playgroundUrl = `/playground?server=${server.id}&tool=${tool.id}&version=${server.currentVersion}`;
    window.open(playgroundUrl, '_blank');
  };

  if (tools.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No tools available for this server</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Available Tools</h3>
          <p className="text-sm text-muted-foreground">
            {tools.length} tool{tools.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const playgroundUrl = `/playground?server=${server.id}&version=${server.currentVersion}`;
            window.open(playgroundUrl, '_blank');
          }}
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          Open All in Playground
        </Button>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {tools.map((tool) => (
            <Card key={tool.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleTool(tool.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">
                        {tool.name}
                      </CardTitle>
                      {expandedTools.has(tool.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      {tool.description}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestInPlayground(tool);
                    }}
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                </div>
              </CardHeader>

              {expandedTools.has(tool.id) && (
                <CardContent className="border-t">
                  <div className="space-y-4 pt-4">
                    {tool.parameters.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <FileJson className="h-4 w-4" />
                          Parameters
                        </h4>
                        <div className="space-y-2">
                          {tool.parameters.map((param) => (
                            <div
                              key={param.name}
                              className="flex items-start gap-2 text-sm"
                            >
                              <code className="font-mono bg-muted px-2 py-1 rounded">
                                {param.name}
                              </code>
                              <Badge
                                variant={param.required ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              <span className="text-muted-foreground flex-1">
                                {param.description}
                              </span>
                              {param.default !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  Default: <code>{JSON.stringify(param.default)}</code>
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Output
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <Badge variant="outline">{tool.output.type}</Badge>
                          <span className="text-muted-foreground">
                            {tool.output.description}
                          </span>
                        </div>
                        {tool.output.schema && (
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            <code>{JSON.stringify(tool.output.schema, null, 2)}</code>
                          </pre>
                        )}
                      </div>
                    </div>

                    {tool.examples && tool.examples.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Examples
                          </h4>
                          <div className="space-y-2">
                            {tool.examples.map((example, index) => (
                              <pre
                                key={index}
                                className="text-xs bg-muted p-3 rounded overflow-x-auto"
                              >
                                <code>{example}</code>
                              </pre>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="pt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a
                          href={`/registry/tools/${server.id}/${tool.id}/${server.currentVersion}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Tool Details
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}