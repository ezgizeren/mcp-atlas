import { RegistryClient } from './registry-client';
import { getAllServers } from '@/lib/api/supabase-api';
import { Server } from '@/types/database';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function HomePage() {
  let servers: Server[] = [];

  try {
    servers = await getAllServers();
  } catch (error) {
    console.error('Error fetching servers:', error);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold mb-2">MCP Server Registry</h1>
              <p className="text-muted-foreground">
                Discover and explore Model Context Protocol servers for your AI applications
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <RegistryClient servers={servers} />
    </div>
  );
}