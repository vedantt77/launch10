import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';

export function FeaturePopup() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // List of paths where the popup should not appear
  const excludedPaths = ['/boost', '/login', '/signup', '/submit'];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200 && !isVisible) {
        setIsVisible(true);
        // Trigger confetti when popup appears
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.9, y: 0.9 },
          colors: ['#22c55e', '#3b82f6', '#6366f1'],
          ticks: 200,
          gravity: 0.8,
          scalar: 0.9,
          shapes: ['circle', 'square'],
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  if (excludedPaths.includes(location.pathname) || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
          className="fixed bottom-4 right-4 z-50"
        >
          <motion.div 
            className="bg-background border-2 border-primary/20 shadow-[0_0_15px_5px_rgba(0,0,0,0.1)] rounded-lg p-6 relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/boost"
              className="relative z-10 flex items-center gap-3"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">🚀 Get Featured Now</span>
                <span className="text-sm text-muted-foreground">
                  Only at <span className="text-green-500 font-bold">$5/week</span>
                </span>
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsDismissed(true);
              }}
              className="absolute right-2 top-2 p-1 hover:bg-accent/50 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
