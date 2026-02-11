export const BLOCK_CONSTANTS = {
  BLOCK_HEIGHT: 48,
  BLOCK_CORNER_RADIUS: 8,
  PARAM_INSET: 40,
};

export function getCommandBlockPath(): string {
  return "M0,0 L100,0 L100,48 L0,48 Z";
}

export function getHatBlockPath(): string {
  return "M0,24 L8,0 L16,24 L24,0 L32,24 L40,0 L48,24 L56,0 L64,24 L72,0 L80,24 L88,0 L96,24 L104,0 L112,24 L120,0 L120,48 L0,48 Z";
}

export function getReporterPath(): string {
  return "M0,0 L40,0 A8,8 0 0,1 48,8 L48,40 A8,8 0 0,1 40,48 L0,48 Z";
}

export function getBooleanPath(): string {
  return "M0,0 L30,0 A8,8 0 0,1 38,8 L38,40 A8,8 0 0,1 30,48 L0,48 Z";
}
