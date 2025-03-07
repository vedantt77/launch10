import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Launch } from '../types/launch';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Single cache object to store both launches and upvotes
const cache = {
  launches: null as { data: Launch[]; timestamp: number } | null,
  upvotes: {} as {
    [key: string]: {
      upvotes: number;
      upvotedBy: string[];
      timestamp: number;
    };
  }
};

// Batch fetch upvotes for multiple launches
async function batchGetUpvotes(launchIds: string[]): Promise<{ [key: string]: { upvotes: number; upvotedBy: string[] } }> {
  const now = Date.now();
  const result: { [key: string]: { upvotes: number; upvotedBy: string[] } } = {};
  const idsToFetch: string[] = [];

  // First check cache
  launchIds.forEach(id => {
    const cached = cache.upvotes[id];
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      result[id] = {
        upvotes: cached.upvotes,
        upvotedBy: cached.upvotedBy
      };
    } else {
      idsToFetch.push(id);
    }
  });

  if (idsToFetch.length === 0) {
    return result;
  }

  // Batch get documents that aren't cached
  const launchesRef = collection(db, 'launches');
  const q = query(launchesRef, where('__name__', 'in', idsToFetch));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(doc => {
    const data = doc.data();
    result[doc.id] = {
      upvotes: data.upvotes || 0,
      upvotedBy: data.upvotedBy || []
    };
    
    // Update cache
    cache.upvotes[doc.id] = {
      upvotes: data.upvotes || 0,
      upvotedBy: data.upvotedBy || [],
      timestamp: now
    };
  });

  // For any IDs that weren't found in the database, set default values
  idsToFetch.forEach(id => {
    if (!result[id]) {
      result[id] = { upvotes: 0, upvotedBy: [] };
      cache.upvotes[id] = {
        upvotes: 0,
        upvotedBy: [],
        timestamp: now
      };
    }
  });

  return result;
}

// Function to get all launches with caching
export async function getLaunches(): Promise<Launch[]> {
  const now = Date.now();

  // Return cached data if it's still valid
  if (cache.launches && (now - cache.launches.timestamp) < CACHE_DURATION) {
    return cache.launches.data;
  }

  try {
    // Get approved startups from Firestore in a single query
    const startupsRef = collection(db, 'startups');
    const q = query(startupsRef, where('status', '==', 'approved'));
    const querySnapshot = await getDocs(q);
    
    const approvedLaunches: Launch[] = [];
    const launchIds: string[] = querySnapshot.docs.map(doc => doc.id);
    
    // Batch fetch upvotes for all launches
    const upvotesData = await batchGetUpvotes(launchIds);
    
    querySnapshot.docs.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const upvoteInfo = upvotesData[docSnapshot.id];

      approvedLaunches.push({
        id: docSnapshot.id,
        name: data.name,
        logo: data.logoUrl,
        description: data.description,
        launchDate: data.scheduledLaunchDate.toDate().toISOString(),
        website: data.url,
        category: data.category || 'New Launch',
        listingType: data.listingType || 'regular',
        doFollowBacklink: true,
        upvotes: upvoteInfo.upvotes,
        upvotedBy: upvoteInfo.upvotedBy
      });
    });

    // Cache the results
    const allLaunches = approvedLaunches;
    cache.launches = {
      data: allLaunches,
      timestamp: now
    };

    return allLaunches;
  } catch (error) {
    console.error('Error fetching launches:', error);
    // Return cached data if available, otherwise return empty array
    return cache.launches?.data || [];
  }
}

// Function to get weekly launches (uses cached data)
export async function getWeeklyLaunches(): Promise<Launch[]> {
  const launches = await getLaunches();
  
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return launches.filter(launch => {
    const launchDate = new Date(launch.launchDate);
    return launchDate >= startOfWeek && launchDate <= endOfWeek;
  });
}

// Function to clear cache (useful for testing or forced updates)
export function clearLaunchesCache() {
  cache.launches = null;
  cache.upvotes = {};
}
