import type { Resource } from '../types/booking'

export async function fetchResources(): Promise<Resource[]> {
  const response = await fetch('/api/resources')
  if (!response.ok) {
    throw new Error('Failed to load resources from API.')
  }

  return (await response.json()) as Resource[]
}
