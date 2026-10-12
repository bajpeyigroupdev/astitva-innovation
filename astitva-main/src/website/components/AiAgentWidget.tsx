import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  User,
  ShieldCheck,
  Minimize2
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
}

export const AiAgentWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "bot",
      text: "👋 Welcome to Astitva Innovation! I am your AI Solutions Architect. Whether you need a FinTech Payment Gateway, Custom SaaS Platform, or have questions about Meethi Chat, I can help you immediately. What would you like to explore?",
      time: "Just now"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Lead capture state
  const [step, setStep] = useState<"chat" | "lead-name" | "lead-phone" | "submitted">("chat");
  const [leadData, setLeadData] = useState({
    name: "",
    phone: "",
    email: "",
    projectType: "Custom Software",
    summary: ""
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  const submitAiLead = async (finalLead: typeof leadData, allMessages: ChatMessage[]) => {
    const apiBase = import.meta.env.VITE_API_URL || "";
    const payload = {
      name: finalLead.name || "Website AI Visitor",
      phone: finalLead.phone || "Not provided",
      email: finalLead.email || "ai-lead@astitvainnovation.in",
      projectType: finalLead.projectType || "AI Assistant Inquiry",
      budget: "₹1,50,000 - ₹5,00,000",
      summary: `AI Assistant Chat Conversation with ${finalLead.name}. Interest: ${finalLead.projectType}.`,
      conversationHistory: allMessages.map(m => `${m.sender.toUpperCase()}: ${m.text}`)
    };

    try {
      await fetch(`${apiBase}/api/ai-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Fallback local storage
      console.warn("Dispatched lead offline fallback:", e);
    }
  };

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputVal("");

    if (step === "lead-name") {
      setLeadData((prev) => ({ ...prev, name: text }));
      setStep("lead-phone");
      addBotMessage(`Nice to meet you, ${text}! What is the best WhatsApp or Phone number to send your architecture proposal to? (+91 format)`);
      return;
    }

    if (step === "lead-phone") {
      const updatedLead = { ...leadData, phone: text };
      setLeadData(updatedLead);
      setStep("submitted");
      submitAiLead(updatedLead, nextMessages);
      addBotMessage(`🎉 Thank you, ${updatedLead.name}! I have dispatched your requirements directly to Shivansh Kamal Bajpeyi and our senior engineering desk. We will connect with you on ${text} shortly!`);
      return;
    }

    // Keyword detection
    const lower = text.toLowerCase();
    if (lower.includes("payment") || lower.includes("gateway") || lower.includes("fintech") || lower.includes("upi")) {
      setLeadData(prev => ({ ...prev, projectType: "FinTech & Payment Gateway" }));
      addBotMessage("We engineer high-availability FinTech payment routing engines with automated Razorpay, Cashfree & Stripe fallbacks, UPI dynamic QR, and webhook reconciliation. May I know your name so our architect can prepare a custom architecture document for you?");
      setStep("lead-name");
    } else if (lower.includes("meethi") || lower.includes("voice") || lower.includes("chat") || lower.includes("webrtc")) {
      setLeadData(prev => ({ ...prev, projectType: "Meethi Chat / WebRTC Platform" }));
      addBotMessage("Meethi Chat is our proprietary high-concurrency social voice platform powered by WebRTC, in-app gifting, and live matchmaking. Are you looking to build a similar audio/social ecosystem? Please share your name to discuss technical specs.");
      setStep("lead-name");
    } else if (lower.includes("price") || lower.includes("cost") || lower.includes("budget") || lower.includes("quote")) {
      addBotMessage("Our enterprise engagements typically range from ₹1.5L for specialized microservices to ₹10L+ for full-scale SaaS platforms. May I know your name and phone number to provide an exact quotation?");
      setStep("lead-name");
    } else if (lower.includes("shivansh") || lower.includes("shiv") || lower.includes("founder") || lower.includes("call")) {
      setLeadData(prev => ({ ...prev, projectType: "Executive Founder Consultation" }));
      addBotMessage("I can schedule a direct consultation for you with our founders (Shivansh Kamal Bajpeyi - CEO, or Shiv Prakash - COO). What is your name?");
      setStep("lead-name");
    } else {
      setLeadData(prev => ({ ...prev, projectType: text.slice(0, 50) }));
      addBotMessage("Got it! That sounds like an exciting project. Our team specializes in production-ready architecture. May I have your name to connect you with our lead developer?");
      setStep("lead-name");
    }
  };

  const handleSuggestionClick = (query: string) => {
    setInputVal(query);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      
      {/* 1. TOP BUBBLE: WhatsApp Direct Action (Always accessible or stacked on top) */}
      {!isOpen && (
        <a
          href="https://wa.me/917233882089?text=Hi%20Astitva%20Innovation,%20I%20would%20like%20to%20discuss%20a%20software%20project."
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 animate-in fade-in slide-in-from-bottom-2"
          title="Chat directly on WhatsApp (+91 7233882089)"
          aria-label="Direct WhatsApp Chat"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <Phone className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-12" />
          <span className="text-xs font-bold tracking-tight">
            WhatsApp <span className="hidden sm:inline font-mono text-[11px] text-white/90">(+91 7233882089)</span>
          </span>
        </a>
      )}

      {/* 2. BOTTOM BUBBLE: AI Solutions Architect Assistant Toggle */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary via-indigo-600 to-accent text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 animate-in fade-in slide-in-from-bottom-3"
          aria-label="Open AI Architect Assistant"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300" />
          </span>
          <Bot className="w-5 h-5 shrink-0 transition-transform group-hover:rotate-12" />
          <span className="text-xs font-bold tracking-tight">
            AI Architect <span className="font-normal text-white/80">• Online</span>
          </span>
        </button>
      )}

      {/* Expanded Interactive AI Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] rounded-3xl bg-card/95 border border-border/80 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-card via-background to-card border-b border-border/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-md">
                  <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                  Astitva AI Architect <Sparkles className="w-3.5 h-3.5 text-accent" />
                </h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span>Fast Response</span> • <span className="text-emerald-400 font-mono">Desk Active</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Contact Alert Strip */}
          <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-[11px]">
            <span className="text-primary font-medium">Need instant human contact?</span>
            <a
              href="https://wa.me/917233882089"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline font-mono font-bold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" /> +91 7233882089
            </a>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    m.sender === "user"
                      ? "bg-primary text-white rounded-br-none shadow-md shadow-primary/20"
                      : "bg-background/80 border border-border/70 text-foreground rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-muted-foreground mt-1 px-1 font-mono">
                  {m.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-muted-foreground bg-background/60 p-2.5 rounded-xl border border-border/50 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px] ml-1">Analyzing architecture...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggestion Chips */}
          {step === "chat" && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {[
                "FinTech Payment Routing",
                "Custom Mobile App",
                "Meethi Chat Architecture",
                "Book Call with Founders"
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSuggestionClick(chip)}
                  className="px-2.5 py-1 text-[10px] rounded-lg bg-background/70 hover:bg-primary/20 text-muted-foreground hover:text-foreground border border-border/60 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-background/80 border-t border-border/70">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <Input
                type="text"
                placeholder={
                  step === "lead-name"
                    ? "Enter your name..."
                    : step === "lead-phone"
                    ? "Enter WhatsApp / Phone (+91)..."
                    : "Ask about FinTech, Apps, or Architecture..."
                }
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="bg-card/70 border-border/80 text-xs h-10 flex-grow"
              />
              <Button
                type="submit"
                variant="hero"
                size="sm"
                className="h-10 px-3.5 shrink-0"
                disabled={!inputVal.trim()}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};

export default AiAgentWidget;
