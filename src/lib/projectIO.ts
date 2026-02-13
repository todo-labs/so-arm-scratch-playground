import type { BlockInstance } from "@/lib/types";

// Project file format version - increment when making breaking changes
export const PROJECT_VERSION = "1.0.0";

export interface ProjectMetadata {
  name: string;
  description: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface ProjectData {
  metadata: ProjectMetadata;
  blocks: BlockInstance[];
}

export interface ExportOptions {
  name?: string;
  description?: string;
  author?: string;
}

export interface ImportResult {
  success: boolean;
  data?: ProjectData;
  error?: string;
}

const IMPORT_LIMITS = {
  maxFileBytes: 1024 * 1024, // 1MB
  maxJsonCharacters: 1_000_000,
  maxShareCodeCharacters: 1_500_000,
  maxBlockDepth: 50,
  maxBlockCount: 5000,
} as const;

const SHARE_SECURITY = {
  version: 2,
  pbkdf2Iterations: 210_000,
  minPassphraseLength: 8,
} as const;

type SignedShareCodeEnvelope = {
  v: number;
  kdf: "PBKDF2";
  hash: "SHA-256";
  iterations: number;
  salt: string;
  payload: string;
  sig: string;
};

const WORD_LIST = [
  "autumn",
  "hidden",
  "bitter",
  "misty",
  "silent",
  "empty",
  "dry",
  "dark",
  "summer",
  "icy",
  "delicate",
  "quiet",
  "white",
  "cool",
  "spring",
  "winter",
  "patient",
  "twilight",
  "dawn",
  "crimson",
  "wispy",
  "weathered",
  "blue",
  "billowing",
  "broken",
  "cold",
  "damp",
  "falling",
  "frosty",
  "green",
  "long",
  "late",
  "lingering",
  "bold",
  "little",
  "morning",
  "muddy",
  "old",
  "red",
  "rough",
  "still",
  "small",
  "sparkling",
  "throbbing",
  "shy",
  "wandering",
  "withered",
  "wild",
  "black",
  "young",
  "holy",
  "solitary",
  "fragrant",
  "aged",
  "snowy",
  "proud",
  "floral",
  "restless",
  "divine",
  "polished",
  "ancient",
  "purple",
  "lively",
  "nameless",
  "pudding",
  "apple",
  "ocean",
  "mountain",
  "river",
  "forest",
  "desert",
  "cloud",
  "dream",
  "star",
  "moon",
  "sun",
  "fire",
  "water",
  "wind",
  "stone",
  "bird",
  "cat",
  "dog",
  "lion",
  "tiger",
  "bear",
  "wolf",
  "fox",
  "eagle",
  "hawk",
  "owl",
  "whale",
  "dolphin",
  "shark",
  "fish",
  "dragon",
  "phoenix",
  "unicorn",
  "knight",
  "wizard",
  "hero",
  "legend",
  "vortex",
  "nebula",
  "galaxy",
  "planet",
  "comet",
  "asteroid",
];

/**
 * Generates a random project name using 3 words delimited by hyphens
 */
export function generateRandomProjectName(): string {
  const words = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    words.push(WORD_LIST[randomIndex]);
  }
  return words.join("-");
}

/**
 * Creates a project data object from blocks
 */
export function createProjectData(
  blocks: BlockInstance[],
  options: ExportOptions = {}
): ProjectData {
  const now = new Date().toISOString();

  return {
    metadata: {
      name: options.name || generateRandomProjectName(),
      description: options.description || "",
      author: options.author || "",
      createdAt: now,
      updatedAt: now,
      version: PROJECT_VERSION,
    },
    blocks: blocks.map(sanitizeBlockForExport),
  };
}

/**
 * Sanitizes a block for export, ensuring clean data
 */
function sanitizeBlockForExport(block: BlockInstance): BlockInstance {
  return {
    id: block.id,
    definitionId: block.definitionId,
    x: block.x,
    y: block.y,
    parameters: { ...block.parameters },
    children: block.children.map(sanitizeBlockForExport),
    parentId: block.parentId,
    nextId: block.nextId,
    previousId: block.previousId,
    isSnapped: block.isSnapped,
  };
}

/**
 * Exports project data as a downloadable JSON file
 */
export function exportProject(blocks: BlockInstance[], options: ExportOptions = {}): void {
  const projectData = createProjectData(blocks, options);
  const jsonString = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const fileName = `${sanitizeFileName(projectData.metadata.name)}.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Sanitizes a filename to be valid across platforms
 */
function sanitizeFileName(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9-_\s]/g, "")
      .replace(/\s+/g, "_")
      .toLowerCase()
      .substring(0, 50) || "project"
  );
}

/**
 * Validates imported project data
 */
function validateProjectData(data: unknown): ImportResult {
  if (!data || typeof data !== "object") {
    return { success: false, error: "Invalid file format: expected an object" };
  }

  const project = data as Record<string, unknown>;

  // Check metadata
  if (!project.metadata || typeof project.metadata !== "object") {
    return { success: false, error: "Invalid file format: missing metadata" };
  }

  const metadata = project.metadata as Record<string, unknown>;
  if (typeof metadata.version !== "string") {
    return { success: false, error: "Invalid file format: missing version" };
  }

  // Check blocks
  if (!Array.isArray(project.blocks)) {
    return { success: false, error: "Invalid file format: blocks should be an array" };
  }

  // Validate each block
  const validationState = { blockCount: 0 };

  for (const block of project.blocks) {
    const blockValidation = validateBlock(block, 1, validationState);
    if (!blockValidation.valid) {
      return { success: false, error: blockValidation.error };
    }
  }

  return {
    success: true,
    data: project as unknown as ProjectData,
  };
}

/**
 * Validates a single block structure
 */
function validateBlock(
  block: unknown,
  depth: number,
  state: { blockCount: number }
): { valid: boolean; error?: string } {
  if (!block || typeof block !== "object") {
    return { valid: false, error: "Invalid block: expected an object" };
  }

  if (depth > IMPORT_LIMITS.maxBlockDepth) {
    return { valid: false, error: "Invalid block: nesting depth exceeds allowed limit" };
  }

  state.blockCount += 1;
  if (state.blockCount > IMPORT_LIMITS.maxBlockCount) {
    return { valid: false, error: "Invalid project: too many blocks" };
  }

  const b = block as Record<string, unknown>;

  if (typeof b.id !== "string" || !b.id) {
    return { valid: false, error: "Invalid block: missing or invalid id" };
  }

  if (typeof b.definitionId !== "string" || !b.definitionId) {
    return { valid: false, error: "Invalid block: missing or invalid definitionId" };
  }

  if (typeof b.x !== "number" || typeof b.y !== "number") {
    return { valid: false, error: "Invalid block: x and y must be numbers" };
  }

  if (!b.parameters || typeof b.parameters !== "object") {
    return { valid: false, error: "Invalid block: parameters must be an object" };
  }

  if (!Array.isArray(b.children)) {
    return { valid: false, error: "Invalid block: children must be an array" };
  }

  // Recursively validate children
  for (const child of b.children) {
    const childValidation = validateBlock(child, depth + 1, state);
    if (!childValidation.valid) {
      return childValidation;
    }
  }

  return { valid: true };
}

/**
 * Regenerates IDs for all blocks to avoid conflicts
 */
function regenerateBlockIds(blocks: BlockInstance[]): BlockInstance[] {
  const idMap = new Map<string, string>();

  // First pass: create ID mapping
  function mapIds(blockList: BlockInstance[]) {
    for (const block of blockList) {
      const newId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      idMap.set(block.id, newId);
      if (block.children.length > 0) {
        mapIds(block.children);
      }
    }
  }

  mapIds(blocks);

  // Second pass: apply new IDs and update references
  function updateIds(blockList: BlockInstance[]): BlockInstance[] {
    return blockList.map((block) => ({
      ...block,
      id: idMap.get(block.id) || block.id,
      parentId: block.parentId ? idMap.get(block.parentId) || block.parentId : undefined,
      nextId: block.nextId ? idMap.get(block.nextId) || block.nextId : undefined,
      previousId: block.previousId ? idMap.get(block.previousId) || block.previousId : undefined,
      children: updateIds(block.children),
    }));
  }

  return updateIds(blocks);
}

/**
 * Imports project data from a JSON string
 */
export function importProjectFromString(jsonString: string): ImportResult {
  if (jsonString.length > IMPORT_LIMITS.maxJsonCharacters) {
    return {
      success: false,
      error: "Project data too large to import safely",
    };
  }

  try {
    const data = JSON.parse(jsonString);
    const validation = validateProjectData(data);

    if (!validation.success) {
      return validation;
    }

    // Regenerate block IDs to avoid conflicts
    const projectData = validation.data;

    if (projectData) {
      projectData.blocks = regenerateBlockIds(projectData.blocks);
      return { success: true, data: projectData };
    }

    return { success: false, error: "Invalid project data" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof SyntaxError ? "Invalid JSON format" : "Failed to parse file",
    };
  }
}

/**
 * Reads a file and returns its contents as a string
 */
export function readFileAsString(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Imports a project from a file
 */
export async function importProjectFromFile(file: File): Promise<ImportResult> {
  if (file.size > IMPORT_LIMITS.maxFileBytes) {
    return {
      success: false,
      error: "File too large. Maximum allowed size is 1MB.",
    };
  }

  try {
    const content = await readFileAsString(file);
    return importProjectFromString(content);
  } catch (_error) {
    return {
      success: false,
      error: "Failed to read file",
    };
  }
}

function getCryptoApi(): Crypto | null {
  return typeof globalThis !== "undefined" && "crypto" in globalThis ? globalThis.crypto : null;
}

function toBase64(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function decodeLegacyShareCode(code: string): string {
  return decodeURIComponent(atob(code));
}

function parseSignedEnvelope(decoded: string): SignedShareCodeEnvelope | null {
  try {
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    if (
      parsed.v === SHARE_SECURITY.version &&
      parsed.kdf === "PBKDF2" &&
      parsed.hash === "SHA-256" &&
      typeof parsed.iterations === "number" &&
      typeof parsed.salt === "string" &&
      typeof parsed.payload === "string" &&
      typeof parsed.sig === "string"
    ) {
      return parsed as SignedShareCodeEnvelope;
    }
    return null;
  } catch {
    return null;
  }
}

async function deriveHmacKey(
  passphrase: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> {
  const cryptoApi = getCryptoApi();
  if (!cryptoApi?.subtle) {
    throw new Error("Secure share codes are not supported in this browser");
  }

  const keyMaterial = await cryptoApi.subtle.importKey(
    "raw",
    encodeUtf8(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return cryptoApi.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    false,
    ["sign", "verify"]
  );
}

/**
 * Generates a signed share code for project data.
 */
export async function generateShareableCode(
  blocks: BlockInstance[],
  options: ExportOptions = {},
  passphrase: string
): Promise<string> {
  const normalizedPassphrase = passphrase.trim();
  if (normalizedPassphrase.length < SHARE_SECURITY.minPassphraseLength) {
    throw new Error(`Passphrase must be at least ${SHARE_SECURITY.minPassphraseLength} characters`);
  }

  const cryptoApi = getCryptoApi();
  if (!cryptoApi?.subtle) {
    throw new Error("Secure share codes are not supported in this browser");
  }

  const projectData = createProjectData(blocks, options);
  const jsonString = JSON.stringify(projectData);
  const payload = btoa(encodeURIComponent(jsonString));

  const salt = cryptoApi.getRandomValues(new Uint8Array(16));
  const key = await deriveHmacKey(
    normalizedPassphrase,
    salt,
    SHARE_SECURITY.pbkdf2Iterations
  );

  const signature = await cryptoApi.subtle.sign("HMAC", key, encodeUtf8(payload));
  const envelope: SignedShareCodeEnvelope = {
    v: SHARE_SECURITY.version,
    kdf: "PBKDF2",
    hash: "SHA-256",
    iterations: SHARE_SECURITY.pbkdf2Iterations,
    salt: toBase64(salt),
    payload,
    sig: toBase64(signature),
  };

  return btoa(encodeURIComponent(JSON.stringify(envelope)));
}

/**
 * Imports project from a shareable code
 */
export async function importFromShareableCode(
  code: string,
  passphrase = ""
): Promise<ImportResult> {
  if (code.length > IMPORT_LIMITS.maxShareCodeCharacters) {
    return {
      success: false,
      error: "Share code too large to import safely",
    };
  }

  try {
    const decodedCode = decodeURIComponent(atob(code));
    const signedEnvelope = parseSignedEnvelope(decodedCode);

    if (!signedEnvelope) {
      const jsonString = decodeLegacyShareCode(code);
      return importProjectFromString(jsonString);
    }

    const normalizedPassphrase = passphrase.trim();
    if (!normalizedPassphrase) {
      return { success: false, error: "Passphrase is required for this share code" };
    }

    const cryptoApi = getCryptoApi();
    if (!cryptoApi?.subtle) {
      return { success: false, error: "Secure share code verification is unavailable" };
    }

    const key = await deriveHmacKey(
      normalizedPassphrase,
      fromBase64(signedEnvelope.salt),
      signedEnvelope.iterations
    );

    const isValid = await cryptoApi.subtle.verify(
      "HMAC",
      key,
      fromBase64(signedEnvelope.sig),
      encodeUtf8(signedEnvelope.payload)
    );

    if (!isValid) {
      return { success: false, error: "Invalid passphrase or tampered share code" };
    }

    const jsonString = decodeURIComponent(atob(signedEnvelope.payload));
    return importProjectFromString(jsonString);
  } catch {
    return { success: false, error: "Invalid share code" };
  }
}
