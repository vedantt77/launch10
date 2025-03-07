import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function WeeklyCountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextSunday = new Date(now);
      
      // If it's already past Saturday 23:59:59, get next week's Sunday
      if (now.getDay() === 6 && now.getHours() === 23 && now.getMinutes() === 59 && now.getSeconds() > 58) {
        nextSunday.setDate(now.getDate() + 1);
      } else {
        // Get the most recent Sunday (or next Sunday if it's Saturday night)
        nextSunday.setDate(now.getDate() - now.getDay() + 7);
      }
      
      // Set to midnight (00:00:00)
      nextSunday.setHours(0, 0, 0, 0);
      
      const difference = nextSunday.getTime() - now.getTime();
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-primary/10 rounded-lg p-1.5 sm:p-3 min-w-[45px] sm:min-w-[70px]">
        <span className="text-base sm:text-2xl font-bold text-primary">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] sm:text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 mb-8">
      <Card className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500"></span>
            </span>
            <span className="text-base sm:text-lg font-medium">Next launch in:</span>
          </div>
          
          <div className="flex gap-2 sm:gap-4">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Mins" />
            <TimeUnit value={timeLeft.seconds} label="Secs" />
          </div>

          <div className="text-center sm:text-right whitespace-nowrap">
            <a 
              href="/submit" 
              className="text-sm sm:text-base text-primary hover:underline font-medium"
            >
              Submit your startup →
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
