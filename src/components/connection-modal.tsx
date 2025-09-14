import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ServerEntity,
  ConfigEntity,
  DeploymentEntity,
  ConnectionInfo,
} from '@/types/server';
import {
  Copy,
  Check,
  Terminal,
  Code,
  Settings,
  Globe,
  Lock,
} from 'lucide-react';

interface ConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: ServerEntity;
  config: ConfigEntity;
  deployment?: DeploymentEntity;
}

export function ConnectionModal({
  open,
  onOpenChange,
  server,
  config,
  deployment,
}: ConnectionModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getConnectionInfo = (): ConnectionInfo => {
    const isOmniHosted = server.hostingType === 'omni-hosted';

    if (isOmniHosted && deployment) {
      return {
        type: server.serverType,
        hosting: server.hostingType,
        endpoint: deployment.endpoint,
        environment: config.environment,
        authRequired: config.authType !== 'none',
        authInstructions: 'Use your Omni API key for authentication',
        configJson: {
          name: server.name,
          endpoint: deployment.endpoint,
          apiKey: '${OMNI_API_KEY}',
        },
      };
    }

    // External server
    if (server.serverType === 'local-stdio') {
      return {
        type: server.serverType,
        hosting: server.hostingType,
        command: config.manifest?.commands?.start || 'node server.js',
        environment: config.environment,
        authRequired: false,
        configJson: {
          name: server.name,
          transport: 'stdio',
          command: config.manifest?.commands?.start || 'node server.js',
        },
      };
    }

    // Remote server
    return {
      type: server.serverType,
      hosting: server.hostingType,
      endpoint: config.connectionUrl || 'https://your-server.com',
      environment: config.environment,
      authRequired: config.authType !== 'none',
      authInstructions: config.authType ? `Authentication type: ${config.authType}` : undefined,
      configJson: {
        name: server.name,
        transport: server.serverType,
        endpoint: config.connectionUrl || 'https://your-server.com',
        auth: config.authConfig,
      },
    };
  };

  const connectionInfo = getConnectionInfo();
  const configJsonString = JSON.stringify(connectionInfo.configJson, null, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Connection Information</DialogTitle>
          <DialogDescription>
            Configuration details to connect to {server.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{server.serverType}</Badge>
            <Badge variant="outline">{server.hostingType}</Badge>
            {connectionInfo.authRequired && (
              <Badge variant="default">
                <Lock className="h-3 w-3 mr-1" />
                Auth Required
              </Badge>
            )}
          </div>

          <Tabs defaultValue="auto" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="auto">Auto Config</TabsTrigger>
              <TabsTrigger value="manual">Manual Setup</TabsTrigger>
              <TabsTrigger value="env">Environment</TabsTrigger>
            </TabsList>

            <TabsContent value="auto" className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Configuration JSON
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Copy this configuration to your MCP client settings
                </p>
                <div className="relative">
                  <ScrollArea className="h-[250px] w-full rounded-md border">
                    <pre className="p-4 text-xs">
                      <code>{configJsonString}</code>
                    </pre>
                  </ScrollArea>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(configJsonString, 'config-json')}
                  >
                    {copiedId === 'config-json' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {connectionInfo.authRequired && connectionInfo.authInstructions && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Authentication Required
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {connectionInfo.authInstructions}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-3">
                {connectionInfo.endpoint && (
                  <div>
                    <Label className="text-sm font-medium">Endpoint</Label>
                    <div className="flex gap-2 mt-1">
                      <code className="flex-1 text-xs bg-muted p-2 rounded">
                        {connectionInfo.endpoint}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(connectionInfo.endpoint!, 'endpoint')}
                      >
                        {copiedId === 'endpoint' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {connectionInfo.command && (
                  <div>
                    <Label className="text-sm font-medium">
                      STDIO Command
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <code className="flex-1 text-xs bg-muted p-2 rounded">
                        {connectionInfo.command}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(connectionInfo.command!, 'command')}
                      >
                        {copiedId === 'command' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Transport Type</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {connectionInfo.type}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Hosting Type</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {connectionInfo.hosting}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="env" className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Environment Variables
                </h4>
                {connectionInfo.environment &&
                Object.keys(connectionInfo.environment).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(connectionInfo.environment).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 bg-muted rounded text-xs"
                      >
                        <code className="font-semibold">{key}</code>
                        <code className="text-muted-foreground">{value}</code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No environment variables required
                  </p>
                )}
              </div>

              {server.hostingType === 'omni-hosted' && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    Omni API Key Required
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set your OMNI_API_KEY environment variable to authenticate with
                    Omni-hosted services.
                  </p>
                  <code className="text-xs bg-white dark:bg-gray-900 p-2 rounded mt-2 block">
                    export OMNI_API_KEY=your-api-key-here
                  </code>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([configJsonString], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${server.name}-config.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download Config
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}