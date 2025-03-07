import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getLaunches } from '@/lib/data/launches';
import { Launch } from '@/lib/types/launch';
import { LaunchListItem } from '@/components/launch/LaunchListItem';
import { WeeklyCountdownTimer } from '@/components/WeeklyCountdownTimer';
import confetti from 'canvas-confetti';

export function SharedLaunchPage() {
  const { id } = useParams<{ id: string }>();
  const [launch, setLaunch] = useState<Launch | null>(null);

  useEffect(() => {
    const launches = getLaunches();
    const foundLaunch = launches.find(l => l.id === id);
    setLaunch(foundLaunch || null);

    // Update meta tags
    if (foundLaunch) {
      document.title = `${foundLaunch.name} - startups.ad`;
      
      // Update Open Graph meta tags
      const metaTags = {
        'og:title': `Check out ${foundLaunch.name} on startups.ad`,
        'og:description': foundLaunch.description,
        'og:image': foundLaunch.logo,
        'twitter:title': `Check out ${foundLaunch.name} on startups.ad`,
        'twitter:description': foundLaunch.description,
        'twitter:image': foundLaunch.logo
      };

      Object.entries(metaTags).forEach(([property, content]) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });

      // Trigger confetti effect
      const duration = 2000;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(() => {
        const timeLeft = duration - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }
  }, [id]);

  if (!launch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Launch Not Found</h1>
          <p className="text-muted-foreground">
            The launch you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Featured Launch
        </h1>
        <div className="max-w-3xl mx-auto">
          <LaunchListItem launch={launch} />
          <div className="mt-8">
            <WeeklyCountdownTimer />
          </div>
        </div>
      </div>
    </div>
  );
}
