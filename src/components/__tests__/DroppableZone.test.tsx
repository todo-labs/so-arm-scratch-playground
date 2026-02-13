import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DroppableZone } from "../DroppableZone";

// Mock the cn utility function
vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.join(" "),
}));

// Mock the useDroppable hook from @dnd-kit/core
vi.mock("@dnd-kit/core", () => ({
  useDroppable: vi.fn(),
}));

import { useDroppable } from "@dnd-kit/core";

describe("DroppableZone Component", () => {
  describe("Rendering", () => {
    it("should render without crashing", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(<DroppableZone id="test-zone" />);

      expect(screen.getByText("Drop blocks here")).toBeTruthy();
    });

    it("should render children when provided", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(
        <DroppableZone id="test-zone">
          <div>Child content</div>
        </DroppableZone>
      );

      expect(screen.getByText("Child content")).toBeTruthy();
    });

    it("should not render placeholder when children present", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(
        <DroppableZone id="test-zone">
          <div>Child content</div>
        </DroppableZone>
      );

      expect(screen.queryByText("Drop blocks here")).toBeNull();
    });

    it("should apply ref to container", () => {
      const setNodeRef = vi.fn();
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef,
        active: null,
      });

      const { container } = render(<DroppableZone id="test-zone" />);

      expect(setNodeRef).toHaveBeenCalled();
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Placeholder", () => {
    it("should show default placeholder text", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(<DroppableZone id="test-zone" />);

      expect(screen.getByText("Drop blocks here")).toBeTruthy();
    });

    it("should show custom placeholder text", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(<DroppableZone id="test-zone" placeholder="Custom placeholder" />);

      expect(screen.getByText("Custom placeholder")).toBeTruthy();
    });

    it("should show package emoji in placeholder", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(<DroppableZone id="test-zone" />);

      expect(screen.getByText("📦")).toBeTruthy();
    });

    it("should center placeholder content", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(<DroppableZone id="test-zone" />);

      const textElement = screen.getByText("Drop blocks here");
      const flexContainer = textElement.closest('div[class*="flex"]');
      expect(flexContainer).toBeTruthy();
    });
  });

  describe("Drop Functionality", () => {
    it("should call useDroppable with correct id", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(<DroppableZone id="my-droppable-zone" />);

      expect(useDroppable).toHaveBeenCalledWith({ id: "my-droppable-zone" });
    });

    it("should pass active state from useDroppable", () => {
      const mockActive = { id: "dragging-item" };
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: mockActive,
      });

      render(<DroppableZone id="test-zone" />);

      expect(useDroppable).toHaveBeenCalledWith({ id: "test-zone" });
    });

    it("should show active state styling when item is being dragged", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: { id: "dragging" },
      });

      const { container } = render(<DroppableZone id="test-zone" />);

      const element = container.firstChild as HTMLElement;
      // Should have border-slate-400 and bg-slate-100 classes
      expect(element.className).toContain("border-slate-400");
      expect(element.className).toContain("bg-slate-100");
    });
  });

  describe("Hover States", () => {
    it("should apply hover styles when isOver is true", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: true,
        setNodeRef: vi.fn(),
        active: null,
      });

      const { container } = render(<DroppableZone id="test-zone" />);

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain("border-blue-400");
      expect(element.className).toContain("bg-blue-50");
      expect(element.className).toContain("scale-[1.02]");
      expect(element.className).toContain("shadow-lg");
    });

    it("should show glow effect when isOver is true", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: true,
        setNodeRef: vi.fn(),
        active: null,
      });

      const { container } = render(<DroppableZone id="test-zone" />);

      const glowDiv = container.querySelector(".absolute.inset-0");
      expect(glowDiv).toBeTruthy();
    });

    it("should not show glow effect when isOver is false", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(<DroppableZone id="test-zone" />);

      // Glow effect should not be present
      const glowDiv = screen
        .getByText("📦")
        .closest("div")
        ?.parentElement?.querySelector(".absolute.inset-0");
      expect(glowDiv).toBeFalsy();
    });

    it("should apply default styles when not over and not active", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      const { container } = render(<DroppableZone id="test-zone" />);

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain("border-slate-300");
      expect(element.className).toContain("bg-slate-50/50");
    });
  });

  describe("Styling", () => {
    it("should apply border-2 border-dashed", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      const { container } = render(<DroppableZone id="test-zone" />);

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain("border-2");
      expect(element.className).toContain("border-dashed");
    });

    it("should apply rounded-xl", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      const { container } = render(<DroppableZone id="test-zone" />);

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain("rounded-xl");
    });

    it("should apply transition-all duration-200", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      const { container } = render(<DroppableZone id="test-zone" />);

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain("transition-all");
      expect(element.className).toContain("duration-200");
    });

    it("should apply min-h-[80px]", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      const { container } = render(<DroppableZone id="test-zone" />);

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain("min-h-[80px]");
    });

    it("should merge custom className", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      const { container } = render(
        <DroppableZone id="test-zone" className="custom-class extra-class" />
      );

      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain("custom-class");
      expect(outerDiv.className).toContain("extra-class");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string placeholder", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(<DroppableZone id="test-zone" placeholder="" />);

      // Should render without text but with placeholder structure
      expect(screen.queryByText("Drop blocks here")).toBeNull();
    });

    it("should render multiple children", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(
        <DroppableZone id="test-zone">
          <span>Child 1</span>
          <span>Child 2</span>
          <span>Child 3</span>
        </DroppableZone>
      );

      expect(screen.getByText("Child 1")).toBeTruthy();
      expect(screen.getByText("Child 2")).toBeTruthy();
      expect(screen.getByText("Child 3")).toBeTruthy();
    });

    it("should render null children without crash", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(
        <DroppableZone id="test-zone">
          {null}
          <span>Real child</span>
        </DroppableZone>
      );

      expect(screen.getByText("Real child")).toBeTruthy();
    });

    it("should render with unique id", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(<DroppableZone id="unique-zone-123" />);

      expect(useDroppable).toHaveBeenCalledWith({ id: "unique-zone-123" });
    });

    it("should handle undefined children gracefully", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      render(
        <DroppableZone id="test-zone">{undefined as unknown as React.ReactNode}</DroppableZone>
      );

      expect(screen.getByText("Drop blocks here")).toBeTruthy();
    });

    it("should handle empty array children", () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: false,
        setNodeRef: vi.fn(),
        active: null,
      });

      // Empty array is truthy in JS, so it will be rendered (nothing shown)
      const { container } = render(<DroppableZone id="test-zone">{[]}</DroppableZone>);

      // Empty array children means nothing rendered (no placeholder, no children)
      expect(container.textContent).toBe("");
    });

    it("should prioritize isOver over active state", () => {
      // When isOver is true, hover styles should take precedence
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isOver: true,
        setNodeRef: vi.fn(),
        active: { id: "active" },
      });

      const { container } = render(<DroppableZone id="test-zone" />);

      const element = container.firstChild as HTMLElement;
      // Should have isOver styles, not active-only styles
      expect(element.className).toContain("border-blue-400");
      expect(element.className).toContain("bg-blue-50");
    });
  });
});
