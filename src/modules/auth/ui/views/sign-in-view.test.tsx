/**
 * Tests for SignInView
 * Testing Library: React Testing Library (with Jest/Vitest)
 * Focus: happy paths, validation errors, and failure conditions around authClient callbacks
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// We import the component under test; if located elsewhere, adjust path.
import { SignInView } from "./sign-in-view";

// Mocks for Next.js router and auth client
jest.mock("next/navigation", () => {
  return {
    useRouter: () => ({
      push: jest.fn(),
    }),
  };
});

jest.mock("@/lib/auth-client", () => {
  return {
    authClient: {
      signIn: {
        email: jest.fn(),
      },
    },
  };
});

describe("SignInView", () => {
  test("renders headings and form fields", () => {
    render(<SignInView />);
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  test("validation errors: invalid email and empty password", async () => {
    const user = userEvent.setup();
    render(<SignInView />);

    // Enter invalid email and empty password
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.clear(screen.getByLabelText(/password/i)); // ensure empty
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Expect validation messages (react-hook-form + zod)
    // Common messages: "Invalid email" for email, and "Password is required" for password
    // If the project has translated/custom messages, adjust matchers accordingly.
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  test("successful sign-in calls router.push('/')", async () => {
    const user = userEvent.setup();
    const { authClient } = require("@/lib/auth-client");
    const { useRouter } = require("next/navigation");
    const router = useRouter();

    // Mock auth to synchronously invoke onSuccess
    authClient.signIn.email.mockImplementation((_creds, opts) => {
      opts?.onSuccess?.();
    });

    render(<SignInView />);

    await user.type(screen.getByLabelText(/email/i), "jane.doe@example.com");
    await user.type(screen.getByLabelText(/password/i), "supersecret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith("/");
    });
  });

  test("error during sign-in shows alert with error message", async () => {
    const user = userEvent.setup();
    const { authClient } = require("@/lib/auth-client");

    // Mock auth to invoke onError with a message
    authClient.signIn.email.mockImplementation((_creds, opts) => {
      opts?.onError?.({ error: new Error("Invalid credentials") });
    });

    render(<SignInView />);

    await user.type(screen.getByLabelText(/email/i), "john.doe@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test("submit button is not disabled initially", () => {
    render(<SignInView />);
    const submit = screen.getByRole("button", { name: /sign in/i });
    expect(submit).not.toBeDisabled();
  });

  test("authClient.signIn.email payload includes email and password", async () => {
    const user = userEvent.setup();
    const { authClient } = require("@/lib/auth-client");
    authClient.signIn.email.mockImplementation(jest.fn()); // no callbacks

    render(<SignInView />);

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledTimes(1);
    });

    const callArgs = authClient.signIn.email.mock.calls[0];
    expect(callArgs[0]).toEqual({
      email: "alice@example.com",
      password: "password123",
    });
    // callArgs[1] should include onSuccess and onError handlers
    expect(typeof callArgs[1]?.onSuccess).toBe("function");
    expect(typeof callArgs[1]?.onError).toBe("function");
  });
});