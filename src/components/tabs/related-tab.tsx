import React from 'react';
import { RelatedItem } from '@/types/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Server, Monitor, Wrench } from 'lucide-react';

interface RelatedTabProps {
  relatedItems: RelatedItem[];
}

export function RelatedTab({ relatedItems }: RelatedTabProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server className="h-5 w-5" />;
      case 'client':
        return <Monitor className="h-5 w-5" />;
      case 'tool':
        return <Wrench className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getCompatibilityBadge = (compatibility: string) => {
    const variants: Record<string, any> = {
      compatible: 'default',
      partial: 'secondary',
      unknown: 'outline',
    };
    return (
      <Badge variant={variants[compatibility] || 'outline'}>
        {compatibility}
      </Badge>
    );
  };

  const groupedItems = relatedItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, RelatedItem[]>);

  if (relatedItems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No related items found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([type, items]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getIcon(type)}
              Related {type.charAt(0).toUpperCase() + type.slice(1)}s
            </CardTitle>
            <CardDescription>
              {type === 'server' && 'Similar servers you might be interested in'}
              {type === 'client' && 'Compatible clients for this server'}
              {type === 'tool' && 'Related tools and utilities'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      {getCompatibilityBadge(item.compatibility)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}