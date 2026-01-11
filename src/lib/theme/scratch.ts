export const SCRATCH_THEME = {
  // Vibrant category colors with gradients
  colors: {
    motion: {
      base: "hsl(217, 91%, 60%)",
      gradient: "linear-gradient(135deg, hsl(217, 91%, 65%) 0%, hsl(217, 91%, 50%) 100%)",
      shadow: "0 4px 0 hsl(217, 91%, 45%)",
    },
    control: {
      base: "hsl(38, 92%, 50%)",
      gradient: "linear-gradient(135deg, hsl(38, 92%, 58%) 0%, hsl(38, 92%, 42%) 100%)",
      shadow: "0 4px 0 hsl(38, 92%, 35%)",
    },
    gripper: {
      base: "hsl(142, 71%, 45%)",
      gradient: "linear-gradient(135deg, hsl(142, 71%, 52%) 0%, hsl(142, 71%, 38%) 100%)",
      shadow: "0 4px 0 hsl(142, 71%, 30%)",
    },
    sensing: {
      base: "hsl(199, 89%, 48%)",
      gradient: "linear-gradient(135deg, hsl(199, 89%, 55%) 0%, hsl(199, 89%, 40%) 100%)",
      shadow: "0 4px 0 hsl(199, 89%, 32%)",
    },
    operators: {
      base: "hsl(280, 67%, 55%)",
      gradient: "linear-gradient(135deg, hsl(280, 67%, 62%) 0%, hsl(280, 67%, 45%) 100%)",
      shadow: "0 4px 0 hsl(280, 67%, 38%)",
    },
  },

  // Block category icons (emoji)
  icons: {
    motion: "🤖",
    control: "🔄",
    gripper: "✋",
    sensing: "👁️",
    operators: "🔢",
    custom: "⭐",
  },

  // Animation timings
  animation: {
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
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
