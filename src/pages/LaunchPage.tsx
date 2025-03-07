import { useState, useEffect, useMemo } from 'react';
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

export function LaunchPage() {
  const [allLaunches, setAllLaunches] = useState<Launch[]>([]);
  const [rotatedWeeklyLaunches, setRotatedWeeklyLaunches] = useState<Launch[]>([]);
  const [rotatedBoostedLaunches, setRotatedBoostedLaunches] = useState<Launch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch launches on component mount
  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        // Only fetch launches once and store them in state
        const launches = await getLaunches();
        setAllLaunches(launches);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching launches:', error);
        setIsLoading(false);
      }
    };

    fetchLaunches();
  }, []);
  
  // Memoize filtered launches
  const premiumLaunches = useMemo(() => 
    allLaunches.filter(launch => launch.listingType === 'premium'),
    [allLaunches]
  );
  
  const boostedLaunches = useMemo(() => 
    allLaunches.filter(launch => launch.listingType === 'boosted'),
    [allLaunches]
  );

  const weeklyLaunches = useMemo(async () => {
    const weeklyLaunches = await getWeeklyLaunches();
    return weeklyLaunches.filter(launch => !launch.listingType || launch.listingType === 'regular');
  }, []);

  // Get last week's winners
  const lastWeekWinners = useMemo(() => {
    // Get the start and end dates of last week
    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    lastWeekEnd.setHours(23, 59, 59, 999);

    // Filter launches from last week and sort by upvotes
    const lastWeekLaunches = allLaunches.filter(launch => {
      const launchDate = new Date(launch.launchDate);
      return launchDate >= lastWeekStart && launchDate <= lastWeekEnd;
    });

    return lastWeekLaunches
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, 3);
  }, [allLaunches]);

  // Function to get current rotation index based on timestamp
  const getCurrentRotationIndex = (listLength: number) => {
    if (listLength <= 1) return 0;
    const currentTime = Date.now();
    const rotationCount = Math.floor(currentTime / ROTATION_INTERVAL);
    return rotationCount % listLength;
  };

  // Function to rotate array by index
  const rotateArrayByIndex = (array: Launch[], index: number) => {
    if (array.length <= 1) return [...array];
    return [...array.slice(index), ...array.slice(0, index)];
  };

  const insertBoostedLaunches = (launches: Launch[]): ListItem[] => {
    if (!rotatedBoostedLaunches.length || !launches.length) {
      return launches.map((launch, index) => ({
        ...launch,
        uniqueKey: `weekly-regular-${launch.id}-${index}`
      }));
    }

    const result: ListItem[] = [];
    const spacing = Math.max(Math.floor(launches.length / rotatedBoostedLaunches.length), 2);
    let boostedIndex = 0;
    const timestamp = Math.floor(Date.now() / ROTATION_INTERVAL) * ROTATION_INTERVAL;

    launches.forEach((launch, index) => {
      result.push({
        ...launch,
        uniqueKey: `weekly-regular-${launch.id}-${index}-${timestamp}`
      });
      
      // Insert boosted launch after every 'spacing' number of regular launches
      if ((index + 1) % spacing === 0 && boostedIndex < rotatedBoostedLaunches.length) {
        const boostedLaunch = rotatedBoostedLaunches[boostedIndex];
        result.push({
          ...boostedLaunch,
          uniqueKey: `weekly-boosted-${boostedLaunch.id}-${index}-${timestamp}`
        });
        boostedIndex++;
      }
    });

    // If there are remaining boosted launches, distribute them evenly in the remaining spaces
    while (boostedIndex < rotatedBoostedLaunches.length) {
      const insertIndex = Math.floor((result.length / (rotatedBoostedLaunches.length - boostedIndex + 1)) * (boostedIndex + 1));
      const boostedLaunch = rotatedBoostedLaunches[boostedIndex];
      result.splice(insertIndex, 0, {
        ...boostedLaunch,
        uniqueKey: `weekly-boosted-${boostedLaunch.id}-remaining-${boostedIndex}-${timestamp}`
      });
      boostedIndex++;
    }

    return result;
  };

  // Update rotations based on current time
  useEffect(() => {
    const updateRotations = async () => {
      const weeklyLaunchList = await weeklyLaunches;
      const weeklyIndex = getCurrentRotationIndex(weeklyLaunchList.length);
      const boostedIndex = getCurrentRotationIndex(boostedLaunches.length);

      setRotatedWeeklyLaunches(rotateArrayByIndex(weeklyLaunchList, weeklyIndex));
      setRotatedBoostedLaunches(rotateArrayByIndex(boostedLaunches, boostedIndex));
    };

    // Initial update
    updateRotations();

    // Calculate time until next rotation
    const now = Date.now();
    const nextRotation = Math.ceil(now / ROTATION_INTERVAL) * ROTATION_INTERVAL;
    const timeUntilNextRotation = nextRotation - now;

    // Set timeout for first rotation
    const initialTimeout = setTimeout(() => {
      updateRotations();
      // Then set interval for subsequent rotations
      const interval = setInterval(updateRotations, ROTATION_INTERVAL);
      return () => clearInterval(interval);
    }, timeUntilNextRotation);

    return () => clearTimeout(initialTimeout);
  }, [weeklyLaunches, boostedLaunches]);

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
            Submit today and receive quality traffic and backlink! Our unique rotation system ensures equal exposure for all startups by rotating listings every 10 minutes - no upvotes needed. 🔄✨
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
            {insertBoostedLaunches(rotatedWeeklyLaunches).map((launch) => (
              <LaunchListItem 
                key={launch.uniqueKey}
                launch={launch}
              />
            ))}
          </div>

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
