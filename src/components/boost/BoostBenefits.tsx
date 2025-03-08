import { Card } from '@/components/ui/card';
import { Rocket, ChevronsUp, AlarmClockOff, Users,   } from 'lucide-react';

const benefits = [
  
  {
    icon: Rocket,
    title: 'Premium Boost',
    description: 'Featured placement in Homepage Just below the hero get most exposure '
  },
  {
    icon: ChevronsUp,
    title: 'Basic Boost',
    description: 'Stand out in between of regular listings'
  },
  {
    icon: AlarmClockOff,
    title: 'No waiting period',
    description: 'No need to wait for weekly launch, get listed immediately'
  },
  {
    icon: Users,
    title: '1000s of active users',
    description: 'Reach a highly engaged audience of entrepreneurs and investors'
  },
 
  
];

export function BoostBenefits() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="p-6 text-center hover:shadow-lg transition-shadow">
              <benefit.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
