# Contributing to SO-ARM Scratch

Thank you for your interest in contributing to SO-ARM Scratch! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd so-arm-scratch
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Start the development server**:
   ```bash
   bun run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Code Style

We use **Biome** for code formatting and linting.

- **Formatting**: `bun run format:write`
- **Linting**: `bun run lint:fix`
- **Both**: `bun run check`

Biome automatically handles:
- Code formatting
- Import organization
- Linting rules
- TypeScript best practices

### Code Style Rules

- Use TypeScript with strict type checking
- Follow the existing code structure and patterns
- Use functional components with hooks
- Prefer `const` over `let`
- Use meaningful variable and function names
- Write clear, self-documenting code

## Testing

We use **Vitest** with **React Testing Library**.

- **Run tests**: `bun run test`
- **Watch mode**: `bun run test --watch`
- **UI mode**: `bun run test:ui`
- **Coverage**: `bun run test:coverage`

### Writing Tests

1. Test files should be named `*.test.ts` or `*.test.tsx`
2. Place tests in `src/test/` or next to the file they test
3. Test files in `src/test/setup.ts` are automatically included in all tests
4. Use `describe`, `it`, and `expect` from Vitest
5. Use `render` and `screen` from `@testing-library/react`

Example test:
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── blocks/      # Programming block components
│   └── ui/         # General UI elements
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Core business logic and utilities
├── data/            # Static data definitions
├── test/            # Test setup and utilities
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

## Adding Features

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines
3. **Add tests** for new functionality
4. **Run tests and linters**:
   ```bash
   bun run lint
   bun run test
   ```
5. **Build the project**:
   ```bash
   bun run build
   ```

## Submitting Changes

1. **Update documentation** if your changes affect user-facing functionality
2. **Add tests** that cover your changes
3. **Ensure all tests pass** and linting is clean
4. **Commit with a clear message** describing what and why
5. **Push to your fork** and open a pull request

### Pull Request Guidelines

- Write a clear description of the changes
- Link related issues
- Include screenshots for UI changes
- Ensure all CI checks pass
- Respond to review feedback promptly

## Architecture Patterns

### State Management
- Use React Context for global state (`RobotContext`, `ScratchContext`)
- Use local state (`useState`) for component-specific state
- Use `useRef` for non-reactive state

### Components
- Prefer functional components over class components
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use composition over inheritance

### Block System
- Define block metadata in `src/lib/types.ts`
- Register blocks in `src/lib/blockRegistry.ts`
- Implement block execution logic in `src/lib/blockExecutor.ts`

## Getting Help

- Check existing code for patterns
- Review the README for project overview
- Ask questions in issues or discussions

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.
