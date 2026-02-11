export const SCRATCH_THEME = {
  // Vibrant category colors with gradients - WCAG AA compliant (4.5:1+ contrast)
  colors: {
    motion: {
      base: "#1E40AF",
      gradient: "linear-gradient(180deg, #2563EB 0%, #1E40AF 100%)",
      shadow: "0 2px 0 #1E3A8A",
      text: "#FFFFFF",
      secondary: "#1D4ED8",
      darkBase: "#1D4ED8",
      darkSecondary: "#1E40AF",
    },
    control: {
      base: "#B45309",
      gradient: "linear-gradient(180deg, #D97706 0%, #B45309 100%)",
      shadow: "0 2px 0 #92400E",
      text: "#FFFFFF",
      secondary: "#92400E",
      darkBase: "#92400E",
      darkSecondary: "#B45309",
    },
    sensing: {
      base: "#0E7490",
      gradient: "linear-gradient(180deg, #0891B2 0%, #0E7490 100%)",
      shadow: "0 2px 0 #155E75",
      text: "#FFFFFF",
      secondary: "#155E75",
      darkBase: "#155E75",
      darkSecondary: "#0E7490",
    },
    operators: {
      base: "#047857",
      gradient: "linear-gradient(180deg, #059669 0%, #047857 100%)",
      shadow: "0 2px 0 #065F46",
      text: "#FFFFFF",
      secondary: "#065F46",
      darkBase: "#065F46",
      darkSecondary: "#047857",
    },
    variables: {
      base: "#C2410C",
      gradient: "linear-gradient(180deg, #EA580C 0%, #C2410C 100%)",
      shadow: "0 2px 0 #9A3412",
      text: "#FFFFFF",
      secondary: "#9A3412",
      darkBase: "#9A3412",
      darkSecondary: "#C2410C",
    },
    custom: {
      base: "#B91C1C",
      gradient: "linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)",
      shadow: "0 2px 0 #991B1B",
      text: "#FFFFFF",
      secondary: "#991B1B",
      darkBase: "#991B1B",
      darkSecondary: "#B91C1C",
    },
    gripper: {
      base: "#6D28D9",
      gradient: "linear-gradient(180deg, #7C3AED 0%, #6D28D9 100%)",
      shadow: "0 2px 0 #5B21B6",
      text: "#FFFFFF",
      secondary: "#5B21B6",
      darkBase: "#5B21B6",
      darkSecondary: "#6D28D9",
    },
  } as const,

  // Block category icons (Lucide icon component names)
  icons: {
    motion: "Bot",
    control: "RefreshCcw",
    gripper: "Hand",
    sensing: "Eye",
    operators: "Calculator",
    custom: "Star",
  } as const,

  // Animation tokens - comprehensive timing system
  animation: {
    // Easing functions
    ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    easeIn: "cubic-bezier(0.42, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.58, 1)",
    easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    elastic: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    // Durations
    instant: "50ms",
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
    slower: "600ms",
    // Delays
    none: "0ms",
    short: "100ms",
    medium: "200ms",
    long: "300ms",
  },

  // Spacing scale - consistent spacing system
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    xxl: "24px",
    xxxl: "32px",
  },

  // Shadow tokens - depth hierarchy
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 2px 4px rgba(0, 0, 0, 0.1)",
    lg: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    xl: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    block: "0 2px 0 rgba(0, 0, 0, 0.2)",
    blockHover: "0 4px 0 rgba(0, 0, 0, 0.2)",
    blockActive: "0 1px 0 rgba(0, 0, 0, 0.2)",
  },

  // Block shape dimensions
  block: {
    notchWidth: 20,
    notchHeight: 6,
    notchOffset: 24,
    borderRadius: 12,
    minHeight: 48,
    padding: 12,
  },

  // Workspace
  workspace: {
    gridSize: 20,
    backgroundColor: "#f8fafc",
    gridColor: "rgba(148, 163, 184, 0.3)",
  },
} as const;

export type ScratchTheme = typeof SCRATCH_THEME;

// Sound effect URLs (using simple Web Audio API tones)
export const SOUND_EFFECTS = {
  click: { frequency: 800, duration: 50 },
  snap: { frequency: 600, duration: 80 },
  drop: { frequency: 400, duration: 100 },
  success: { frequencies: [523, 659, 784], duration: 150 },
  error: { frequency: 200, duration: 200 },
} as const;

// Simple sound player using Web Audio API
let audioContext: AudioContext | null = null;

export function playSound(effect: keyof typeof SOUND_EFFECTS): void {
  if (typeof window === "undefined") return;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  const config = SOUND_EFFECTS[effect];

  if ("frequencies" in config) {
    // Play chord (success sound)
    config.frequencies.forEach((freq, i) => {
      playTone(freq, config.duration, i * 50);
    });
  } else {
    playTone(config.frequency, config.duration, 0);
  }
}

function playTone(frequency: number, duration: number, delay: number): void {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + delay / 1000);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + delay / 1000 + duration / 1000
  );

  oscillator.start(audioContext.currentTime + delay / 1000);
  oscillator.stop(audioContext.currentTime + delay / 1000 + duration / 1000);
}
