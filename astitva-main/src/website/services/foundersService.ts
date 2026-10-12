export interface FounderProfile {
  id: string;
  name: string;
  position: string;
  roleBadge: string;
  bio: string;
  portfolioSummary: string;
  keySkills: string[];
  photoUrl: string;
  linkedin: string;
  instagram: string;
  email: string;
  phone: string;
  order?: number;
  enabled?: boolean;
}

export const defaultFoundersSeed: FounderProfile[] = [
  {
    id: "founder-shivansh",
    name: "Shivansh Kamal Bajpeyi",
    position: "Founder & Chief Executive Officer",
    roleBadge: "CEO & Principal Software Architect",
    bio: "Visionary technologist and founder leading engineering innovation, full-stack product architecture, and enterprise payment systems at Astitva Innovation.",
    portfolioSummary: "Shivansh Kamal Bajpeyi heads the engineering direction and strategic technology roadmaps at Astitva Innovation. With deep expertise across high-concurrency systems, real-time voice architectures (WebRTC), high-throughput payment routing, and enterprise cloud DevOps, Shivansh spearheaded the development of flagship products like Meethi Chat and bank-grade FinTech middleware.",
    keySkills: ["Distributed Systems", "FinTech & Payment Gateways", "WebRTC & Audio Protocols", "Cloud Architecture & DevOps", "Full-Stack System Design"],
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    linkedin: "https://www.linkedin.com/in/shivansh-bajpeyi",
    instagram: "https://www.instagram.com/shivansh_bajpeyi",
    email: "shivansh@astitvainnovation.in",
    phone: "+91 7233882089",
    order: 1,
    enabled: true
  },
  {
    id: "founder-shiv-prakash",
    name: "Shiv Prakash",
    position: "Co-Founder & Chief Operations Officer",
    roleBadge: "COO & Enterprise Strategy Lead",
    bio: "Strategic growth leader spearheading business expansion, operational excellence, client partnerships, and international product commercialization.",
    portfolioSummary: "Shiv Prakash oversees operational lifecycles, commercial client relationships, and business development initiatives. Bringing extensive experience in agile team scaling, strategic growth, and operational management, Shiv drives the commercialization of Astitva's enterprise software solutions and ensures top-tier client execution.",
    keySkills: ["Operations Management", "Business Strategy", "Client Delivery & SOWs", "Product Commercialization", "Agile Execution"],
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    linkedin: "https://www.linkedin.com/in/shiv-prakash",
    instagram: "https://www.instagram.com/shiv_prakash",
    email: "shivprakash@astitvainnovation.in",
    phone: "+91 7233882089",
    order: 2,
    enabled: true
  }
];

export const foundersService = {
  async getFounders(): Promise<FounderProfile[]> {
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/founders`, {
        headers: { Accept: "application/json" }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Using default founders seed:", err);
    }
    return defaultFoundersSeed;
  }
};
