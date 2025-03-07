import { Button } from '@/components/ui/button';

export function BoostHero() {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          🔋Supercharge Your Startup's Visibility
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          📍Get featured on startups.ad and reach thousands of potential customers, investors, and partners
        </p>
        
        <Button size="lg" className="text-lg" onClick={scrollToPricing}>
          ⚡Boost Your Startup Now
        </Button>
      </div>
    </section>
  );
}