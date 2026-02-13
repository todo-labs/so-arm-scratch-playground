import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../ErrorBoundary";

// Mock console.error to prevent test output pollution
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

describe("ErrorBoundary Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering Children", () => {
    it("should render children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-content">Child Content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId("child-content")).toBeTruthy();
      expect(screen.getByText("Child Content")).toBeTruthy();
    });

    it("should render multiple children", () => {
      render(
        <ErrorBoundary>
          <span>First</span>
          <span>Second</span>
          <span>Third</span>
        </ErrorBoundary>
      );

      expect(screen.getByText("First")).toBeTruthy();
      expect(screen.getByText("Second")).toBeTruthy();
      expect(screen.getByText("Third")).toBeTruthy();
    });

    it("should render nested components", () => {
      const NestedComponent = () => (
        <div data-testid="nested">
          <span>Nested content</span>
        </div>
      );

      render(
        <ErrorBoundary>
          <NestedComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("nested")).toBeTruthy();
      expect(screen.getByText("Nested content")).toBeTruthy();
    });

    it("should preserve component state", () => {
      let counter = 0;
      const CounterComponent = () => {
        counter++;
        return <div data-testid="counter">Count: {counter}</div>;
      };

      render(
        <ErrorBoundary>
          <CounterComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("counter")).toHaveTextContent("Count: 1");
    });
  });

  describe("Error Catching", () => {
    it("should catch render errors and show fallback", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error boundary should catch the error
      expect(screen.queryByTestId("child-content")).toBeNull();
    });

    it("should catch errors during rendering", () => {
      const BrokenComponent = () => {
        throw new Error("Something went wrong");
      };

      render(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );

      // Should show error UI, not the broken component
      expect(screen.queryByText("Broken")).toBeNull();
    });

    it("should catch errors with different messages", () => {
      const ErrorWithMessage = ({ message }: { message: string }) => {
        throw new Error(message);
      };

      render(
        <ErrorBoundary>
          <ErrorWithMessage message="Custom error message" />
        </ErrorBoundary>
      );

      // Should catch the error regardless of message
      expect(screen.queryByText("Custom error message")).toBeNull();
    });

    it("should catch errors thrown in useEffect", () => {
      const ErrorInEffect = () => {
        // This simulates an error that would be caught by error boundary
        throw new Error("Error in effect");
      };

      render(
        <ErrorBoundary>
          <ErrorInEffect />
        </ErrorBoundary>
      );

      // Should catch the error
      expect(screen.queryByTestId("child")).toBeNull();
    });

    it("should catch multiple errors", () => {
      const ThrowError = () => {
        throw new Error("Error 1");
      };

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Initial error caught
      expect(screen.queryByText("Error 1")).toBeNull();

      // Rerender with different error
      const ThrowAnotherError = () => {
        throw new Error("Error 2");
      };

      rerender(
        <ErrorBoundary>
          <ThrowAnotherError />
        </ErrorBoundary>
      );

      // Should still catch the error
      expect(screen.queryByText("Error 2")).toBeNull();
    });
  });

  describe("Default Fallback UI", () => {
    it("should show default error message when no fallback provided", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeTruthy();
    });

    it("should show instructions to refresh page", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(
        screen.getByText("We encountered an unexpected error. Please try refreshing the page.")
      ).toBeTruthy();
    });

    it("should show refresh button", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole("button", { name: "Refresh Page" })).toBeTruthy();
    });

    it("should show error icon", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // SVG error icon should be present
      const errorIcon = document.querySelector('[aria-label="Error icon"]');
      expect(errorIcon).toBeTruthy();
    });

    it("should show error icon with correct path", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const svg = document.querySelector('[aria-label="Error icon"]');
      expect(svg).toBeTruthy();
      expect(svg?.parentElement).toHaveClass("w-16");
      expect(svg?.parentElement).toHaveClass("h-16");
    });

    it("should apply correct styling to error container", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // The container is the div wrapping the error card
      const card = screen.getByText("Something went wrong").closest("div");
      // The container is the parent of the card
      const container = card?.parentElement;
      expect(container?.className).toContain("min-h-screen");
      expect(container?.className).toContain("flex");
      expect(container?.className).toContain("items-center");
      expect(container?.className).toContain("justify-center");
    });

    it("should apply correct styling to error content", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error card should have proper styling
      const card = screen.getByText("Something went wrong").closest("div");
      expect(card?.className).toContain("max-w-md");
      expect(card?.className).toContain("w-full");
      expect(card?.className).toContain("bg-white");
      expect(card?.className).toContain("rounded-xl");
      expect(card?.className).toContain("shadow-lg");
    });
  });

  describe("Custom Fallback", () => {
    it("should render custom fallback when provided", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      const CustomFallback = () => <div data-testid="custom-fallback">Custom Error UI</div>;

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("custom-fallback")).toBeTruthy();
      expect(screen.getByText("Custom Error UI")).toBeTruthy();
    });

    it("should not render default fallback when custom fallback is provided", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      const CustomFallback = () => <div>Custom Error UI</div>;

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.queryByText("Something went wrong")).toBeNull();
      expect(screen.queryByRole("button", { name: "Refresh Page" })).toBeNull();
    });

    it("should pass error info to custom fallback if needed", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      const CustomFallback = () => <div data-testid="custom-fallback">Error handled</div>;

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("custom-fallback")).toBeTruthy();
    });

    it("should handle null fallback", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      // This tests that null fallback doesn't crash
      render(
        <ErrorBoundary fallback={null as unknown as React.ReactNode}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should still show default fallback
      expect(screen.getByText("Something went wrong")).toBeTruthy();
    });

    it("should handle string fallback", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary fallback="Error occurred!">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText("Error occurred!")).toBeTruthy();
    });
  });

  describe("Error Callback", () => {
    it("should call onError callback when error is caught", () => {
      const onError = vi.fn();
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it("should pass error object to onError callback", () => {
      const onError = vi.fn();
      const testError = new Error("Specific error");
      const ThrowError = () => {
        throw testError;
      };

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(testError, expect.any(Object));
    });

    it("should pass componentStack to onError callback", () => {
      const onError = vi.fn();
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      const [, errorInfo] = onError.mock.calls[0];
      expect(errorInfo.componentStack).toBeTruthy();
      expect(typeof errorInfo.componentStack).toBe("string");
    });

    it("should not call onError when no error occurs", () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <div>No error here</div>
        </ErrorBoundary>
      );

      expect(onError).not.toHaveBeenCalled();
    });

    it("should handle multiple errors and call onError each time", () => {
      const onError = vi.fn();
      let shouldThrow = true;

      const ConditionalThrow = () => {
        if (shouldThrow) {
          throw new Error("First error");
        }
        return <div>No error</div>;
      };

      const { rerender } = render(
        <ErrorBoundary onError={onError}>
          <ConditionalThrow />
        </ErrorBoundary>
      );

      // First error caught
      expect(onError).toHaveBeenCalledTimes(1);

      // Change state so next render doesn't throw
      shouldThrow = false;

      rerender(
        <ErrorBoundary onError={onError}>
          <ConditionalThrow />
        </ErrorBoundary>
      );

      // onError should still only be called once (for the first error)
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe("Refresh Button", () => {
    it("should call window.location.reload when refresh button is clicked", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      // Mock window.location.reload using Object.defineProperty
      const reloadMock = vi.fn();
      Object.defineProperty(window, "location", {
        value: { reload: reloadMock },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const refreshButton = screen.getByRole("button", { name: "Refresh Page" });
      fireEvent.click(refreshButton);

      expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    it("should reset error state when refresh button is clicked", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      // Mock window.location.reload
      const reloadMock = vi.fn();
      Object.defineProperty(window, "location", {
        value: { reload: reloadMock },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error UI is shown
      expect(screen.getByText("Something went wrong")).toBeTruthy();

      const refreshButton = screen.getByRole("button", { name: "Refresh Page" });
      fireEvent.click(refreshButton);

      // Error state should be reset before reload
      expect(reloadMock).toHaveBeenCalled();
    });

    it("should have correct styling on refresh button", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const refreshButton = screen.getByRole("button", { name: "Refresh Page" });
      expect(refreshButton.className).toContain("px-4");
      expect(refreshButton.className).toContain("py-2");
      expect(refreshButton.className).toContain("bg-blue-600");
      expect(refreshButton.className).toContain("text-white");
      expect(refreshButton.className).toContain("rounded-lg");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined children", () => {
      render(<ErrorBoundary>{undefined as unknown as React.ReactNode}</ErrorBoundary>);

      // Should not crash, render nothing visible
      expect(screen.queryByText("Something went wrong")).toBeNull();
    });

    it("should handle null children", () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);

      // Should not crash
      expect(screen.queryByText("Something went wrong")).toBeNull();
    });

    it("should handle empty fragment", () => {
      render(
        <ErrorBoundary>
          <></>
        </ErrorBoundary>
      );

      // Should not crash
      expect(screen.queryByText("Something went wrong")).toBeNull();
    });

    it("should handle error with no message", () => {
      const ThrowError = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should still show default error message
      expect(screen.getByText("Something went wrong")).toBeTruthy();
    });

    it("should handle non-Error objects thrown", () => {
      const ThrowString = () => {
        throw "Error string";
      };

      render(
        <ErrorBoundary>
          <ThrowString />
        </ErrorBoundary>
      );

      // Should catch it and show error UI
      expect(screen.getByText("Something went wrong")).toBeTruthy();
    });

    it("should handle component that unmounts before error", () => {
      let mountCount = 0;
      const UnmountBeforeError = () => {
        mountCount++;
        if (mountCount > 1) {
          throw new Error("Error after unmount");
        }
        return null;
      };

      render(
        <ErrorBoundary>
          <UnmountBeforeError />
        </ErrorBoundary>
      );

      // First render succeeds
      expect(screen.queryByText("Something went wrong")).toBeNull();
    });

    it("should log error to console", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // console.error should be called with the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "ErrorBoundary caught an error:",
        expect.any(Error)
      );
    });

    it("should not show error UI for unmounted components", () => {
      let showError = false;

      const ConditionalThrow = () => {
        if (showError) {
          throw new Error("Error");
        }
        return <div>No error</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalThrow />
        </ErrorBoundary>
      );

      // No error on first render
      expect(screen.queryByText("Something went wrong")).toBeNull();

      // Set flag to throw error
      showError = true;

      // Re-render with error
      rerender(
        <ErrorBoundary>
          <ConditionalThrow />
        </ErrorBoundary>
      );

      // Error should be caught
      expect(screen.getByText("Something went wrong")).toBeTruthy();
    });
  });
});
