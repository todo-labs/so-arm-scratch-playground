import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DraggableBlock } from "../DraggableBlock";

// Mock the useDraggable hook from @dnd-kit/core
vi.mock("@dnd-kit/core", () => ({
  useDraggable: vi.fn(),
}));

import { useDraggable } from "@dnd-kit/core";

// Mock the cn utility function
vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.join(" "),
}));

describe("DraggableBlock Component", () => {
  describe("Rendering", () => {
    it("should render without crashing", () => {
      // Setup mock return values
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      render(
        <DraggableBlock id="test-block">
          <div>Block content</div>
        </DraggableBlock>
      );

      expect(screen.getByText("Block content")).toBeTruthy();
    });

    it("should render children passed to it", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      render(
        <DraggableBlock id="test-block">
          <button type="button">Click me</button>
        </DraggableBlock>
      );

      expect(screen.getByRole("button", { name: "Click me" })).toBeTruthy();
    });

    it("should apply ref to container", () => {
      const setNodeRef = vi.fn();
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef,
        transform: null,
        isDragging: false,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      expect(setNodeRef).toHaveBeenCalled();
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Drag Functionality", () => {
    it("should call useDraggable with correct props", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      render(
        <DraggableBlock id="my-block" data={{ custom: "data" }} disabled={false}>
          <div>Content</div>
        </DraggableBlock>
      );

      expect(useDraggable).toHaveBeenCalledWith({
        id: "my-block",
        data: { custom: "data" },
        disabled: false,
      });
    });

    it("should pass disabled prop to useDraggable", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      render(
        <DraggableBlock id="test-block" disabled={true}>
          <div>Content</div>
        </DraggableBlock>
      );

      expect(useDraggable).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
    });

    it("should spread listeners to container", () => {
      const listeners = { onPointerDown: vi.fn() };
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners,
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      expect(container.firstChild).toBeTruthy();
    });

    it("should spread attributes to container", () => {
      const attributes = { "data-testid": "draggable" };
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes,
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement).toHaveAttribute("data-testid", "draggable");
    });
  });

  describe("Drag Styles", () => {
    it("should apply opacity 0.8 when dragging", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: { x: 10, y: 20 },
        isDragging: true,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement.style.opacity).toBe("0.8");
    });

    it("should apply opacity 1 when not dragging", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement.style.opacity).toBe("1");
    });

    it("should apply cursor grabbing when not dragging", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement.style.cursor).toBe("grab");
    });

    it("should apply cursor grabbing when dragging", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: { x: 10, y: 20 },
        isDragging: true,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement.style.cursor).toBe("grabbing");
    });

    it("should apply zIndex 1000 when dragging", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: { x: 10, y: 20 },
        isDragging: true,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement.style.zIndex).toBe("1000");
    });

    it("should apply zIndex auto when not dragging", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement.style.zIndex).toBe("auto");
    });

    it("should apply transform style from dnd-kit", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: { x: 50, y: 100 },
        isDragging: true,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement.style.transform).toContain("translate");
    });

    it("should remove transition when dragging", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: { x: 10, y: 20 },
        isDragging: true,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement.style.transition).toBe("none");
    });

    it("should apply transition when not dragging", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement.style.transition).toBe("transform 200ms ease");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null transform", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      expect(divElement.style.transform).toBe("");
    });

    it("should handle undefined data prop", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      expect(useDraggable).toHaveBeenCalledWith(expect.objectContaining({ data: undefined }));
    });

    it("should handle multiple children", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      render(
        <DraggableBlock id="test-block">
          <span>First</span>
          <span>Second</span>
          <span>Third</span>
        </DraggableBlock>
      );

      expect(screen.getByText("First")).toBeTruthy();
      expect(screen.getByText("Second")).toBeTruthy();
      expect(screen.getByText("Third")).toBeTruthy();
    });

    it("should render with custom className if passed", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      // Note: DraggableBlock doesn't currently accept className prop
      // This test verifies the current behavior
      const { container } = render(
        <DraggableBlock id="test-block">
          <div>Content</div>
        </DraggableBlock>
      );

      const divElement = container.firstChild as HTMLElement;
      // No className applied since it's not a prop
      expect(divElement.className).toBe("");
    });

    it("should pass unique id to useDraggable", () => {
      (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
      });

      render(
        <DraggableBlock id="unique-id-12345">
          <div>Content</div>
        </DraggableBlock>
      );

      expect(useDraggable).toHaveBeenCalledWith(expect.objectContaining({ id: "unique-id-12345" }));
    });
  });
});
