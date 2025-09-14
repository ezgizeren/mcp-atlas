import React, { use } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ServerDetailsLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ server_name: string }>;
}) {
  const resolvedParams = use(params);
  const serverName = decodeURIComponent(resolvedParams.server_name);
  const [namespace, name] = serverName.includes('/')
    ? serverName.split('/')
    : ['', serverName];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb>
            <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">MCP Omni</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Registry</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Servers</BreadcrumbLink>
            </BreadcrumbItem>
            {namespace && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/?namespace=${namespace}`}>
                    {namespace}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-medium">{name || serverName}</span>
            </BreadcrumbItem>
          </BreadcrumbList>
          </Breadcrumb>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}