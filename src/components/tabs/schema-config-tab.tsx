import React, { useState } from 'react';
import { ConfigEntity, ServerEntity, UserPermissions, DeploymentEntity } from '@/types/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  Key,
  Settings,
  Save,
  Lock,
  Unlock,
  Copy,
  Check,
} from 'lucide-react';

interface SchemaConfigTabProps {
  config: ConfigEntity;
  server: ServerEntity;
  permissions: UserPermissions;
  deployment?: DeploymentEntity;
}

export function SchemaConfigTab({
  config,
  server,
  permissions,
  deployment,
}: SchemaConfigTabProps) {
  const [runtimeConfig, setRuntimeConfig] = useState(config.environment || {});
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const isOmniHosted = server.hostingType === 'omni-hosted';
  const canEdit = isOmniHosted && permissions.canEditConfig;

  const handleSaveConfig = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tabs defaultValue="connection" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="connection">Connection</TabsTrigger>
        <TabsTrigger value="runtime">Runtime Config</TabsTrigger>
        <TabsTrigger value="manifest">Manifest</TabsTrigger>
      </TabsList>

      <TabsContent value="connection" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Connection Details
            </CardTitle>
            <CardDescription>
              Endpoint and authentication configuration for {server.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isOmniHosted && deployment ? (
              <div className="space-y-4">
                <div>
                  <Label>SSE Endpoint</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={deployment.endpoint}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(deployment.endpoint)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unique WebSocket endpoint for this Omni-hosted instance
                  </p>
                </div>

                <div>
                  <Label>Instance ID</Label>
                  <Input
                    value={deployment.instanceId}
                    readOnly
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Connection URL</Label>
                  <Input
                    value={config.connectionUrl || 'Not configured'}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    External server endpoint
                  </p>
                </div>
              </div>
            )}

            <div>
              <Label>Authentication Type</Label>
              <div className="flex items-center gap-2 mt-1">
                {config.authType === 'none' ? (
                  <Badge variant="secondary">
                    <Unlock className="h-3 w-3 mr-1" />
                    No Auth
                  </Badge>
                ) : (
                  <Badge variant="default">
                    <Lock className="h-3 w-3 mr-1" />
                    {config.authType || 'None'}
                  </Badge>
                )}
              </div>
            </div>

            {config.authConfig && Object.keys(config.authConfig).length > 0 && (
              <div>
                <Label>Auth Configuration</Label>
                <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-x-auto">
                  <code>{JSON.stringify(config.authConfig, null, 2)}</code>
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="runtime" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Runtime Configuration
            </CardTitle>
            <CardDescription>
              Environment variables and runtime settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canEdit && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  {isOmniHosted
                    ? 'You do not have permission to edit the configuration'
                    : 'Configuration is read-only for external servers'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {Object.entries(runtimeConfig).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-2 items-center">
                  <Label className="font-mono text-sm">{key}</Label>
                  <Input
                    className="col-span-2 font-mono text-sm"
                    value={value}
                    onChange={(e) =>
                      canEdit &&
                      setRuntimeConfig({
                        ...runtimeConfig,
                        [key]: e.target.value,
                      })
                    }
                    disabled={!canEdit}
                  />
                </div>
              ))}

              {Object.keys(runtimeConfig).length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No environment variables configured
                </p>
              )}
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <Button onClick={handleSaveConfig} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setRuntimeConfig({
                      ...runtimeConfig,
                      NEW_VAR: '',
                    })
                  }
                >
                  <Key className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manifest" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>MCP Manifest</CardTitle>
            <CardDescription>
              Server manifest configuration (mcp-omni.json)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                <code>
                  {config.manifest
                    ? JSON.stringify(config.manifest, null, 2)
                    : 'No manifest available'}
                </code>
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}