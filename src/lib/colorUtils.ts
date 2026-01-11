export const parseHsl = (value: string) => {
  const match = value
    .replace(/\s+/g, "")
    .match(/hsl\((\d+),(\d+)%?,(\d+)%?\)/i);
  if (!match) return null;
  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3]),
  };
};

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const shiftLightness = (value: string, delta: number) => {
  const hsl = parseHsl(value);
  if (!hsl) return value;
  const nextL = clamp(hsl.l + delta, 10, 92);
  return `hsl(${hsl.h}, ${hsl.s}%, ${nextL}%)`;
};
