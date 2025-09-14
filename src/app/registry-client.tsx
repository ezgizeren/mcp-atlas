'use client';

import { useEffect } from 'react';

import React, { useState, useMemo } from 'react';
import { Server } from '@/types/database';
import { FilterSidebar } from '@/components/registry/filter-sidebar';
import { ServerCard } from '@/components/registry/server-card';
import { ResultsHeader } from '@/components/registry/results-header';
import { FilterState, SortOption } from '@/types/registry';

interface RegistryClientProps {
  servers: Server[];
}

const defaultFilters: FilterState = {
  search: '',
  serverTypes: [],
  hostingTypes: [],
  trusted: false,
  languages: [],
  licenses: [],
  tags: [],
};

export function RegistryClient({ servers }: RegistryClientProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Ensure dark mode is applied on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const serverTypes = new Set<string>();
    const languages = new Set<string>();
    const licenses = new Set<string>();
    const tags = new Set<string>();

    servers.forEach(server => {
      // Server types
      if (server.mcp_server_type_json) {
        const types = Array.isArray(server.mcp_server_type_json)
          ? server.mcp_server_type_json
          : [server.mcp_server_type_json];
        types.forEach(type => serverTypes.add(type));
      }

      // Languages
      if (server.repo_primary_language) {
        languages.add(server.repo_primary_language);
      }

      // Licenses
      if (server.repo_license_spdx_id) {
        licenses.add(server.repo_license_spdx_id);
      }

      // Tags
      if (server.repo_topics_json && Array.isArray(server.repo_topics_json)) {
        server.repo_topics_json.forEach(tag => tags.add(tag));
      }
    });

    return {
      serverTypes: Array.from(serverTypes).sort(),
      languages: Array.from(languages).sort(),
      licenses: Array.from(licenses).sort(),
      tags: Array.from(tags).sort(),
    };
  }, [servers]);

  // Filter servers
  const filteredServers = useMemo(() => {
    return servers.filter(server => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesName = server.mcp_name?.toLowerCase().includes(search);
        const matchesDesc = server.mcp_description?.toLowerCase().includes(search);
        if (!matchesName && !matchesDesc) return false;
      }

      // Server type filter
      if (filters.serverTypes.length > 0) {
        const serverTypes = Array.isArray(server.mcp_server_type_json)
          ? server.mcp_server_type_json
          : [server.mcp_server_type_json];
        const hasType = filters.serverTypes.some(type =>
          serverTypes.includes(type)
        );
        if (!hasType) return false;
      }

      // Hosting type filter
      if (filters.hostingTypes.length > 0) {
        if (!filters.hostingTypes.includes(server.hosting_type)) {
          return false;
        }
      }

      // Trusted filter
      if (filters.trusted && !server.provider_is_official) {
        return false;
      }

      // Language filter
      if (filters.languages.length > 0) {
        if (!server.repo_primary_language ||
            !filters.languages.includes(server.repo_primary_language)) {
          return false;
        }
      }

      // License filter
      if (filters.licenses.length > 0) {
        if (!server.repo_license_spdx_id ||
            !filters.licenses.includes(server.repo_license_spdx_id)) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const serverTags = server.repo_topics_json || [];
        const hasTags = filters.tags.every(tag =>
          serverTags.includes(tag)
        );
        if (!hasTags) return false;
      }

      return true;
    });
  }, [servers, filters]);

  // Sort servers
  const sortedServers = useMemo(() => {
    const sorted = [...filteredServers];

    switch (sortBy) {
      case 'popularity':
        return sorted.sort((a, b) =>
          (b.repo_stargazers_count || 0) - (a.repo_stargazers_count || 0)
        );
      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = a.repo_last_push_at ? new Date(a.repo_last_push_at).getTime() : 0;
          const dateB = b.repo_last_push_at ? new Date(b.repo_last_push_at).getTime() : 0;
          return dateB - dateA;
        });
      case 'quality':
        return sorted.sort((a, b) => {
          const scoreA = getQualityScore(a.scoring);
          const scoreB = getQualityScore(b.scoring);
          return scoreB - scoreA;
        });
      case 'tools':
        return sorted.sort((a, b) =>
          (b.tools_count || 0) - (a.tools_count || 0)
        );
      case 'name':
        return sorted.sort((a, b) =>
          (a.mcp_name || '').localeCompare(b.mcp_name || '')
        );
      default:
        return sorted;
    }
  }, [filteredServers, sortBy]);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex gap-6">
          {/* Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-4">
              <FilterSidebar
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            <ResultsHeader
              totalCount={servers.length}
              filteredCount={sortedServers.length}
              filters={filters}
              sortBy={sortBy}
              viewMode={viewMode}
              onSortChange={setSortBy}
              onViewModeChange={setViewMode}
              onRemoveFilter={updateFilter}
            />

            {/* Results Grid/List */}
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'
                : 'space-y-4 mt-6'
            }>
              {sortedServers.map(server => (
                <ServerCard
                  key={server.id}
                  server={server}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {sortedServers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No servers found matching your filters.
              </div>
            )}
          </main>
      </div>
    </div>
  );
}

// Helper function to extract quality score
function getQualityScore(scoring: any): number {
  if (!scoring || !Array.isArray(scoring) || scoring.length === 0) return 0;
  const firstScoring = scoring[0];
  if (firstScoring?.scoring?.final_score !== undefined) {
    return firstScoring.scoring.final_score;
  }
  return 0;
}