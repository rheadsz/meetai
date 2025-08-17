/**
 * Tests for src/app/(auth)/sign-up/page.tsx
 *
 * Testing library/framework: React Testing Library with Jest/Vitest style assertions.
 * Assumes @testing-library/react and @testing-library/jest-dom (or vitest-dom) are configured globally.
 *
 * We mock "@/modules/auth/ui/views/sign-up-view" to avoid deep rendering concerns
 * and to keep tests focused on the Page component's behavior (logging and rendering).
 */

import React from "react";

// Prefer consistent imports used across the repo:
// - If using Jest: import { render, screen } from "@testing-library/react";
// - If using Vitest: same import path works if configured.
import { render, screen, cleanup } from "@testing-library/react";

// Some codebases set up jest-dom globally; but we import type annotations for clarity.
// If not configured globally, ensure to import "@testing-library/jest-dom" in setup file.

// SUT: the page component under test.
// We attempt to import from the expected app directory path.
// If your page file lives elsewhere, adjust this path accordingly.
import Page from "./page";

// Mock the SignUpView to keep Page tests focused and stable.
// Provide a simple test-id for reliable querying.
jest.mock("@/modules/auth/ui/views/sign-up-view", () => {
  const Mock = () => <div data-testid="sign-up-view">Mocked SignUpView</div>;
  return { SignUpView: Mock };
});

// In case "Card" import paths are referenced by the page, but unused, we don't need to mock it.
// If it causes issues in your environment, uncomment the following:
// jest.mock("@/components/ui/card", () => ({ Card: ({ children }: any) => <div data-testid="card">{children}</div> }));

describe("Sign Up Page", () => {
  const originalConsoleLog = global.console.log;

  beforeEach(() => {
    // Spy on console.log to verify side-effects
    global.console.log = jest.fn();
  });

  afterEach(() => {
    cleanup();
    global.console.log = originalConsoleLog;
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("renders without crashing", () => {
    render(<Page />);
    // Basic sanity: component rendered something
    expect(screen.getByTestId("sign-up-view")).toBeInTheDocument();
  });

  it("renders the SignUpView component", () => {
    render(<Page />);
    const view = screen.getByTestId("sign-up-view");
    expect(view).toBeInTheDocument();
    expect(view).toHaveTextContent("Mocked SignUpView");
  });

  it('logs "Sign Up page" on render', () => {
    render(<Page />);
    expect(global.console.log).toHaveBeenCalledTimes(1);
    expect(global.console.log).toHaveBeenCalledWith("Sign Up page");
  });

  it("is a pure render: does not log multiple times across re-renders unless intentional", () => {
    const { rerender } = render(<Page />);
    expect(global.console.log).toHaveBeenCalledTimes(1);

    rerender(<Page />);
    // This assertion expects the log to be called on each render because the console.log
    // is in the component body. If your intention is to log only once, you should move the
    // console.log into a useEffect with an empty dependency array. Adjust test accordingly if changed.
    expect(global.console.log).toHaveBeenCalledTimes(2);
  });

  it("matches a stable structure via presence checks (avoids brittle full snapshots)", () => {
    render(<Page />);
    // Check for key markers
    expect(screen.getByTestId("sign-up-view")).toBeVisible();
  });
});