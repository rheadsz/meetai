/**
 * Tests for src/app/(auth)/sign-in/page.tsx
 *
 * Testing library and framework used: Jest with @testing-library/react and @testing-library/jest-dom
 * Focus: Validate that the page component renders SignInView and logs as expected.
 */

import React from "react";
import { render, screen } from "@testing-library/react";

// Mock SignInView to isolate Page's behavior
jest.mock("@/modules/auth/ui/views/sign-in-view", () => {
  const Mock = () => <div data-testid="sign-in-view-mock">SignInView Mock</div>;
  return { __esModule: true, SignInView: Mock };
});

// Try importing the Page component from a colocated page.tsx
// This assumes the actual page component file is src/app/(auth)/sign-in/page.tsx
// The test file is colocated, so a relative import works.
import Page from "./page";

describe("Sign-In Page (src/app/(auth)/sign-in/page.tsx)", () => {
  const originalLog = console.log;

  beforeEach(() => {
    // Spy on console.log to assert logging behavior without polluting test output
    console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Restore console.log
    console.log = originalLog;
  });

  it("should be defined and be a functional component", () => {
    expect(Page).toBeDefined();
    expect(typeof Page).toBe("function");
  });

  it("renders without crashing", () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  it("logs 'Sign In page' on render", () => {
    render(<Page />);
    expect(console.log).toHaveBeenCalledWith("Sign In page");
  });

  it("renders the SignInView component", () => {
    render(<Page />);
    // Because SignInView is mocked, we expect our mock to be present
    expect(screen.getByTestId("sign-in-view-mock")).toBeInTheDocument();
    expect(screen.getByText("SignInView Mock")).toBeInTheDocument();
  });

  it("renders SignInView exactly once", () => {
    render(<Page />);
    const instances = screen.getAllByTestId("sign-in-view-mock");
    expect(instances).toHaveLength(1);
  });
});