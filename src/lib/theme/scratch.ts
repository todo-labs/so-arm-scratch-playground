export const SCRATCH_THEME = {
  // Vibrant category colors with gradients
  colors: {
    motion: {
      base: "#4C97FF",
      gradient: "linear-gradient(180deg, #4C97FF 0%, #3373CC 100%)",
      shadow: "0 2px 0 #3373CC",
      text: "#FFFFFF",
      secondary: "#3373CC",
    },
    control: {
      base: "#FFAB19",
      gradient: "linear-gradient(180deg, #FFAB19 0%, #CF8B17 100%)",
      shadow: "0 2px 0 #CF8B17",
      text: "#FFFFFF",
      secondary: "#CF8B17",
    },
    sensing: {
      base: "#5CB1D6",
      gradient: "linear-gradient(180deg, #5CB1D6 0%, #2E8EB8 100%)",
      shadow: "0 2px 0 #2E8EB8",
      text: "#FFFFFF",
      secondary: "#2E8EB8",
    },
    operators: {
      base: "#59C059",
      gradient: "linear-gradient(180deg, #59C059 0%, #389438 100%)",
      shadow: "0 2px 0 #389438",
      text: "#FFFFFF",
      secondary: "#389438",
    },
    variables: {
      base: "#FF8C1A",
      gradient: "linear-gradient(180deg, #FF8C1A 0%, #DB6E00 100%)",
      shadow: "0 2px 0 #DB6E00",
      text: "#FFFFFF",
      secondary: "#DB6E00",
    },
    custom: {
      base: "#FF6680",
      gradient: "linear-gradient(180deg, #FF6680 0%, #FF3355 100%)",
      shadow: "0 2px 0 #FF3355",
      text: "#FFFFFF",
      secondary: "#FF3355",
    },
    gripper: {
      base: "#9966FF",
      gradient: "linear-gradient(180deg, #9966FF 0%, #774DCB 100%)",
      shadow: "0 2px 0 #774DCB",
      text: "#FFFFFF",
      secondary: "#774DCB",
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
