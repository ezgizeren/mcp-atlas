import React from 'react';
import { ServerEntity, DeploymentEntity, UserPermissions } from '@/types/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  PlayCircle,
  Settings,
  Download,
  Cloud,
  ExternalLink,
  Layers,
  Shield,
  Star,
  GitFork,
  Package,
  Users,
  Zap,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface ServerSidebarProps {
  server: ServerEntity;
  deployment?: DeploymentEntity;
  permissions: UserPermissions;
  onOpenConnectionModal: () => void;
}

export function ServerSidebar({
  server,
  deployment,
  permissions,
  onOpenConnectionModal,
}: ServerSidebarProps) {
  const isOmniHosted = server.hostingType === 'omni-hosted';

  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full justify-start bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => window.open('/playground', '_blank')}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Test in Playground
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onOpenConnectionModal}
          >
            <Settings className="h-4 w-4 mr-2" />
            Get Connection Info
          </Button>

          {isOmniHosted ? (
            permissions.canManageDeployment ? (
              <Button variant="outline" className="w-full justify-start">
                <Cloud className="h-4 w-4 mr-2" />
                Manage Deployment
              </Button>
            ) : (
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Add to Skillset
              </Button>
            )
          ) : (
            <Button variant="outline" className="w-full justify-start">
              <Cloud className="h-4 w-4 mr-2" />
              Host on Omni
            </Button>
          )}

          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Download SDK
          </Button>
        </CardContent>
      </Card>

      {/* Metadata Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Server Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="secondary">{server.serverType}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Hosting</span>
              <Badge variant="outline">{server.hostingType}</Badge>
            </div>
            {server.verified && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Star className="h-3 w-3" />
                Rating
              </span>
              <span className="font-medium">{server.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Download className="h-3 w-3" />
                Usage
              </span>
              <span className="font-medium">{server.usage.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <GitFork className="h-3 w-3" />
                Forks
              </span>
              <span className="font-medium">{server.forks}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Score
              </span>
              <span className="font-medium">{server.score}/100</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Powered By Card */}
      {server.hostingType === 'omni-hosted' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Powered By
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium">MCP Omni</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Hosted and managed by MCP Omni infrastructure
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registry Sources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Registry Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Package className="h-4 w-4 mr-2" />
              NPM Registry
              <ExternalLink className="h-3 w-3 ml-auto" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Layers className="h-4 w-4 mr-2" />
              MCP Registry
              <ExternalLink className="h-3 w-3 ml-auto" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {server.repoUrl && (
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <a href={server.repoUrl} target="_blank" rel="noopener noreferrer">
                Repository
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
          )}
          {server.docsUrl && (
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <a href={server.docsUrl} target="_blank" rel="noopener noreferrer">
                Documentation
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
          )}
          {server.issuesUrl && (
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <a href={server.issuesUrl} target="_blank" rel="noopener noreferrer">
                Issues & Support
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <a href={`/?namespace=${server.namespace}`} target="_blank" rel="noopener noreferrer">
              More from @{server.author}
              <ExternalLink className="h-3 w-3 ml-auto" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Hosting Status */}
      {deployment && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Deployment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={deployment.status === 'running' ? 'default' : 'secondary'}
                >
                  {deployment.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Instance: {deployment.instanceId}</p>
                <p className="truncate">Endpoint: {deployment.endpoint}</p>
              </div>
              {permissions.canManageDeployment && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    // Navigate to deployment tab
                    document.querySelector('[value="deployment"]')?.dispatchEvent(
                      new MouseEvent('click', { bubbles: true })
                    );
                  }}
                >
                  View Deployment Details
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}