'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterState, SortOption } from '@/types/registry';
import { Grid, List, X } from 'lucide-react';

interface ResultsHeaderProps {
  totalCount: number;
  filteredCount: number;
  filters: FilterState;
  sortBy: SortOption;
  viewMode: 'grid' | 'list';
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onRemoveFilter: (key: keyof FilterState, value: any) => void;
}

export function ResultsHeader({
  totalCount,
  filteredCount,
  filters,
  sortBy,
  viewMode,
  onSortChange,
  onViewModeChange,
  onRemoveFilter,
}: ResultsHeaderProps) {
  const activeFilters: Array<{ key: keyof FilterState; value: string; label: string }> = [];

  // Collect active filters
  if (filters.search) {
    activeFilters.push({
      key: 'search',
      value: '',
      label: `Search: ${filters.search}`,
    });
  }

  filters.serverTypes.forEach(type => {
    activeFilters.push({
      key: 'serverTypes',
      value: type,
      label: `Type: ${formatServerType(type)}`,
    });
  });

  filters.hostingTypes.forEach(type => {
    activeFilters.push({
      key: 'hostingTypes',
      value: type,
      label: `Hosting: ${type === 'OMNI_HOSTED' ? 'Omni' : 'External'}`,
    });
  });

  if (filters.trusted) {
    activeFilters.push({
      key: 'trusted',
      value: '',
      label: 'Official Only',
    });
  }

  filters.languages.forEach(lang => {
    activeFilters.push({
      key: 'languages',
      value: lang,
      label: `Lang: ${lang}`,
    });
  });

  filters.licenses.forEach(license => {
    activeFilters.push({
      key: 'licenses',
      value: license,
      label: `License: ${license}`,
    });
  });

  filters.tags.forEach(tag => {
    activeFilters.push({
      key: 'tags',
      value: tag,
      label: `Tag: ${tag}`,
    });
  });

  const handleRemoveFilter = (key: keyof FilterState, value: string) => {
    if (key === 'search') {
      onRemoveFilter('search', '');
    } else if (key === 'trusted') {
      onRemoveFilter('trusted', false);
    } else {
      const currentValues = filters[key] as string[];
      const newValues = currentValues.filter(v => v !== value);
      onRemoveFilter(key, newValues);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Filter Pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.key}-${filter.value}-${index}`}
              variant="secondary"
              className="pl-2 pr-1 py-1 text-xs"
            >
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1.5 hover:bg-transparent hover:text-foreground"
                onClick={() => handleRemoveFilter(filter.key, filter.value)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredCount}</span>
          {filteredCount !== totalCount && (
            <> of <span className="font-semibold text-foreground">{totalCount}</span></>
          )}
          {' '}servers
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="recent">Recently Updated</SelectItem>
              <SelectItem value="quality">Quality Score</SelectItem>
              <SelectItem value="tools">Tool Count</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0 rounded-r-none"
              onClick={() => onViewModeChange('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0 rounded-l-none"
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
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