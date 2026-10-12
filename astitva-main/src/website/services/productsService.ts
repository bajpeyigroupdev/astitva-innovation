export interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  category: string;
  badge: string;
  description: string;
  storeUrl?: string;
  storeType?: string;
  packageName?: string;
  iconUrl?: string;
  technologies?: string[];
  features?: string[];
  metrics?: { label: string; value: string }[];
  status?: string;
  isFeatured?: boolean;
}

export const defaultProductsSeed: ProductItem[] = [
  {
    id: "prod-meethi-chat",
    name: "Meethi Chat",
    tagline: "Social Voice & Friendship Platform",
    category: "Social Voice & Community",
    badge: "Official Flagship App",
    description: "Meethi Chat is a premium social voice platform designed for meaningful one-to-one conversations, friendships, and real-time voice calling. Users can discover people through smart matchmaking, personalize their profiles, send virtual gifts, and manage their wallet while enjoying private and engaging conversations.",
    storeUrl: "https://play.google.com/store/apps/details?id=com.umangchatlive&hl=en_IN",
    storeType: "google-play",
    packageName: "com.umangchatlive",
    iconUrl: "/meethi-chat-icon.png",
    status: "Active",
    isFeatured: true,
    technologies: ["WebRTC", "Node.js", "Socket.IO", "Redis", "Android Native"],
    features: [
      "Real-Time 1-on-1 Voice Calling with ultra-low latency WebRTC",
      "Smart Matchmaking interest-based algorithm",
      "Profile Customization with avatars and custom badges",
      "Virtual Gifting with animated rewards",
      "Wallet & Instant Recharge infrastructure",
      "Granular Privacy Controls & caller security",
      "Instant Block & Rapid Incident Reporting",
      "Verified Host & Talent Creator Ecosystem",
      "Safe Community 24/7 automated filters"
    ],
    metrics: [
      { label: "Engine", value: "Real-Time WebRTC Audio" },
      { label: "Community", value: "Verified Hosts" },
      { label: "Safety", value: "24/7 Moderation" }
    ]
  }
];

export const productsService = {
  async getProducts(): Promise<ProductItem[]> {
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/products`, {
        headers: { Accept: "application/json" }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Using default products seed:", err);
    }
    return defaultProductsSeed;
  }
};
