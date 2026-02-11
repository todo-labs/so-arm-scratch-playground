export const BLOCK_CONSTANTS = {
  NOTCH_WIDTH: 15,
  NOTCH_HEIGHT: 4,
  NOTCH_OFFSET_LEFT: 12,
  CORNER_RADIUS: 4,
  MIN_WIDTH: 80,
  MIN_HEIGHT: 48,
  HAT_HEIGHT: 12,
  CAP_HEIGHT: 0,
  STROKE_WIDTH: 1,
};

// Puzzle notch path (relative to start point)
// Standard Scratch notch is roughly: down 4, right 12 (curved), up 4
const NOTCH_PATH = `c 2 0 3 4 8 4 l 4 0 c 5 0 6 -4 8 -4`;

// Helper to create the top edge path
const pathTop = (width: number, hasNotch: boolean) => {
  const { CORNER_RADIUS, NOTCH_OFFSET_LEFT } = BLOCK_CONSTANTS;
  let path = `M 0 ${CORNER_RADIUS} a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} -${CORNER_RADIUS}`; // Top-left corner

  if (hasNotch) {
    path += ` L ${NOTCH_OFFSET_LEFT} 0 ${NOTCH_PATH}`;
  }

  path += ` L ${width - CORNER_RADIUS} 0 a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}`; // Top-right corner
  return path;
};

// Full Command Block Path
export const getCommandBlockPath = (
  width: number,
  height: number,
  hasNotchTop = true,
  hasNotchBottom = true
) => {
  const { CORNER_RADIUS } = BLOCK_CONSTANTS;

  // 1. Top Edge
  let d = pathTop(width, hasNotchTop);

  // 2. Right Edge
  d += ` L ${width} ${height - CORNER_RADIUS} a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} ${CORNER_RADIUS}`;

  // 3. Bottom Edge
  // Line to notch or corner
  const socketEnd = BLOCK_CONSTANTS.NOTCH_OFFSET_LEFT + 20;

  if (hasNotchBottom) {
    d += ` L ${socketEnd} ${height}`;
    // Draw socket
    d += ` c -2 0 -3 4 -8 4 l -4 0 c -5 0 -6 -4 -8 -4`;
  }

  d += ` L ${CORNER_RADIUS} ${height} a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}`;

  // 4. Left Edge
  d += ` L 0 ${CORNER_RADIUS} Z`;

  return d;
};

// Hat Block Path
export const getHatBlockPath = (width: number, height: number, hasNotchBottom = true) => {
  const { CORNER_RADIUS } = BLOCK_CONSTANTS;

  // Hat Top (Curved)
  let d = `M 0 12 c 25 -12 60 -12 80 0`; // curved top
  d += ` L ${width - CORNER_RADIUS} 12 a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}`;

  // Right Edge
  d += ` L ${width} ${height - CORNER_RADIUS} a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} ${CORNER_RADIUS}`;

  // Bottom Edge (same as command)
  const socketEnd = BLOCK_CONSTANTS.NOTCH_OFFSET_LEFT + 20;
  if (hasNotchBottom) {
    d += ` L ${socketEnd} ${height}`;
    d += ` c -2 0 -3 4 -8 4 l -4 0 c -5 0 -6 -4 -8 -4`;
  }
  d += ` L ${CORNER_RADIUS} ${height} a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}`;

  // Left Edge
  d += ` L 0 12 Z`;

  return d;
};

// C-Block (Control) Path
// For simplicity, we assume standard dimensions based on content.
export const getCBlockPath = (
  width: number,
  topBarHeight: number,
  _armWidth: number = 30, // unused
  _interiorHeight: number = 32, // unused
  _bottomBarHeight: number = 32, // unused
  hasNotchTop = true,
  hasNotchBottom = true
) => {
  // Basic alias to command block path for V1
  return getCommandBlockPath(width, topBarHeight, hasNotchTop, hasNotchBottom);
};

// Reporter Block (Pill)
export const getReporterPath = (width: number, height: number) => {
  const r = height / 2;
  return `M ${r} 0 L ${width - r} 0 a ${r} ${r} 0 0 1 0 ${height} L ${r} ${height} a ${r} ${r} 0 0 1 0 -${height} Z`;
};

// Boolean Block (Hexagon)
export const getBooleanPath = (width: number, height: number) => {
  const r = height / 2;
  // Pointy ends
  return `M ${r} 0 L ${width - r} 0 L ${width} ${r} L ${width - r} ${height} L ${r} ${height} L 0 ${r} Z`;
};

// C-Block Footer Path (bottom closing piece for If/Repeat blocks)
export const getCBlockFooterPath = (width: number, footerHeight: number = 16) => {
  const cornerRadius = 4;
  return `M ${cornerRadius} 0 L ${width - cornerRadius} 0 a ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} ${cornerRadius} L ${width} ${footerHeight - cornerRadius} a ${cornerRadius} ${cornerRadius} 0 0 1 -${cornerRadius} ${cornerRadius} L ${cornerRadius} ${footerHeight} a ${cornerRadius} ${cornerRadius} 0 0 1 -${cornerRadius} -${cornerRadius} L 0 ${cornerRadius} Z`;
};
