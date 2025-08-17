/**
 * Tests for SignUpView component
 *
 * Testing library and framework used:
 * - React Testing Library (@testing-library/react)
 * - @testing-library/user-event for user interactions
 * - Jest for mocking and assertions (can be adapted to Vitest with minor changes)
 *
 * Notes:
 * - The repository currently shows no configured test framework. These tests assume Jest + RTL.
 * - You may need to set up Jest and add @testing-library/react and @testing-library/jest-dom.
 * - To resolve the "@/..." path aliases in Jest, add a moduleNameMapper (e.g., '^@/(.*)$': '<rootDir>/src/$1').
 * - We mock next/navigation and the auth client to control navigation and outcomes.
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation useRouter
jest.mock("next/navigation", () => {
  const push = jest.fn();
  return {
    __esModule: true,
    useRouter: () => ({ push }),
  };
});

// Mock the auth client with a virtual module to avoid path alias resolution issues in test envs without config
jest.mock("@/lib/auth-client", () => {
  return {
    __esModule: true,
    authClient: {
      signUp: {
        email: jest.fn(),
      },
    },
  };
}, { virtual: true });

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Import the component under test
import { SignUpView } from "./sign-up-view";

describe("SignUpView", () => {
  const setup = () => {
    const utils = render(<SignUpView />);
    const nameInput = screen.getByPlaceholderText(/john doe/i) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(/m@example\.com/i) as HTMLInputElement;
    // Two inputs share the same placeholder "******"
    const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText("******") as HTMLInputElement[];
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    return {
      ...utils,
      nameInput,
      emailInput,
      passwordInput,
      confirmPasswordInput,
      submitButton,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders key UI elements", () => {
    const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = setup();

    // Inputs present
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();

    // Primary CTA
    expect(submitButton).toBeInTheDocument();

    // Social buttons
    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /github/i })).toBeInTheDocument();

    // Link to sign-in page
    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toHaveAttribute("href", "/sign-in");
  });

  it("initially shows no validation messages and inputs are empty", () => {
    const { nameInput, emailInput, passwordInput, confirmPasswordInput } = setup();

    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();

    expect(nameInput.value).toBe("");
    expect(emailInput.value).toBe("");
    expect(passwordInput.value).toBe("");
    expect(confirmPasswordInput.value).toBe("");
  });

  it("shows validation errors when submitting empty form", async () => {
    const { submitButton } = setup();
    await userEvent.click(submitButton);

    // Specific messages per schema
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    // "Password is required" may appear for both password and confirm password
    const pwdMsgs = await screen.findAllByText(/password is required/i);
    expect(pwdMsgs.length).toBeGreaterThanOrEqual(1);
  });

  it("validates email format", async () => {
    const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = setup();

    await userEvent.type(nameInput, "John Doe");
    await userEvent.type(emailInput, "not-an-email");
    await userEvent.type(passwordInput, "secret");
    await userEvent.type(confirmPasswordInput, "secret");

    await userEvent.click(submitButton);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it("validates matching passwords", async () => {
    const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = setup();

    await userEvent.type(nameInput, "Jane Smith");
    await userEvent.type(emailInput, "jane@example.com");
    await userEvent.type(passwordInput, "secret-1");
    await userEvent.type(confirmPasswordInput, "secret-2");

    await userEvent.click(submitButton);

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("does not call authClient when validation fails", async () => {
    const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = setup();
    const mockedEmail = authClient.signUp.email as jest.Mock;

    await userEvent.type(nameInput, "Invalid Email");
    await userEvent.type(emailInput, "invalid-email");
    await userEvent.type(passwordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");

    await userEvent.click(submitButton);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(mockedEmail).not.toHaveBeenCalled();
  });

  it("submits valid form and calls authClient.signUp.email with correct payload, then navigates", async () => {
    const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = setup();
    const mockedEmail = authClient.signUp.email as jest.Mock;

    // On success, invoke onSuccess callback to simulate successful signup
    mockedEmail.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.();
    });

    await userEvent.type(nameInput, "Harry Potter");
    await userEvent.type(emailInput, "harry@hogwarts.edu");
    await userEvent.type(passwordInput, "quidditch");
    await userEvent.type(confirmPasswordInput, "quidditch");

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedEmail).toHaveBeenCalledTimes(1);
    });

    expect(mockedEmail).toHaveBeenCalledWith(
      {
        name: "Harry Potter",
        email: "harry@hogwarts.edu",
        password: "quidditch",
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );

    const { push } = useRouter() as unknown as { push: jest.Mock };
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/");
    });
  });

  it("renders an error alert when authClient returns an error via onError", async () => {
    const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = setup();
    const mockedEmail = authClient.signUp.email as jest.Mock;

    mockedEmail.mockImplementation((_payload, opts) => {
      opts?.onError?.({ error: new Error("Email already in use") });
    });

    await userEvent.type(nameInput, "Existing User");
    await userEvent.type(emailInput, "existing@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");

    await userEvent.click(submitButton);

    // Not all custom Alerts set role="alert"; assert by text
    const errTitle = await screen.findByText(/email already in use/i);
    expect(errTitle).toBeInTheDocument();
  });

  it("submits with Enter key", async () => {
    const { nameInput, emailInput, passwordInput, confirmPasswordInput } = setup();
    const mockedEmail = authClient.signUp.email as jest.Mock;

    mockedEmail.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.();
    });

    await userEvent.type(nameInput, "Key Submitter");
    await userEvent.type(emailInput, "key@example.com");
    await userEvent.type(passwordInput, "pass1234");
    await userEvent.type(confirmPasswordInput, "pass1234");

    // Press Enter on the last field
    confirmPasswordInput.focus();
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockedEmail).toHaveBeenCalledTimes(1);
    });
  });

  it("renders headings and static text", () => {
    render(<SignUpView />);
    expect(screen.getByRole("heading", { name: /let's get started/i })).toBeInTheDocument();
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    expect(screen.getByText(/by clicking continue/i)).toBeInTheDocument();
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
  });
});