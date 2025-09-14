'use client';

import React, { useState } from 'react';
import { ServerHeader } from '@/components/server-header';
import { ServerTabs } from '@/components/server-tabs';
import { ServerSidebar } from '@/components/server-sidebar';
import { ConnectionModal } from '@/components/connection-modal';
import { ServerPageProps, TabVisibility } from '@/types/server';

interface ClientPageProps {
  data: ServerPageProps;
  tabVisibility: TabVisibility;
}

export function ClientPage({ data, tabVisibility }: ClientPageProps) {
  const [selectedVersion, setSelectedVersion] = useState(data.server.currentVersion);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          <main className="space-y-6">
            <ServerHeader
              server={data.server}
              selectedVersion={selectedVersion}
              onVersionChange={setSelectedVersion}
            />

            <ServerTabs
              data={data}
              tabVisibility={tabVisibility}
              onOpenConnectionModal={() => setConnectionModalOpen(true)}
            />
          </main>

          <aside>
            <ServerSidebar
              server={data.server}
              deployment={data.deployment}
              permissions={data.permissions}
              onOpenConnectionModal={() => setConnectionModalOpen(true)}
            />
          </aside>
        </div>
      </div>

      <ConnectionModal
        open={connectionModalOpen}
        onOpenChange={setConnectionModalOpen}
        server={data.server}
        config={data.config}
        deployment={data.deployment}
      />
    </>
  );
}