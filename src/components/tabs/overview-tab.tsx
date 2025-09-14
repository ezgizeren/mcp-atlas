import React from 'react';
import { ServerEntity, FileNode } from '@/types/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OverviewTabProps {
  server: ServerEntity;
}

export function OverviewTab({ server }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {server.disclaimers && server.disclaimers.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            {server.disclaimers.map((disclaimer, index) => (
              <p key={index} className="text-sm">
                {disclaimer}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>README</CardTitle>
          <CardDescription>
            Documentation and usage instructions for {server.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {server.readme ? (
                <ReadmeContent content={server.readme} />
              ) : (
                <p className="text-muted-foreground">No README available</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {server.projectStructure && (
        <Card>
          <CardHeader>
            <CardTitle>Project Structure</CardTitle>
            <CardDescription>
              File and directory organization of the server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-1">
                {server.projectStructure.map((node, index) => (
                  <FileTreeNode key={index} node={node} depth={0} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReadmeContent({ content }: { content: string }) {
  const sections = content.split(/(?=^#{1,6}\s)/gm);

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const lines = section.trim().split('\n');
        const firstLine = lines[0];
        const restContent = lines.slice(1).join('\n');

        if (firstLine.startsWith('#')) {
          const level = firstLine.match(/^#+/)?.[0].length || 1;
          const title = firstLine.replace(/^#+\s*/, '');
          const HeadingTag = `h${Math.min(level, 6)}` as keyof React.JSX.IntrinsicElements;

          return (
            <div key={index} className="space-y-2">
              <HeadingTag className={`font-semibold ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'}`}>
                {title}
              </HeadingTag>
              {restContent && (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {restContent}
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={index} className="text-sm text-muted-foreground whitespace-pre-wrap">
            {section}
          </div>
        );
      })}
    </div>
  );
}

function FileTreeNode({ node, depth }: { node: FileNode; depth: number }) {
  const [isExpanded, setIsExpanded] = React.useState(depth < 2);
  const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto py-1 px-2 justify-start w-full"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )
        ) : (
          <span className="w-5" />
        )}
        {node.type === 'directory' ? (
          <Folder className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
        ) : (
          <File className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
        )}
        <span className="text-sm">{node.name}</span>
      </Button>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, index) => (
            <FileTreeNode key={index} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}