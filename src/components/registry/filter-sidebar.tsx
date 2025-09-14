'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterState, FilterOptions } from '@/types/registry';
import { Search, X } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  filterOptions: FilterOptions;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  const hasActiveFilters = filters.search ||
    filters.serverTypes.length > 0 ||
    filters.hostingTypes.length > 0 ||
    filters.trusted ||
    filters.languages.length > 0 ||
    filters.licenses.length > 0 ||
    filters.tags.length > 0;

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(key, newValues);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs h-7 px-2"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search servers..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Server Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Server Type</Label>
        <div className="space-y-2">
          {filterOptions.serverTypes.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`server-${type}`}
                checked={filters.serverTypes.includes(type)}
                onCheckedChange={() => toggleArrayFilter('serverTypes', type)}
              />
              <label
                htmlFor={`server-${type}`}
                className="text-sm cursor-pointer select-none"
              >
                {formatServerType(type)}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Hosting Model */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Hosting Model</Label>
        <div className="space-y-2">
          {['EXTERNAL', 'OMNI_HOSTED'].map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`hosting-${type}`}
                checked={filters.hostingTypes.includes(type)}
                onCheckedChange={() => toggleArrayFilter('hostingTypes', type)}
              />
              <label
                htmlFor={`hosting-${type}`}
                className="text-sm cursor-pointer select-none"
              >
                {type === 'OMNI_HOSTED' ? 'Omni-Hosted' : 'External'}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Trust */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Trust</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="trusted"
            checked={filters.trusted}
            onCheckedChange={(checked) => onFilterChange('trusted', checked)}
          />
          <label
            htmlFor="trusted"
            className="text-sm cursor-pointer select-none"
          >
            Official Providers Only
          </label>
        </div>
      </div>

      {/* Technology */}
      {filterOptions.languages.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Technology</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {filterOptions.languages.slice(0, 10).map(lang => (
              <div key={lang} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang-${lang}`}
                  checked={filters.languages.includes(lang)}
                  onCheckedChange={() => toggleArrayFilter('languages', lang)}
                />
                <label
                  htmlFor={`lang-${lang}`}
                  className="text-sm cursor-pointer select-none"
                >
                  {lang}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* License */}
      {filterOptions.licenses.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">License</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
            {filterOptions.licenses.slice(0, 10).map(license => (
              <div key={license} className="flex items-center space-x-2">
                <Checkbox
                  id={`license-${license}`}
                  checked={filters.licenses.includes(license)}
                  onCheckedChange={() => toggleArrayFilter('licenses', license)}
                />
                <label
                  htmlFor={`license-${license}`}
                  className="text-sm cursor-pointer select-none"
                >
                  {license}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {filterOptions.tags.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tags</Label>
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.tags.slice(0, 12).map(tag => (
              <Button
                key={tag}
                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => toggleArrayFilter('tags', tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatServerType(type: string): string {
  const typeMap: Record<string, string> = {
    'LOCAL_STDIO': 'Local (STDIO)',
    'HTTP_STREAM': 'HTTP Stream',
    'REMOTE_HTTP_SSE': 'SSE',
    'SSE': 'SSE',
  };
  return typeMap[type] || type;
}