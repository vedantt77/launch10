import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Share2 } from 'lucide-react';
import { Launch } from '@/lib/types/launch';
import { shareUrl } from '@/lib/utils/share';

interface PremiumListingProps {
  launch: Launch;
}

export function PremiumListing({ launch }: PremiumListingProps) {
  const handleShare = async () => {
    const shareData = {
      title: `Check out ${launch.name} on startups.ad`,
      text: launch.description,
      url: `https://startups.ad/launch/${launch.id}`
    };
    await shareUrl(shareData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative bg-gradient-to-br from-purple-50/5 to-purple-100/5 dark:from-purple-900/5 dark:to-purple-800/5 p-4 sm:p-6 border-2 border-purple-500/30 dark:border-purple-500/50 hover:border-purple-500/50 dark:hover:border-purple-500/70 transition-all duration-300">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-400/5 dark:via-transparent dark:to-purple-400/5 rounded-lg pointer-events-none"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={launch.logo}
            alt={launch.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <motion.h3 
                className="text-lg sm:text-xl font-semibold"
                whileHover={{ scale: 1.02 }}
              >
                {launch.name}
              </motion.h3>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge 
                  variant="secondary" 
                  className="w-fit sm:w-auto bg-purple-500 text-purple-50 dark:bg-purple-600 dark:text-purple-50 pointer-events-none"
                >
                  Premium
                </Badge>
              </motion.div>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">{launch.description}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="w-full sm:w-auto mt-4 sm:mt-0 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white" 
                asChild
              >
                <a 
                  href={launch.website} 
                  target="_blank"
                >
                  Visit <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
