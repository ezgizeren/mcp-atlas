import React from 'react';
import { ServerPageProps } from '@/types/server';
import { ScoringOverview } from '@/components/scoring/scoring-overview';

interface QualityScoringTabProps {
  data: ServerPageProps;
}

export function QualityScoringTab({ data }: QualityScoringTabProps) {
  // Extract scoring data from server data - this should come from the database
  // For now, we'll need to access it from the server's scoring property
  const scoring = (data.server as any).scoring || [];

  if (!scoring || scoring.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          No quality assessment data available for this server.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScoringOverview scoring={scoring} />
    </div>
  );
}