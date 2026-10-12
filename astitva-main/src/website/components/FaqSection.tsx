import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export const FaqSection = () => {
  const faqs = [
    {
      q: "Who owns the source code and intellectual property (IP)?",
      a: "You own 100% of the intellectual property, source code, database architecture, and design assets from day one. Upon project completion and final milestone release, all Git repositories, cloud keys, and deployment credentials are fully transferred to your organization."
    },
    {
      q: "Can you help us get merchant approval for Payment Gateways like Razorpay, Stripe, or Cashfree?",
      a: "Yes, absolutely! Payment aggregators require specific business compliance elements (such as legally compliant Terms of Service, Privacy Policy, Refund Policy, secure HTTPS SSL, and pricing transparency). We ensure your application meets 100% of payment aggregator compliance guidelines and assist in live API key activation."
    },
    {
      q: "Do you sign a Non-Disclosure Agreement (NDA) before we share our idea?",
      a: "Yes. Client confidentiality and IP protection are our highest priorities. We execute a mutual Non-Disclosure Agreement (NDA) before any proprietary technical details or business concepts are discussed."
    },
    {
      q: "How do you handle communication during the development process?",
      a: "We practice transparent Agile methodologies. You will have a dedicated Project Manager and direct access to your lead developers via a dedicated Slack/Teams/WhatsApp channel. We hold weekly sprint demos and provide live staging URLs so you can test features as they are built."
    },
    {
      q: "What happens after the website or application goes live? Is there a warranty?",
      a: "Every project delivered by Astitva Innovation includes 60 days of complimentary post-launch warranty support covering bug fixes, performance monitoring, and server stability. After the initial warranty, we offer flexible 24/7 SLA maintenance retainers."
    },
    {
      q: "What are your payment terms and milestone schedule?",
      a: "We operate on transparent milestone-based payments: typically 30% initial deposit upon architectural sign-off, 40% midway upon demonstration of core features on staging, and the remaining 30% upon final QA sign-off and production release."
    }
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase border-accent/40 bg-accent/10 text-accent">
            Got Questions?
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Frequently Asked <span className="bg-gradient-primary bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Clear, honest answers about our engineering process, IP ownership, payment integrations, and delivery timelines.
          </p>
        </div>

        {/* Accordion */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/70 rounded-2xl p-6 md:p-8">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem 
                key={idx} 
                value={`item-${idx}`}
                className="border-b border-border/60 pb-2 last:border-b-0"
              >
                <AccordionTrigger className="text-left font-semibold text-sm md:text-base hover:text-primary transition-colors py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </section>
  );
};

export default FaqSection;
