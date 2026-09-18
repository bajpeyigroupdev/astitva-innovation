import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalModalProps {
  type: "privacy" | "terms" | "refund" | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModals = ({ type, isOpen, onClose }: LegalModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-card border-border/80 p-6 md:p-8">
        <DialogHeader className="pb-4 border-b border-border/60">
          <DialogTitle className="text-xl font-bold">
            {type === "privacy" && "Privacy Policy"}
            {type === "terms" && "Terms of Service"}
            {type === "refund" && "Refund & Cancellation Policy"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Astitva Innovation • https://astitvainnovation.in • Last Updated: September 2026
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="pr-4 max-h-[60vh] text-xs text-muted-foreground space-y-4 leading-relaxed">
          {type === "privacy" && (
            <div className="space-y-4 py-2">
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">1. Information We Collect</h4>
                <p>
                  Astitva Innovation collects information you provide directly to us when requesting quotations, submitting project scopes, or communicating with our engineering team. This includes your name, corporate email address (such as contact@astitvainnovation.in), phone number, and project technical specifications.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">2. How We Use Your Data</h4>
                <p>
                  We strictly use your information to provide custom software development services, project cost estimations, invoice processing, and technical support. We never sell, rent, or lease client data to third parties.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">3. Payment & Security Compliance</h4>
                <p>
                  All online payments and transactions are processed through certified PCI-DSS Level 1 compliant payment gateways (Razorpay, Stripe, Cashfree). Astitva Innovation does not store sensitive payment card details or banking credentials on our local servers.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">4. Non-Disclosure & Intellectual Property</h4>
                <p>
                  All project specifications and proprietary ideas shared through our portal are protected under strict Non-Disclosure guidelines. For any inquiries, reach us at privacy@astitvainnovation.in.
                </p>
              </div>
            </div>
          )}

          {type === "terms" && (
            <div className="space-y-4 py-2">
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">1. Scope of Engagement</h4>
                <p>
                  By accessing the services of Astitva Innovation, you agree to the software engineering milestones and terms outlined in your formal Statement of Work (SOW) or proposal contract.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">2. Intellectual Property Rights</h4>
                <p>
                  Upon 100% completion of milestone payments, full and exclusive intellectual property rights, copyrights, Git repositories, and source code ownership are unconditionally assigned and transferred to the client.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">3. Milestones & Delivery Schedule</h4>
                <p>
                  Projects are delivered in iterative Agile sprints. Delays caused by client feedback turnaround or third-party API dependencies (e.g. banking gateway verification) will reasonably extend agreed delivery timelines.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">4. Limitation of Liability</h4>
                <p>
                  Astitva Innovation shall not be held liable for indirect, incidental, or third-party outages (including external cloud hosting outages or payment gateway bank downtime).
                </p>
              </div>
            </div>
          )}

          {type === "refund" && (
            <div className="space-y-4 py-2">
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">1. Custom Development Milestones</h4>
                <p>
                  Software engineering services provided by Astitva Innovation involve customized technical architecture and dedicated developer bandwidth. As such, work completed for approved milestone phases is non-refundable once sprint deliverables have been demonstrated and accepted.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">2. Cancellation Policy</h4>
                <p>
                  Clients may cancel an ongoing engagement with written notice. In the event of early termination, the client will only be billed for hours/sprints completed up to the cancellation date, and all code completed up to that date will be released.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">3. 60-Day Post-Launch Warranty</h4>
                <p>
                  In lieu of refunds, all production releases include a 60-day complimentary warranty period during which our engineering team resolves any technical bugs or deviations from the signed SOW free of charge.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">4. Payment Gateway Inquiries</h4>
                <p>
                  For payment verification or invoice inquiries, please contact our billing team directly at billing@astitvainnovation.in or call our support line.
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LegalModals;
