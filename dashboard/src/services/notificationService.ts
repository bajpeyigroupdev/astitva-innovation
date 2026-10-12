import { authService } from "../auth/authService";
import { Inquiry } from "../types";

let audioCtx: AudioContext | null = null;
let pollTimer: any = null;
let knownInquiryIds = new Set<string>();
let isInitialized = false;

export const notificationService = {
  /**
   * Play a clean, premium melodic chime using Web Audio API
   */
  playChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtx || audioCtx.state === 'closed') {
        audioCtx = new AudioContextClass();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      // High-tech notification chord: C5 -> E5 -> G5
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(audioCtx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch (e) {
      console.warn("Audio chime playback blocked or unavailable:", e);
    }
  },

  /**
   * Request system notification permissions
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied";
    }
    const perm = await Notification.requestPermission();
    return perm;
  },

  /**
   * Check if notifications are granted
   */
  hasPermission(): boolean {
    return "Notification" in window && Notification.permission === "granted";
  },

  /**
   * Show a native push / mobile notification
   */
  async showNotification(title: string, options?: NotificationOptions) {
    if (!this.hasPermission()) return;

    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          return reg.showNotification(title, {
            icon: "/favicon.png",
            badge: "/favicon.png",
            vibrate: [200, 100, 200],
            ...options
          });
        }
      }

      new Notification(title, {
        icon: "/favicon.png",
        ...options
      });
    } catch (e) {
      console.warn("Notification dispatch failed:", e);
    }
  },

  /**
   * Test notification and chime
   */
  async sendTestNotification() {
    this.playChime();
    await this.showNotification("🔔 Astitva Command Center Alert Active", {
      body: "Test notification: You will receive real-time alerts whenever a client messages or requests a quote.",
      tag: "test-alert",
    });
  },

  /**
   * Start background monitor polling for new incoming inquiries
   */
  startInquiryMonitor(onNewInquiry?: (inquiry: Inquiry) => void) {
    if (pollTimer) clearInterval(pollTimer);

    const checkNewLeads = async () => {
      const token = authService.getToken();
      if (!token) return;

      try {
        const apiBase = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiBase}/api/inquiries`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const list: Inquiry[] = json.data;

            if (!isInitialized) {
              // Seed known IDs on first fetch without alarming
              list.forEach(i => knownInquiryIds.add(i.id));
              isInitialized = true;
              return;
            }

            // Check for new inquiries
            for (const item of list) {
              if (!knownInquiryIds.has(item.id)) {
                knownInquiryIds.add(item.id);
                // Trigger sound and system push alert!
                this.playChime();
                this.showNotification(`🔔 New Lead: ${item.name}`, {
                  body: `${item.service} (${item.budget || "Quote"})\nPhone: ${item.phone}\n${item.message.slice(0, 75)}`,
                  data: { url: "/inquiries" },
                  tag: item.id
                });

                if (onNewInquiry) {
                  onNewInquiry(item);
                }
              }
            }
          }
        }
      } catch (err) {
        // Silently continue
      }
    };

    // Initial check
    checkNewLeads();
    // Poll every 12 seconds
    pollTimer = setInterval(checkNewLeads, 12000);
  },

  stopInquiryMonitor() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }
};
