import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlockInstance } from "@/lib/types";
import {
  createProjectData,
  exportProject,
  generateRandomProjectName,
  generateShareableCode,
  importFromShareableCode,
  importProjectFromFile,
  importProjectFromString,
  PROJECT_VERSION,
  readFileAsString,
} from "../projectIO";

function createBlockInstance(
  id: string,
  definitionId: string,
  parameters: Record<string, boolean | number | string> = {},
  children: BlockInstance[] = []
): BlockInstance {
  return {
    id,
    definitionId,
    x: Math.floor(Math.random() * 1000),
    y: Math.floor(Math.random() * 500),
    parameters,
    children,
    isSnapped: children.length > 0,
  };
}

describe("projectIO", () => {
  describe("Constants", () => {
    it("should export correct PROJECT_VERSION", () => {
      expect(PROJECT_VERSION).toBe("1.0.0");
    });
  });

  describe("generateRandomProjectName", () => {
    it("should generate a name with 3 words separated by hyphens", () => {
      const name = generateRandomProjectName();
      const words = name.split("-");

      expect(words).toHaveLength(3);
    });

    it("should only contain lowercase words from WORD_LIST", () => {
      const name = generateRandomProjectName();
      const words = name.split("-");

      words.forEach((word) => {
        expect(word).toMatch(/^[a-z]+$/);
      });
    });

    it("should generate different names on multiple calls", () => {
      const names = new Set<string>();

      for (let i = 0; i < 100; i++) {
        names.add(generateRandomProjectName());
      }

      // With 100 calls, we expect mostly unique names (statistically very likely)
      expect(names.size).toBeGreaterThan(90);
    });
  });

  describe("createProjectData", () => {
    it("should create project data with empty blocks array", () => {
      const blocks: BlockInstance[] = [];
      const result = createProjectData(blocks);

      expect(result.metadata.version).toBe(PROJECT_VERSION);
      expect(result.metadata.name).toBeTruthy();
      expect(result.metadata.description).toBe("");
      expect(result.metadata.author).toBe("");
      expect(result.blocks).toHaveLength(0);
    });

    it("should create project data with single block", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "move_to", { joint: 1, degrees: 90 }),
      ];
      const result = createProjectData(blocks, {
        name: "Test Project",
        description: "A test project",
        author: "Test Author",
      });

      expect(result.metadata.name).toBe("Test Project");
      expect(result.metadata.description).toBe("A test project");
      expect(result.metadata.author).toBe("Test Author");
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].id).toBe("block-1");
      expect(result.blocks[0].definitionId).toBe("move_to");
    });

    it("should preserve block structure including nested children", () => {
      const childBlock = createBlockInstance("child-1", "wait_seconds", { seconds: 1 });
      const parentBlock = createBlockInstance("parent-1", "repeat", { times: 3 }, [childBlock]);

      const result = createProjectData([parentBlock]);

      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].children).toHaveLength(1);
      expect(result.blocks[0].children[0].definitionId).toBe("wait_seconds");
    });

    it("should use random name when options.name is not provided", () => {
      const blocks: BlockInstance[] = [];
      const result = createProjectData(blocks);

      expect(result.metadata.name).toBeTruthy();
      expect(result.metadata.name).toMatch(/^[a-z]+-[a-z]+-[a-z]+$/);
    });

    it("should set createdAt and updatedAt to current timestamp", () => {
      const blocks: BlockInstance[] = [];
      const before = new Date().toISOString();
      const result = createProjectData(blocks);
      const after = new Date().toISOString();

      expect(result.metadata.createdAt >= before).toBe(true);
      expect(result.metadata.createdAt <= after).toBe(true);
      expect(result.metadata.updatedAt >= before).toBe(true);
      expect(result.metadata.updatedAt <= after).toBe(true);
    });

    it("should sanitize block data for export", () => {
      const block = createBlockInstance("block-1", "move_to", { joint: 1, degrees: 90 });

      const result = createProjectData([block]);

      expect(result.blocks[0]).not.toHaveProperty("extraProperty");
    });
  });

  describe("importProjectFromString", () => {
    it("should import valid project JSON", () => {
      const blocks: BlockInstance[] = [createBlockInstance("1", "move_to", { joint: 1 })];
      const projectData = createProjectData(blocks, { name: "Test Project" });
      const jsonString = JSON.stringify(projectData);

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.metadata.name).toBe("Test Project");
      expect(result.error).toBeUndefined();
    });

    it("should regenerate block IDs on import", () => {
      const blocks: BlockInstance[] = [createBlockInstance("original-id", "move_to", {})];
      const projectData = createProjectData(blocks);
      const jsonString = JSON.stringify(projectData);

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(true);
      expect(result.data?.blocks[0].id).not.toBe("original-id");
    });

    it("should fail on invalid JSON", () => {
      const result = importProjectFromString("not valid json");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid JSON format");
      expect(result.data).toBeUndefined();
    });

    it("should fail on empty string", () => {
      const result = importProjectFromString("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid JSON format");
    });

    it("should fail on null input", () => {
      const result = importProjectFromString("null");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid file format: expected an object");
    });

    it("should fail when metadata is missing", () => {
      const jsonString = JSON.stringify({ blocks: [] });

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid file format: missing metadata");
    });

    it("should fail when version is missing", () => {
      const jsonString = JSON.stringify({ metadata: { name: "Test" }, blocks: [] });

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid file format: missing version");
    });

    it("should fail when blocks is not an array", () => {
      const jsonString = JSON.stringify({
        metadata: { version: PROJECT_VERSION, name: "Test", createdAt: "", updatedAt: "" },
        blocks: {},
      });

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid file format: blocks should be an array");
    });

    it("should fail when block has missing id", () => {
      const jsonString = JSON.stringify({
        metadata: { version: PROJECT_VERSION, name: "Test", createdAt: "", updatedAt: "" },
        blocks: [{ definitionId: "move_to", x: 0, y: 0, parameters: {}, children: [] }],
      });

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid block: missing or invalid id");
    });

    it("should fail when block has missing definitionId", () => {
      const jsonString = JSON.stringify({
        metadata: { version: PROJECT_VERSION, name: "Test", createdAt: "", updatedAt: "" },
        blocks: [{ id: "block-1", x: 0, y: 0, parameters: {}, children: [] }],
      });

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid block: missing or invalid definitionId");
    });

    it("should fail when block has invalid coordinates", () => {
      const jsonString = JSON.stringify({
        metadata: { version: PROJECT_VERSION, name: "Test", createdAt: "", updatedAt: "" },
        blocks: [
          { id: "block-1", definitionId: "move_to", x: "0", y: 0, parameters: {}, children: [] },
        ],
      });

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid block: x and y must be numbers");
    });

    it("should fail when block has invalid parameters", () => {
      const jsonString = JSON.stringify({
        metadata: { version: PROJECT_VERSION, name: "Test", createdAt: "", updatedAt: "" },
        blocks: [
          {
            id: "block-1",
            definitionId: "move_to",
            x: 0,
            y: 0,
            parameters: "invalid",
            children: [],
          },
        ],
      });

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid block: parameters must be an object");
    });

    it("should fail when block has invalid children array", () => {
      const jsonString = JSON.stringify({
        metadata: { version: PROJECT_VERSION, name: "Test", createdAt: "", updatedAt: "" },
        blocks: [
          { id: "block-1", definitionId: "repeat", x: 0, y: 0, parameters: {}, children: {} },
        ],
      });

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid block: children must be an array");
    });

    it("should recursively validate nested children", () => {
      const jsonString = JSON.stringify({
        metadata: { version: PROJECT_VERSION, name: "Test", createdAt: "", updatedAt: "" },
        blocks: [
          {
            id: "parent-1",
            definitionId: "repeat",
            x: 0,
            y: 0,
            parameters: {},
            children: [
              {
                id: "child-1",
                definitionId: "wait_seconds",
                x: 0,
                y: 0,
                parameters: {},
                children: [],
              },
              {
                id: "child-2",
                definitionId: "move_to",
                x: 0,
                y: 0,
                parameters: "bad",
                children: [],
              },
            ],
          },
        ],
      });

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid block: parameters must be an object");
    });

    it("should handle nested children with valid structure", () => {
      const childBlock = createBlockInstance("child-1", "wait_seconds", { seconds: 1 });
      const parentBlock = createBlockInstance("parent-1", "repeat", { times: 3 }, [childBlock]);
      const projectData = createProjectData([parentBlock]);
      const jsonString = JSON.stringify(projectData);

      const result = importProjectFromString(jsonString);

      expect(result.success).toBe(true);
      expect(result.data?.blocks[0].children).toHaveLength(1);
    });

    it("should fail when project data exceeds safe size", () => {
      const oversizedJson = "a".repeat(1_000_001);
      const result = importProjectFromString(oversizedJson);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Project data too large to import safely");
    });
  });

  describe("readFileAsString", () => {
    it("should read file content as string", async () => {
      const mockFile = new File(["test content"], "test.json", { type: "application/json" });

      const result = await readFileAsString(mockFile);

      expect(result).toBe("test content");
    });

    it("should reject on read error", async () => {
      const mockFile = {
        readAsText: vi.fn(),
      } as unknown as File;

      await expect(readFileAsString(mockFile)).rejects.toThrow();
    });
  });

  describe("importProjectFromFile", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should import valid file", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("1", "move_to", {})];
      const projectData = createProjectData(blocks, { name: "Test Project" });
      const jsonString = JSON.stringify(projectData);
      const mockFile = new File([jsonString], "test.json", { type: "application/json" });

      const result = await importProjectFromFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.data?.metadata.name).toBe("Test Project");
    });

    it("should fail on invalid JSON in file", async () => {
      const mockFile = new File(["invalid json"], "test.json", { type: "application/json" });

      const result = await importProjectFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid JSON format");
    });

    it("should fail when file exceeds size limit", async () => {
      const oversizedContent = "a".repeat(1024 * 1024 + 1);
      const mockFile = new File([oversizedContent], "large.json", { type: "application/json" });

      const result = await importProjectFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe("File too large. Maximum allowed size is 1MB.");
    });
  });

  describe("exportProject", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Mock DOM APIs for file download
      vi.spyOn(document, "createElement").mockImplementation(() => {
        const mockElement = {
          href: "",
          download: "",
          click: vi.fn(),
        };
        return mockElement as unknown as HTMLAnchorElement;
      });
      vi.spyOn(document.body, "appendChild").mockReturnValue({} as unknown as Node);
      vi.spyOn(document.body, "removeChild").mockReturnValue({} as unknown as Node);
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:http://localhost/test");
      vi.spyOn(URL, "revokeObjectURL").mockReturnValue(undefined);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should create and download JSON file", () => {
      const blocks: BlockInstance[] = [createBlockInstance("1", "move_to", { joint: 1 })];

      exportProject(blocks, { name: "Test Project" });

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should sanitize filename", () => {
      const blocks: BlockInstance[] = [];

      exportProject(blocks, { name: "Test Project/With:Special?Chars" });

      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe("generateShareableCode", () => {
    it("should generate signed share code", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("1", "move_to", { joint: 1 })];

      const code = await generateShareableCode(
        blocks,
        { name: "Shareable Project" },
        "correct horse battery"
      );

      expect(code).toBeTruthy();
      expect(typeof code).toBe("string");
    });

    it("should require passphrase minimum length", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("1", "move_to", { joint: 1 })];

      await expect(generateShareableCode(blocks, { name: "Test" }, "short")).rejects.toThrow(
        "Passphrase must be at least 8 characters"
      );
    });
  });

  describe("importFromShareableCode", () => {
    it("should import valid signed shareable code with passphrase", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("1", "move_to", { joint: 1 })];
      const code = await generateShareableCode(
        blocks,
        { name: "Shareable Project" },
        "correct horse battery"
      );

      const result = await importFromShareableCode(code, "correct horse battery");

      expect(result.success).toBe(true);
      expect(result.data?.metadata.name).toBe("Shareable Project");
    });

    it("should fail on invalid passphrase for signed share code", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("1", "move_to", { joint: 1 })];
      const code = await generateShareableCode(blocks, { name: "Shareable Project" }, "right-pass");

      const result = await importFromShareableCode(code, "wrong-pass");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid passphrase or tampered share code");
    });

    it("should require passphrase for signed share code", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("1", "move_to", { joint: 1 })];
      const code = await generateShareableCode(blocks, { name: "Shareable Project" }, "right-pass");

      const result = await importFromShareableCode(code);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Passphrase is required for this share code");
    });

    it("should import valid legacy shareable code", async () => {
      const legacyProject = createProjectData(
        [createBlockInstance("1", "move_to", { joint: 1 })],
        { name: "Legacy Project" }
      );
      const legacyCode = btoa(encodeURIComponent(JSON.stringify(legacyProject)));

      const result = await importFromShareableCode(legacyCode);

      expect(result.success).toBe(true);
      expect(result.data?.metadata.name).toBe("Legacy Project");
    });

    it("should fail on invalid base64", async () => {
      const result = await importFromShareableCode("!!!invalid-base64!!!");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid share code");
    });

    it("should fail on corrupted JSON in legacy code", async () => {
      // Create a valid base64 string but with invalid JSON inside
      const invalidJson = JSON.stringify({ invalid: "data" });
      const code = btoa(encodeURIComponent(invalidJson));

      const result = await importFromShareableCode(code);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid file format: missing metadata");
    });

    it("should fail when share code exceeds size limit", async () => {
      const oversizedCode = "a".repeat(1_500_001);
      const result = await importFromShareableCode(oversizedCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Share code too large to import safely");
    });
  });
});
