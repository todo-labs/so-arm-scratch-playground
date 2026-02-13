import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GeneratedCode } from "../GeneratedCode";

const mockUseScratch = vi.fn();

vi.mock("@/context/ScratchContext", () => ({
  useScratch: () => mockUseScratch(),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
  }) => (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

describe("GeneratedCode Component", () => {
  const mockHandleCopyCode = vi.fn();
  const mockHandleExportCode = vi.fn();

  const defaultProps = {
    generatedCode: "",
    handleCopyCode: mockHandleCopyCode,
    handleExportCode: mockHandleExportCode,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseScratch.mockReturnValue(defaultProps);
  });

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<GeneratedCode />);
      expect(screen.getByText("Generated Code")).toBeTruthy();
    });

    it("should render Copy button", () => {
      render(<GeneratedCode />);
      expect(screen.getByText("Copy")).toBeTruthy();
    });

    it("should render Export button", () => {
      render(<GeneratedCode />);
      expect(screen.getByText("Export")).toBeTruthy();
    });

    it("should render code display area", () => {
      render(<GeneratedCode />);
      expect(screen.getByTestId("scroll-area")).toBeTruthy();
    });
  });

  describe("Empty State", () => {
    it("should display placeholder text when no code is generated", () => {
      render(<GeneratedCode />);
      expect(screen.getByText(/Generate code from your blocks/i)).toBeTruthy();
    });

    it("should disable Copy button when no code is generated", () => {
      render(<GeneratedCode />);
      const copyButton = screen.getByText("Copy").closest("button");
      expect(copyButton).toBeDisabled();
    });

    it("should disable Export button when no code is generated", () => {
      render(<GeneratedCode />);
      const exportButton = screen.getByText("Export").closest("button");
      expect(exportButton).toBeDisabled();
    });
  });

  describe("Generated Code State", () => {
    const mockCode = "const robot = true;";

    it("should display generated code when available", () => {
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: mockCode,
      });
      render(<GeneratedCode />);
      expect(screen.getByText(mockCode)).toBeTruthy();
    });

    it("should not display placeholder text when code is generated", () => {
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: mockCode,
      });
      render(<GeneratedCode />);
      expect(screen.queryByText(/Generate code from your blocks/i)).toBeNull();
    });

    it("should enable Copy button when code is generated", () => {
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: mockCode,
      });
      render(<GeneratedCode />);
      const copyButton = screen.getByText("Copy").closest("button");
      expect(copyButton).not.toBeDisabled();
    });

    it("should enable Export button when code is generated", () => {
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: mockCode,
      });
      render(<GeneratedCode />);
      const exportButton = screen.getByText("Export").closest("button");
      expect(exportButton).not.toBeDisabled();
    });

    it("should display code in code element", () => {
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: mockCode,
      });
      render(<GeneratedCode />);
      const codeElement = screen.getByRole("code");
      expect(codeElement.textContent).toContain("robot");
    });
  });

  describe("Copy Functionality", () => {
    const mockCode = "test code";

    it("should call handleCopyCode when Copy button is clicked", () => {
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: mockCode,
        handleCopyCode: mockHandleCopyCode,
      });
      render(<GeneratedCode />);
      const copyButton = screen.getByText("Copy").closest("button");
      if (copyButton) {
        fireEvent.click(copyButton);
      }
      expect(mockHandleCopyCode).toHaveBeenCalledTimes(1);
    });

    it("should not call handleCopyCode when Copy button is disabled", () => {
      mockUseScratch.mockReturnValue(defaultProps);
      render(<GeneratedCode />);
      const copyButton = screen.getByText("Copy").closest("button");
      if (copyButton) {
        fireEvent.click(copyButton);
      }
      expect(mockHandleCopyCode).not.toHaveBeenCalled();
    });
  });

  describe("Export Functionality", () => {
    const mockCode = "test code";

    it("should call handleExportCode when Export button is clicked", () => {
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: mockCode,
        handleExportCode: mockHandleExportCode,
      });
      render(<GeneratedCode />);
      const exportButton = screen.getByText("Export").closest("button");
      if (exportButton) {
        fireEvent.click(exportButton);
      }
      expect(mockHandleExportCode).toHaveBeenCalledTimes(1);
    });

    it("should not call handleExportCode when Export button is disabled", () => {
      mockUseScratch.mockReturnValue(defaultProps);
      render(<GeneratedCode />);
      const exportButton = screen.getByText("Export").closest("button");
      if (exportButton) {
        fireEvent.click(exportButton);
      }
      expect(mockHandleExportCode).not.toHaveBeenCalled();
    });
  });

  describe("useScratch Hook Integration", () => {
    it("should call useScratch hook on render", () => {
      render(<GeneratedCode />);
      expect(mockUseScratch).toHaveBeenCalledTimes(1);
    });

    it("should use generatedCode from useScratch", () => {
      const code = "const test = true;";
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: code,
      });
      render(<GeneratedCode />);
      expect(screen.getByText("const test = true;")).toBeTruthy();
    });

    it("should use handleCopyCode from useScratch", () => {
      const customCopyFn = vi.fn();
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: "code",
        handleCopyCode: customCopyFn,
      });
      render(<GeneratedCode />);
      const copyButton = screen.getByText("Copy").closest("button");
      if (copyButton) {
        fireEvent.click(copyButton);
      }
      expect(customCopyFn).toHaveBeenCalled();
    });

    it("should use handleExportCode from useScratch", () => {
      const customExportFn = vi.fn();
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: "code",
        handleExportCode: customExportFn,
      });
      render(<GeneratedCode />);
      const exportButton = screen.getByText("Export").closest("button");
      if (exportButton) {
        fireEvent.click(exportButton);
      }
      expect(customExportFn).toHaveBeenCalled();
    });
  });

  describe("Button States", () => {
    it("should enable both buttons when code is generated", () => {
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: "code",
      });
      render(<GeneratedCode />);
      const copyButton = screen.getByText("Copy").closest("button");
      const exportButton = screen.getByText("Export").closest("button");
      if (copyButton && exportButton) {
        expect(copyButton).not.toBeDisabled();
        expect(exportButton).not.toBeDisabled();
      }
    });

    it("should disable both buttons when code is empty", () => {
      mockUseScratch.mockReturnValue(defaultProps);
      render(<GeneratedCode />);
      const copyButton = screen.getByText("Copy").closest("button");
      const exportButton = screen.getByText("Export").closest("button");
      if (copyButton && exportButton) {
        expect(copyButton).toBeDisabled();
        expect(exportButton).toBeDisabled();
      }
    });
  });

  describe("Multiple Interactions", () => {
    it("should handle multiple interactions correctly", () => {
      mockUseScratch.mockReturnValue({
        ...defaultProps,
        generatedCode: "code",
        handleCopyCode: mockHandleCopyCode,
        handleExportCode: mockHandleExportCode,
      });
      render(<GeneratedCode />);

      const copyButton = screen.getByText("Copy").closest("button");
      const exportButton = screen.getByText("Export").closest("button");

      if (copyButton) {
        fireEvent.click(copyButton);
      }
      if (exportButton) {
        fireEvent.click(exportButton);
      }

      if (copyButton) {
        fireEvent.click(copyButton);
      }
      if (exportButton) {
        fireEvent.click(exportButton);
      }

      expect(mockHandleCopyCode).toHaveBeenCalledTimes(2);
      expect(mockHandleExportCode).toHaveBeenCalledTimes(2);
    });
  });
});
