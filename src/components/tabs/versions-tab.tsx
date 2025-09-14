import React from 'react';
import { Version } from '@/types/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  GitBranch,
  Download,
  AlertTriangle,
  Calendar,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

interface VersionsTabProps {
  versions: Version[];
  currentVersion: string;
}

export function VersionsTab({ versions, currentVersion }: VersionsTabProps) {
  const sortedVersions = [...versions].sort((a, b) =>
    b.releaseDate.localeCompare(a.releaseDate)
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Version History
        </h3>
        <p className="text-sm text-muted-foreground">
          Track changes and updates across different versions
        </p>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {sortedVersions.map((version, index) => {
            const isCurrent = version.version === currentVersion;
            const isLatest = index === 0;

            return (
              <Card
                key={version.version}
                className={isCurrent ? 'border-primary' : ''}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        v{version.version}
                      </CardTitle>
                      {isCurrent && (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      )}
                      {isLatest && !isCurrent && (
                        <Badge variant="secondary">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Latest
                        </Badge>
                      )}
                      {version.breaking && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Breaking Changes
                        </Badge>
                      )}
                      {version.deprecated && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Deprecated
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Download className="h-4 w-4" />
                      {version.downloads.toLocaleString()}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    Released {new Date(version.releaseDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Changelog</h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {version.changelog}
                      </div>
                    </div>

                    {version.breaking && (
                      <>
                        <Separator />
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                          <p className="text-sm font-medium text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Breaking Changes
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This version contains breaking changes. Please review the changelog
                            carefully before upgrading.
                          </p>
                        </div>
                      </>
                    )}

                    {version.deprecated && (
                      <>
                        <Separator />
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                            This version is deprecated
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Please upgrade to a newer version for continued support and updates.
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 pt-2">
                      {!isCurrent && (
                        <Button size="sm" variant="outline">
                          Switch to v{version.version}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" asChild>
                        <a
                          href={`/registry/servers/${version.version}/changelog`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Full Changelog
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}