import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServerPageProps, TabVisibility } from '@/types/server';
import { OverviewTab } from './tabs/overview-tab';
import { ToolsTab } from './tabs/tools-tab';
import { SchemaConfigTab } from './tabs/schema-config-tab';
import { InstallationTab } from './tabs/installation-tab';
import { SecurityTab } from './tabs/security-tab';
import { ReviewsTab } from './tabs/reviews-tab';
import { UseCasesTab } from './tabs/use-cases-tab';
import { RelatedTab } from './tabs/related-tab';
import { VersionsTab } from './tabs/versions-tab';
import { DeploymentTab } from './tabs/deployment-tab';
import { QualityScoringTab } from './tabs/quality-scoring-tab';
import {
  FileText,
  Wrench,
  Settings,
  Download,
  Shield,
  MessageSquare,
  Lightbulb,
  Link,
  GitBranch,
  Cloud,
  Award,
} from 'lucide-react';

interface ServerTabsProps {
  data: ServerPageProps;
  tabVisibility: TabVisibility;
  onOpenConnectionModal: () => void;
}

export function ServerTabs({
  data,
  tabVisibility,
  onOpenConnectionModal,
}: ServerTabsProps) {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: FileText,
      visible: tabVisibility.overview,
      content: <OverviewTab server={data.server} />,
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: Wrench,
      visible: tabVisibility.tools,
      content: <ToolsTab tools={data.tools} server={data.server} />,
    },
    {
      id: 'schema-config',
      label: 'Schema & Config',
      icon: Settings,
      visible: tabVisibility.schemaConfig,
      content: (
        <SchemaConfigTab
          config={data.config}
          server={data.server}
          permissions={data.permissions}
          deployment={data.deployment}
        />
      ),
    },
    {
      id: 'installation',
      label: 'Installation & Usage',
      icon: Download,
      visible: tabVisibility.installation,
      content: (
        <InstallationTab
          server={data.server}
          config={data.config}
          onOpenConnectionModal={onOpenConnectionModal}
        />
      ),
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      visible: tabVisibility.security,
      content: <SecurityTab security={data.security} />,
    },
    {
      id: 'quality-scoring',
      label: 'Quality Assessment',
      icon: Award,
      visible: true, // Always show quality scoring
      content: <QualityScoringTab data={data} />,
    },
    {
      id: 'reviews',
      label: 'Reviews & Comments',
      icon: MessageSquare,
      visible: tabVisibility.reviews,
      content: <ReviewsTab reviews={data.reviews} serverId={data.server.id} />,
    },
    {
      id: 'use-cases',
      label: 'Use Cases',
      icon: Lightbulb,
      visible: tabVisibility.useCases,
      content: <UseCasesTab useCases={data.useCases} />,
    },
    {
      id: 'related',
      label: 'Related Items',
      icon: Link,
      visible: tabVisibility.related,
      content: <RelatedTab relatedItems={data.relatedItems} />,
    },
    {
      id: 'versions',
      label: 'Versions',
      icon: GitBranch,
      visible: tabVisibility.versions,
      content: <VersionsTab versions={data.versions} currentVersion={data.server.currentVersion} />,
    },
    {
      id: 'deployment',
      label: 'Deployment & Monitoring',
      icon: Cloud,
      visible: tabVisibility.deployment,
      content: (
        <DeploymentTab
          deployment={data.deployment}
          permissions={data.permissions}
          serverId={data.server.id}
        />
      ),
    },
  ];

  const visibleTabs = tabs.filter(tab => tab.visible);

  if (visibleTabs.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">No tabs available</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={visibleTabs[0].id} className="w-full">
      <div className="w-full overflow-x-auto pb-2">
        <TabsList className="flex h-10 w-max min-w-full items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
          {visibleTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {visibleTabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}