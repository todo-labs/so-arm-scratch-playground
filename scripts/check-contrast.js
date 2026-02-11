#!/usr/bin/env node

const WCAG_AA_RATIO = 4.5;

const THEME_COLORS = {
  motion: {
    base: "#1E40AF",
    text: "#FFFFFF",
    darkBase: "#1D4ED8",
  },
  control: {
    base: "#B45309",
    text: "#FFFFFF",
    darkBase: "#92400E",
  },
  sensing: {
    base: "#0E7490",
    text: "#FFFFFF",
    darkBase: "#155E75",
  },
  operators: {
    base: "#047857",
    text: "#FFFFFF",
    darkBase: "#065F46",
  },
  variables: {
    base: "#C2410C",
    text: "#FFFFFF",
    darkBase: "#9A3412",
  },
  custom: {
    base: "#B91C1C",
    text: "#FFFFFF",
    darkBase: "#991B1B",
  },
  gripper: {
    base: "#6D28D9",
    text: "#FFFFFF",
    darkBase: "#5B21B6",
  },
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return null;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (brighter + 0.05) / (darker + 0.05);
}

function checkContrast(mode = "light") {
  console.log(`\n=== WCAG AA Contrast Checker (${mode} mode) ===\n`);
  console.log("Required ratio: 4.5:1\n");

  const colors = THEME_COLORS;
  let passed = true;

  for (const [category, colorSet] of Object.entries(colors)) {
    const baseColor = mode === "dark" ? colorSet.darkBase : colorSet.base;
    const textColor = colorSet.text;
    const ratio = getContrastRatio(baseColor, textColor);

    if (!ratio) {
      console.log(`❌ ${category}: Invalid color format`);
      passed = false;
      continue;
    }

    const isPass = ratio >= WCAG_AA_RATIO;
    const status = isPass ? "✓ PASS" : "✗ FAIL";
    const ratioDisplay = `${ratio.toFixed(2)}:1`;

    console.log(
      `${status} ${category.padEnd(12)} ${ratioDisplay.padEnd(8)} (${baseColor} on ${textColor})`
    );

    if (!isPass) passed = false;
  }

  console.log(`\n${"=".repeat(50)}`);

  if (passed) {
    console.log("✓ All colors pass WCAG AA requirements!");
    process.exit(0);
  } else {
    console.log("✗ Some colors fail WCAG AA requirements!");
    process.exit(1);
  }
}

const mode = process.argv.includes("--mode")
  ? process.argv[process.argv.indexOf("--mode") + 1]
  : "light";

if (mode !== "light" && mode !== "dark") {
  console.error('Error: Mode must be "light" or "dark"');
  process.exit(1);
}

checkContrast(mode);
