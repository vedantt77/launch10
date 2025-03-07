import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SubmittedStartup } from '@/lib/types';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SubmissionsCache {
  data: SubmittedStartup[];
  timestamp: number;
}

const submissionsCache: {
  [key: string]: SubmissionsCache;
} = {};

export function useSubmissions(userId?: string, status?: string) {
  const [submissions, setSubmissions] = useState<SubmittedStartup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!userId) {
        setSubmissions([]);
        setIsLoading(false);
        return;
      }

      const cacheKey = `${userId}-${status || 'all'}`;
      const now = Date.now();
      const cached = submissionsCache[cacheKey];

      // Return cached data if valid
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setSubmissions(cached.data);
        setIsLoading(false);
        return;
      }

      try {
        const startupsRef = collection(db, 'startups');
        let q = query(startupsRef);

        if (userId) {
          q = query(q, where('userId', '==', userId));
        }

        if (status) {
          q = query(q, where('status', '==', status));
        }

        const querySnapshot = await getDocs(q);
        const startups: SubmittedStartup[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          startups.push({
            id: doc.id,
            name: data.name,
            url: data.url,
            socialHandle: data.socialHandle,
            description: data.description,
            logoUrl: data.logoUrl,
            submittedAt: data.createdAt.toDate(),
            scheduledLaunchDate: data.scheduledLaunchDate?.toDate(),
            status: data.status,
            listingType: data.listingType
          });
        });

        // Update cache
        submissionsCache[cacheKey] = {
          data: startups,
          timestamp: now
        };

        setSubmissions(startups);
        setError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to fetch submissions');
        
        // Use cached data if available during error
        if (cached) {
          setSubmissions(cached.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [userId, status]);

  return { submissions, isLoading, error };
}

export function clearSubmissionsCache() {
  Object.keys(submissionsCache).forEach(key => {
    delete submissionsCache[key];
  });
}
