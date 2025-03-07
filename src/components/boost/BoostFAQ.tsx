import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'How does the featuring process work?',
    answer: 'Once you select a plan, make payment with debit/credit or Paypal once the payment is done successfully, you will be redirected to a submission form fill it and you will be done.'
  },
  {
    question: 'What are the requirements for featuring?',
    answer: 'Your startup should have a live product/service and some traction. We\'ll need your logo, description, metrics, and other relevant information about your startup.'
  },
  {
    question: 'Can I cancel my feature at any time?',
    answer: 'Yes, you can cancel your featuring at any time. Your listing will remain active until the end of your current billing period.'
  }
];

export function BoostFAQ() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}