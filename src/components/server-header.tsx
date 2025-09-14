import React from 'react';
import { ServerEntity } from '@/types/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GitFork,
  Star,
  Download,
  Shield,
  ExternalLink,
  Github,
  FileText,
  Bug,
  CheckCircle2,
} from 'lucide-react';

interface ServerHeaderProps {
  server: ServerEntity;
  selectedVersion: string;
  onVersionChange: (version: string) => void;
}

export function ServerHeader({
  server,
  selectedVersion,
  onVersionChange,
}: ServerHeaderProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold">
                {server.name}
              </h1>
              <span className="text-muted-foreground text-lg">
                by @{server.author}
              </span>
              {server.verified && (
                <CheckCircle2 className="h-5 w-5 text-blue-500" aria-label="Verified" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ServerTypeBadge type={server.serverType} />
              <HostingTypeBadge type={server.hostingType} />
              <div className="ml-auto">
                <Select value={selectedVersion} onValueChange={onVersionChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Version" />
                  </SelectTrigger>
                  <SelectContent>
                    {server.availableVersions.map((version) => (
                      <SelectItem key={version} value={version}>
                        {version}
                        {version === server.currentVersion && ' (latest)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-muted-foreground max-w-4xl">
              {server.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{server.usage.toLocaleString()}</span>
            <span className="text-muted-foreground">uses</span>
          </div>

          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{server.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">rating</span>
          </div>

          <div className="flex items-center gap-1">
            <GitFork className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{server.forks}</span>
            <span className="text-muted-foreground">forks</span>
          </div>

          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{server.score}</span>
            <span className="text-muted-foreground">security score</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {server.repoUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={server.repoUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-1" />
                Repository
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}

          {server.issuesUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={server.issuesUrl} target="_blank" rel="noopener noreferrer">
                <Bug className="h-4 w-4 mr-1" />
                Issues
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}

          {server.docsUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={server.docsUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-1" />
                Docs
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ServerTypeBadge({ type }: { type: string }) {
  const config = {
    'remote-sse': { label: 'Remote SSE', className: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' },
    'remote-http': { label: 'Remote HTTP', className: 'bg-green-100 text-green-800 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' },
    'local-stdio': { label: 'Local STDIO', className: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-500/30' },
  }[type] || { label: type, className: '' };

  return (
    <Badge variant="secondary" className={`${config.className} border`}>
      {config.label}
    </Badge>
  );
}

function HostingTypeBadge({ type }: { type: string }) {
  const config = {
    'external': { label: 'External', className: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30' },
    'omni-hosted': { label: 'Omni-Hosted', className: 'bg-orange-100 text-orange-800 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' },
  }[type] || { label: type, className: '' };

  return (
    <Badge variant="secondary" className={`${config.className} border`}>
      {config.label}
    </Badge>
  );
}