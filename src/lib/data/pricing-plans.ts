import { BadgeProps } from "@/components/ui/badge";

interface PricingPlan {
  name: string;
  price: string | number;
  period: 'monthly' | 'annually' | 'weekly';
  badge?: {
    text: string;
    variant: BadgeProps['variant'];
  };
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
  paypalPlanId?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    price: 0,
    period: 'weekly',
    features: [
      '- Featured on homepage for 1 week',
      '- Standard queue',
      '- Do-follow backlink for top 3 launch'
    ],
    buttonText: 'Submit',
  },
  {
    name: 'Basic Boost',
    price: 5,
    period: 'weekly',
    badge: { 
      text: 'Most Popular',
      variant: 'default'
    },
    features: [
      '- Launch immediately',
      '- Boosted listing for a week',
      '- After boosted listing additional regualr listing for 1 week',
      '- Boost preview',
      '- Guaranteed do-follow backlink'
    ],
    buttonText: 'Buy Now',
  },
  {
    name: 'Premium Boost',
    price: 15,
    period: 'weekly',
    badge: { 
      text: 'Best Value',
      variant: 'secondary'
    },
    features: [
      '- Launch immediately',
      '- Premium listing for a week',
      '- After boosted listing additional regualr listing for 1 week',
      '- Boost preview',
      '- Guaranteed do-follow backlink'
    ],
    highlighted: true,
    buttonText: 'Buy Now',
  }
];
