import React, { useState } from 'react';
import { DeploymentEntity, UserPermissions } from '@/types/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Cloud,
  Play,
  Square,
  RotateCw,
  Activity,
  Terminal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Cpu,
  HardDrive,
  Clock,
  Zap,
} from 'lucide-react';

interface DeploymentTabProps {
  deployment?: DeploymentEntity;
  permissions: UserPermissions;
  serverId: string;
}

export function DeploymentTab({
  deployment,
  permissions,
  serverId,
}: DeploymentTabProps) {
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  if (!deployment) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No deployment information available
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!permissions.canManageDeployment) return;

    setIsPerformingAction(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPerformingAction(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'stopped':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      running: 'default',
      stopped: 'secondary',
      starting: 'outline',
      stopping: 'outline',
      error: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Deployment Status
          </CardTitle>
          <CardDescription>
            Manage and monitor your Omni-hosted deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Instance Status</p>
              <div className="flex items-center gap-2">
                {getStatusBadge(deployment.status)}
                <span className="text-xs text-muted-foreground">
                  Instance ID: {deployment.instanceId}
                </span>
              </div>
            </div>

            {permissions.canManageDeployment && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('start')}
                  disabled={isPerformingAction || deployment.status === 'running'}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('stop')}
                  disabled={isPerformingAction || deployment.status === 'stopped'}
                >
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('restart')}
                  disabled={isPerformingAction || deployment.status !== 'running'}
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  Restart
                </Button>
              </div>
            )}
          </div>

          {!permissions.canManageDeployment && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to manage this deployment
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Endpoint</p>
              <p className="text-xs font-mono text-muted-foreground">
                {deployment.endpoint}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-xs text-muted-foreground">
                {new Date(deployment.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Metrics</CardTitle>
              <CardDescription>
                Real-time resource usage and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <span className="text-sm font-mono">
                      {deployment.resourceMetrics.cpu}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${deployment.resourceMetrics.cpu}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    <span className="text-sm font-mono">
                      {deployment.resourceMetrics.memory}MB
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${Math.min(
                          (deployment.resourceMetrics.memory / 512) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Requests</span>
                    </div>
                    <span className="text-sm font-mono">
                      {deployment.resourceMetrics.requests}/min
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Latency</span>
                    </div>
                    <span className="text-sm font-mono">
                      {deployment.resourceMetrics.latency}ms
                    </span>
                  </div>
                </div>
              </div>

              {deployment.resourceMetrics.errors > 0 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {deployment.resourceMetrics.errors} errors in the last hour
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Deployment Logs
              </CardTitle>
              <CardDescription>
                Real-time logs from your deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-1 font-mono text-xs">
                  {deployment.logs.map((log, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 p-1 ${
                        log.level === 'error'
                          ? 'text-red-600 dark:text-red-400'
                          : log.level === 'warn'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span className="text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge
                        variant={
                          log.level === 'error'
                            ? 'destructive'
                            : log.level === 'warn'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs h-5"
                      >
                        {log.level}
                      </Badge>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Configuration</CardTitle>
              <CardDescription>
                Runtime configuration for this deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Runtime</p>
                  <p className="text-sm text-muted-foreground">
                    {deployment.config.runtime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-sm text-muted-foreground">
                    {deployment.config.version}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Auto Restart</p>
                  <p className="text-sm text-muted-foreground">
                    {deployment.config.autoRestart ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Max Memory</p>
                  <p className="text-sm text-muted-foreground">
                    {deployment.config.maxMemory || 'Default'}MB
                  </p>
                </div>
              </div>

              {Object.keys(deployment.config.environment).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Environment Variables</p>
                  <div className="space-y-1">
                    {Object.entries(deployment.config.environment).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex gap-2 text-xs font-mono bg-muted p-2 rounded"
                      >
                        <span className="font-semibold">{key}:</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}