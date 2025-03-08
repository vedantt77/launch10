import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { pricingPlans } from '@/lib/data/pricing-plans';
import { formatPrice } from '@/lib/utils/format-price';
import { motion } from 'framer-motion';
import { LaunchListItem } from '@/components/launch/LaunchListItem';
import { PremiumListing } from '@/components/launch/PremiumListing';

// Preview data for Basic and Premium boosts
const basicPreview = {
  id: 'preview-basic',
  name: 'Your Startup',
  logo: '/images/eglogo.png',
  description: 'Your startup description will appear here with enhanced visibility',
  launchDate: new Date().toISOString(),
  website: 'https://example.com',
  category: 'SaaS',
  listingType: 'boosted',
  doFollowBacklink: true
};

const premiumPreview = {
  id: 'preview-premium',
  name: 'Your Startup',
  logo: '/images/eglogo.png',
  description: 'Your startup will be featured prominently at the top of the page',
  launchDate: new Date().toISOString(),
  website: 'https://example.com',
  category: 'Featured',
  listingType: 'premium',
  doFollowBacklink: true
};

export function BoostPricing() {
  return (
    <section id="pricing" className="scroll-mt-20 py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">⚡Choose Your Boost Package</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <Card 
                className={`p-6 relative overflow-hidden ${
                  plan.highlighted 
                    ? 'border-primary scale-105 shadow-lg' 
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold">
                    {formatPrice(plan.price, plan.period)}
                  </p>
                  {plan.badge && (
                    <Badge variant={plan.badge.variant} className="mt-2">
                      {plan.badge.text}
                    </Badge>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Preview Dialog for Basic Boost */}
                {plan.name === 'Basic Boost' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mb-3">
                        Preview Boost
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogTitle>Basic Boost Preview</DialogTitle>
                      <div className="pt-4">
                        <p className="text-muted-foreground mb-4">Your startup will appear like this in the weekly and all listings:</p>
                        <LaunchListItem launch={basicPreview} />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Preview Dialog for Premium Boost */}
                {plan.name === 'Premium Boost' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mb-3">
                        Preview Boost
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogTitle>Premium Boost Preview</DialogTitle>
                      <div className="pt-4">
                        <p className="text-muted-foreground mb-4">Your startup will be featured prominently at the top of the page:</p>
                        <PremiumListing launch={premiumPreview} />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {plan.name === 'Free' ? (
                    <Button 
                      className={`w-full relative group ${
                        plan.highlighted 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg' 
                          : 'bg-primary/90 hover:bg-primary text-primary-foreground'
                      }`}
                      size="lg"
                      asChild
                    >
                      <a 
                        href="/submit"
                        className="relative py-6"
                      >
                        <span className="relative z-10">Submit</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 transform -skew-x-12 group-hover:animate-shine" />
                      </a>
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full relative group ${
                        plan.highlighted 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg' 
                          : 'bg-primary/90 hover:bg-primary text-primary-foreground'
                      }`}
                      size="lg"
                      asChild
                    >
                      <a 
                        href="mailto:contact@startups.ad"
                        className="relative py-6"
                      >
                        <span className="relative z-10">Buy Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 transform -skew-x-12 group-hover:animate-shine" />
                      </a>
                    </Button>
                  )}
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
