import React from 'react';
import { getServerData } from '@/lib/api/supabase-api';
import { getTabVisibility } from '@/lib/utils/server-utils';
import { notFound } from 'next/navigation';
import { ClientPage } from './client-page';

/**
 * Main server details page component (Server Component)
 *
 * This page displays comprehensive information about an MCP server.
 * The UI adapts based on:
 * - Server type (LOCAL_STDIO, HTTP_STREAM, SSE)
 * - Hosting type (EXTERNAL, OMNI_HOSTED)
 * - User permissions
 *
 * @route /servers/[server_name]
 */
export default async function ServerDetailsPage({
  params
}: {
  params: Promise<{ server_name: string }>;
}) {
  const { server_name } = await params;

  let data;
  try {
    // Fetch server data from Supabase
    data = await getServerData(decodeURIComponent(server_name));
  } catch (error) {
    console.error('Error fetching server:', error);
    notFound();
  }

  const tabVisibility = getTabVisibility(
    data.server.hostingType,
    data.permissions
  );

  return <ClientPage data={data} tabVisibility={tabVisibility} />;
}