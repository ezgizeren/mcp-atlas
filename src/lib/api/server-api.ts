import { ServerPageProps } from '@/types/server';
import { getMockServerData } from '../mock/server-data';

export async function getServerData(serverName: string): Promise<ServerPageProps> {
  // In a real implementation, this would fetch from an API
  // For now, we'll use mock data
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, this would be:
    // const response = await fetch(`/api/servers/${serverName}`);
    // if (!response.ok) throw new Error('Failed to fetch server data');
    // return response.json();

    return getMockServerData(serverName);
  } catch (error) {
    console.error('Error fetching server data:', error);
    throw error;
  }
}

export async function updateServerConfig(
  serverId: string,
  config: Record<string, string>
): Promise<void> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In production:
  // const response = await fetch(`/api/servers/${serverId}/config`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ config }),
  // });
  // if (!response.ok) throw new Error('Failed to update config');
}

export async function performDeploymentAction(
  deploymentId: string,
  action: 'start' | 'stop' | 'restart'
): Promise<void> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In production:
  // const response = await fetch(`/api/deployments/${deploymentId}/${action}`, {
  //   method: 'POST',
  // });
  // if (!response.ok) throw new Error(`Failed to ${action} deployment`);
}

export async function submitReview(
  serverId: string,
  review: {
    rating: number;
    title: string;
    content: string;
  }
): Promise<void> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In production:
  // const response = await fetch(`/api/servers/${serverId}/reviews`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(review),
  // });
  // if (!response.ok) throw new Error('Failed to submit review');
}