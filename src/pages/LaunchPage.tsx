import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LaunchListItem } from '@/components/launch/LaunchListItem';
import { PremiumListing } from '@/components/launch/PremiumListing';
import { AnimatedHeader } from '@/components/launch/AnimatedHeader';
import { getLaunches, getWeeklyLaunches } from '@/lib/data/launches';
import { WeeklyCountdownTimer } from '@/components/WeeklyCountdownTimer';
import { Launch } from '@/lib/types/launch';

interface ListItem extends Launch {
  uniqueKey: string;
}

const ROTATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const BATCH_SIZE = 10; // Number of items to load per batch

export function LaunchPage() {
  const [allLaunches, setAllLaunches] = useState<Launch[]>([]);
  const [displayedLaunches, setDisplayedLaunches] = useState<Launch[]>([]);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);
  const rotationTimer = useRef<NodeJS.Timeout>();
  
  // Fetch launches on component mount
  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        const launches = await getLaunches();
        
        // Filter out launches scheduled for the future
        const now = new Date();
        const availableLaunches = launches.filter(launch => {
          const launchDate = new Date(launch.launchDate);
          return launchDate <= now || launch.listingType === 'premium' || launch.listingType === 'boosted';
        });
        
        setAllLaunches(availableLaunches);
        
        // Initially load first batch
        const initialBatch = availableLaunches.slice(0, BATCH_SIZE);
        setDisplayedLaunches(initialBatch);
        setHasMore(availableLaunches.length > BATCH_SIZE);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching launches:', error);
        setIsLoading(false);
      }
    };

    fetchLaunches();
  }, []);

  // Infinite scroll handler
  const loadMoreLaunches = useCallback(() => {
    if (!hasMore || isLoading) return;

    const nextPage = currentPage + 1;
    const start = (nextPage - 1) * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    const nextBatch = allLaunches.slice(start, end);

    if (nextBatch.length > 0) {
      setDisplayedLaunches(prev => [...prev, ...nextBatch]);
      setCurrentPage(nextPage);
      setHasMore(end < allLaunches.length);
    } else {
      setHasMore(false);
    }
  }, [currentPage, hasMore, isLoading, allLaunches]);

  // Intersection Observer setup
  useEffect(() => {
    if (isLoading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreLaunches();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, hasMore, loadMoreLaunches]);
  
  // Memoize filtered launches
  const premiumLaunches = useMemo(() => 
    allLaunches.filter(launch => launch.listingType === 'premium'),
    [allLaunches]
  );
  
  const boostedLaunches = useMemo(() => 
    allLaunches.filter(launch => launch.listingType === 'boosted'),
    [allLaunches]
  );

  const regularLaunches = useMemo(() => 
    allLaunches.filter(launch => !launch.listingType || launch.listingType === 'regular'),
    [allLaunches]
  );

  // Get last week's winners
  const lastWeekWinners = useMemo(() => {
    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    lastWeekEnd.setHours(23, 59, 59, 999);

    const lastWeekLaunches = allLaunches.filter(launch => {
      const launchDate = new Date(launch.launchDate);
      return launchDate >= lastWeekStart && launchDate <= lastWeekEnd;
    });

    return lastWeekLaunches
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, 3);
  }, [allLaunches]);

  // Rotation system
  useEffect(() => {
    // Calculate initial rotation index based on current time
    const now = Date.now();
    const initialRotationIndex = Math.floor(now / ROTATION_INTERVAL) % Math.max(regularLaunches.length, 1);
    setRotationIndex(initialRotationIndex);

    // Calculate time until next rotation
    const nextRotation = Math.ceil(now / ROTATION_INTERVAL) * ROTATION_INTERVAL;
    const timeUntilNextRotation = nextRotation - now;

    // Set up rotation timer
    const startRotation = () => {
      rotationTimer.current = setInterval(() => {
        setRotationIndex(prevIndex => (prevIndex + 1) % Math.max(regularLaunches.length, 1));
      }, ROTATION_INTERVAL);
    };

    // Initial timeout to sync with 10-minute intervals
    const initialTimeout = setTimeout(() => {
      setRotationIndex(prevIndex => (prevIndex + 1) % Math.max(regularLaunches.length, 1));
      startRotation();
    }, timeUntilNextRotation);

    return () => {
      clearTimeout(initialTimeout);
      if (rotationTimer.current) {
        clearInterval(rotationTimer.current);
      }
    };
  }, [regularLaunches.length]);

  const getRotatedLaunches = useCallback((launches: Launch[]): ListItem[] => {
    if (!launches.length) return [];

    const rotated = [
      ...launches.slice(rotationIndex),
      ...launches.slice(0, rotationIndex)
    ];

    return rotated.map((launch, index) => ({
      ...launch,
      uniqueKey: `${launch.id}-${rotationIndex}-${index}`
    }));
  }, [rotationIndex]);

  const insertBoostedLaunches = useCallback((regularLaunches: Launch[]): ListItem[] => {
    if (!boostedLaunches.length || !regularLaunches.length) {
      return getRotatedLaunches(regularLaunches);
    }

    const rotatedRegular = getRotatedLaunches(regularLaunches);
    const rotatedBoosted = getRotatedLaunches(boostedLaunches);
    
    const result: ListItem[] = [];
    const spacing = Math.max(Math.floor(rotatedRegular.length / rotatedBoosted.length), 2);
    let boostedIndex = 0;

    rotatedRegular.forEach((launch, index) => {
      result.push(launch);
      
      if ((index + 1) % spacing === 0 && boostedIndex < rotatedBoosted.length) {
        result.push(rotatedBoosted[boostedIndex]);
        boostedIndex++;
      }
    });

    while (boostedIndex < rotatedBoosted.length) {
      const insertIndex = Math.floor((result.length / (rotatedBoosted.length - boostedIndex + 1)) * (boostedIndex + 1));
      result.splice(insertIndex, 0, rotatedBoosted[boostedIndex]);
      boostedIndex++;
    }

    return result;
  }, [boostedLaunches, getRotatedLaunches]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedHeader />
          
          <h2 className="text-base sm:text-xl text-muted-foreground text-center mb-6 sm:mb-8">
            Top 3 launches of the week get a do-follow backlink. Every listing is rotated every 10 minutes to ensure equal exposure 🔄
          </h2>

          {/* Premium listings */}
          <div className="space-y-8 mb-12">
            {premiumLaunches.map((launch) => (
              <PremiumListing 
                key={`premium-${launch.id}`} 
                launch={launch} 
              />
            ))}
          </div>

          <WeeklyCountdownTimer />

          {/* Weekly launches with boosted listings */}
          <div className="space-y-4 mb-16">
            {insertBoostedLaunches(displayedLaunches).map((launch) => (
              <LaunchListItem 
                key={launch.uniqueKey}
                launch={launch}
              />
            ))}
          </div>

          {/* Loading indicator */}
          {hasMore && (
            <div 
              ref={loadingRef} 
              className="py-4 text-center"
            >
              <div className="animate-pulse text-primary">Loading more...</div>
            </div>
          )}

          {/* Last Week's Winners */}
          {lastWeekWinners.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-center mb-8">
                🏆 Last Week's Most Popular Launches
              </h2>
              <div className="space-y-4">
                {lastWeekWinners.map((launch, index) => (
                  <div key={launch.id} className="relative">
                    {index === 0 && (
                      <div className="absolute -top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        🥇 1st Place
                      </div>
                    )}
                    {index === 1 && (
                      <div className="absolute -top-4 left-4 bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-bold">
                        🥈 2nd Place
                      </div>
                    )}
                    {index === 2 && (
                      <div className="absolute -top-4 left-4 bg-amber-700 text-white px-3 py-1 rounded-full text-sm font-bold">
                        🥉 3rd Place
                      </div>
                    )}
                    <LaunchListItem launch={launch} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
