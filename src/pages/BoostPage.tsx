import { BoostHero } from '@/components/boost/BoostHero';
import { BoostBenefits } from '@/components/boost/BoostBenefits';
import { BoostPricing } from '@/components/boost/BoostPricing';
{/*import { BoostTestimonials } from '@/components/boost/BoostTestimonials';*/}
import { BoostFAQ } from '@/components/boost/BoostFAQ';


export function BoostPage() {
  return (
    <div className="min-h-screen">
      <BoostHero />
      <BoostBenefits />
      {/*<BoostTestimonials />*/}
      <BoostPricing />
      <BoostFAQ />
      
    </div>
  );
}