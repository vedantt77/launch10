import { Startup } from './types';
import { startups } from './data/startups';

// Get all startups
export function getStartups(): Startup[] {
  return startups;
}

// Get a single startup by ID
export function getStartupById(id: string): Startup | undefined {
  return startups.find(startup => startup.id === id);
}