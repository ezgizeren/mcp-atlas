import React from 'react';
import { ServerEntity, ConfigEntity } from '@/types/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Download,
  Terminal,
  Code,
  Settings2,
  Check,
} from 'lucide-react';

interface InstallationTabProps {
  server: ServerEntity;
  config: ConfigEntity;
  onOpenConnectionModal: () => void;
}

export function InstallationTab({
  server,
  config,
  onOpenConnectionModal,
}: InstallationTabProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getInstallCommand = () => {
    if (server.hostingType === 'omni-hosted') {
      return `npm install @mcphub/client`;
    }
    return `npm install mcp-client`;
  };

  const getConnectionCode = () => {
    if (server.hostingType === 'omni-hosted') {
      return `import { MCPClient } from '@mcphub/client';

const client = new MCPClient({
  serverName: '${server.name}',
  apiKey: process.env.OMNI_API_KEY,
  endpoint: 'wss://[instance-id].omni.mcphub.ai/'
});

await client.connect();`;
    } else {
      return `import { MCPClient } from 'mcp-client';

const client = new MCPClient({
  serverName: '${server.name}',
  transport: '${server.serverType}',
  ${server.serverType === 'local-stdio'
    ? `command: '${config.manifest?.commands?.start || 'node server.js'}'`
    : `endpoint: '${config.connectionUrl || 'https://your-server.com'}'`}
});

await client.connect();`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Installation Guide</h3>
          <p className="text-sm text-muted-foreground">
            Set up {server.name} in your application
          </p>
        </div>
        <Button onClick={onOpenConnectionModal}>
          <Settings2 className="h-4 w-4 mr-2" />
          Get Connection Info
        </Button>
      </div>

      <Tabs defaultValue="nodejs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nodejs">Node.js</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="cli">CLI</TabsTrigger>
        </TabsList>

        <TabsContent value="nodejs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Node.js Installation
              </CardTitle>
              <CardDescription>
                Install and configure the MCP client for Node.js
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  1. Install the package
                </Label>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>{getInstallCommand()}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(getInstallCommand(), 'install-node')}
                  >
                    {copiedCode === 'install-node' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  2. Initialize the client
                </Label>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>{getConnectionCode()}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(getConnectionCode(), 'code-node')}
                  >
                    {copiedCode === 'code-node' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {server.hostingType === 'omni-hosted' && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    3. Set up environment variables
                  </Label>
                  <div className="relative">
                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                      <code>{`# .env
OMNI_API_KEY=your-api-key-here`}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy('OMNI_API_KEY=your-api-key-here', 'env-node')}
                    >
                      {copiedCode === 'env-node' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="python" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Python Installation
              </CardTitle>
              <CardDescription>
                Install and configure the MCP client for Python
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  1. Install the package
                </Label>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>pip install mcp-client</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy('pip install mcp-client', 'install-python')}
                  >
                    {copiedCode === 'install-python' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  2. Initialize the client
                </Label>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>{`from mcp_client import MCPClient

client = MCPClient(
    server_name="${server.name}",
    ${server.hostingType === 'omni-hosted'
      ? `api_key=os.environ.get("OMNI_API_KEY"),
    endpoint="wss://[instance-id].omni.mcphub.ai/"`
      : server.serverType === 'local-stdio'
      ? `transport="stdio",
    command="${config.manifest?.commands?.start || 'python server.py'}"`
      : `transport="${server.serverType}",
    endpoint="${config.connectionUrl || 'https://your-server.com'}"`}
)

await client.connect()`}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy('...', 'code-python')}
                  >
                    {copiedCode === 'code-python' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cli" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                CLI Usage
              </CardTitle>
              <CardDescription>
                Use {server.name} directly from the command line
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Install MCP CLI
                </Label>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>npm install -g @mcphub/cli</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy('npm install -g @mcphub/cli', 'install-cli')}
                  >
                    {copiedCode === 'install-cli' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Connect to server
                </Label>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    <code>{`mcp connect ${server.name} ${
                      server.hostingType === 'omni-hosted'
                        ? '--omni'
                        : server.serverType === 'local-stdio'
                        ? '--stdio'
                        : '--remote'
                    }`}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy('...', 'connect-cli')}
                  >
                    {copiedCode === 'connect-cli' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}