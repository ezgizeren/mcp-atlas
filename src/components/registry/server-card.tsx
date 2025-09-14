'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server } from '@/types/database';
import {
  Terminal,
  Cloud,
  Star,
  GitFork,
  Code,
  BarChart,
  Shield,
  Wrench,
} from 'lucide-react';

interface ServerCardProps {
  server: Server;
  viewMode: 'grid' | 'list';
}

export function ServerCard({ server, viewMode }: ServerCardProps) {
  const serverTypes = Array.isArray(server.mcp_server_type_json)
    ? server.mcp_server_type_json
    : [server.mcp_server_type_json];
  const primaryType = serverTypes[0] || 'LOCAL_STDIO';

  const qualityScore = getQualityScore(server.scoring);
  const tags = (server.repo_topics_json || []).slice(0, 4);

  const formatStars = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const cardContent = (
    <>
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Header with Official Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base leading-tight mb-1">
                {server.mcp_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {server.provider_name}
              </p>
            </div>
            {server.provider_is_official && (
              <Badge variant="outline" className="shrink-0">
                Verified
              </Badge>
            )}
          </div>

          {/* Type and Hosting Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              <Terminal className="h-3 w-3 mr-1" />
              {formatServerType(primaryType)}
            </Badge>
            <Badge
              variant={server.hosting_type === 'OMNI_HOSTED' ? 'default' : 'secondary'}
              className="text-xs"
            >
              <Cloud className="h-3 w-3 mr-1" />
              {server.hosting_type === 'OMNI_HOSTED' ? 'Omni' : 'External'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {server.mcp_description || 'No description available'}
        </p>

        {/* Metrics Row */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Wrench className="h-3 w-3" />
            <span>{server.tools_count || 0} Tools</span>
          </div>
          <div className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            <span>{server.repo_primary_language || 'JavaScript'}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-3 w-3" />
            <span>{formatStars(server.repo_stargazers_count || 0)} Stars</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <BarChart className="h-3 w-3" />
            <span>Score: {qualityScore.toFixed(1)}/5</span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag: string, idx: number) => (
              <Badge key={`${tag}-${idx}`} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </>
  );

  if (viewMode === 'list') {
    return (
      <Link href={`/servers/${encodeURIComponent(server.mcp_name)}`}>
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <div className="flex items-center p-4 gap-4">
            <div className="flex-1">{cardContent}</div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/servers/${encodeURIComponent(server.mcp_name)}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
        {cardContent}
      </Card>
    </Link>
  );
}

function formatServerType(type: string): string {
  const typeMap: Record<string, string> = {
    'LOCAL_STDIO': 'Local',
    'HTTP_STREAM': 'HTTP',
    'SSE': 'SSE',
  };
  return typeMap[type] || type;
}

function getQualityScore(scoring: any): number {
  if (!scoring || !Array.isArray(scoring) || scoring.length === 0) return 0;
  const firstScoring = scoring[0];
  if (firstScoring?.scoring?.final_score !== undefined) {
    return firstScoring.scoring.final_score;
  }
  return 0;
}