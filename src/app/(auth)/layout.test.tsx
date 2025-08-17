/**
 * Test framework and libraries:
 * - Using React Testing Library (@testing-library/react) with jest-dom matchers.
 * - Runner: Jest or Vitest, depending on project setup. These tests rely on jest-dom style matchers (toBeInTheDocument, toHaveClass).
 *
 * Purpose:
 * - Validate the Layout component renders its wrapper structure and classes.
 * - Ensure children are rendered faithfully, including multiple children and null.
 * - Provide a snapshot to quickly detect accidental structural changes.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Layout from "./layout";

describe("Layout (auth) component", () => {
  it("renders without crashing and mounts into the document", () => {
    render(
      <Layout>
        <span>content</span>
      </Layout>
    );
    // The child should be present
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders the expected wrapper structure with required classes", () => {
    const { container } = render(
      <Layout>
        <div>child</div>
      </Layout>
    );

    // outer wrapper is the first child element
    const outer = container.firstElementChild as HTMLElement | null;
    expect(outer).toBeInTheDocument();
    expect(outer).toHaveClass(
      "bg-muted",
      "flex",
      "min-h-svh",
      "flex-col",
      "items-center",
      "justify-center",
      "p-6",
      "md:p-10"
    );

    // inner wrapper containing children is the only child of outer
    expect(outer?.children.length).toBe(1);
    const inner = outer?.firstElementChild as HTMLElement | null;
    expect(inner).toBeInTheDocument();
    expect(inner).toHaveClass("w-full", "max-w-sm", "md:max-w-3xl");

    // Verify child content is inside inner
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("renders multiple children without altering their order", () => {
    render(
      <Layout>
        <span data-testid="first">first</span>
        <span data-testid="second">second</span>
        <span data-testid="third">third</span>
      </Layout>
    );

    const first = screen.getByTestId("first");
    const second = screen.getByTestId("second");
    const third = screen.getByTestId("third");

    expect(first).toBeInTheDocument();
    expect(second).toBeInTheDocument();
    expect(third).toBeInTheDocument();

    // DOM order check
    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(second.compareDocumentPosition(third) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("gracefully handles null children", () => {
    const { container } = render(<Layout>{null as unknown as React.ReactNode}</Layout>);
    // Outer should still render
    const outer = container.firstElementChild as HTMLElement | null;
    expect(outer).toBeInTheDocument();

    // Inner wrapper should be present even if children are null
    expect(outer?.firstElementChild).toBeInTheDocument();
    // Inner should have no text content
    expect((outer?.firstElementChild as HTMLElement).textContent).toBe("");
  });

  it("matches snapshot for structural regression detection", () => {
    const { container } = render(
      <Layout>
        <button type="button">Action</button>
      </Layout>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});