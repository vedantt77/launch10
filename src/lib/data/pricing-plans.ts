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
    name: 'Basic Boost',
    price: 5,
    period: 'week',
    badge: { 
      text: 'Most Popular',
      variant: 'default'
    },
    features: [
      '- Launch immediately',
      '- Boosted listing for a week',
      '- After boosted listing additional regualr listing for 1 week',
      '- Priority support'
    ],
    buttonText: 'Get Started',
    paypalPlanId: 'basic-boost'
  },
  {
    name: 'Premium Boost',
    price: 15,
    period: 'week',
    badge: { 
      text: 'Best Value',
      variant: 'secondary'
    },
    features: [
      '- Launch immediately',
      '- Premium listing for a week',
      '- After boosted listing additional regualr listing for 1 week',
      '- 1x Newsletter mention'
    ],
    highlighted: true,
    buttonText: 'Upgrade to Pro',
    paypalPlanId: 'pro-boost'
  },
  {
    name: 'Custom',
    price: 'Custom',
    period: 'annually',
    badge: {
      text: 'Enterprise',
      variant: 'outline'
    },
    features: [
      '- Custom promotion plan',
      '- Dedicated support',
      '- Custom integrations'
    ],
    buttonText: 'Contact Sales'
  }
];
