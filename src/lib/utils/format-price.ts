export function formatPrice(price: string | number, period: string): string {
  if (typeof price === 'string') return price;
  return `$${price}/${period === 'annually' ? 'yr' : period === 'monthly' ? 'mo' : 'wk'}`;
}