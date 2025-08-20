import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SignInView } from '@/modules/auth/ui/views/sign-in-view';
import userEvent from '@testing-library/user-event';
// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the auth client with the correct structure
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: jest.fn().mockImplementation((data, callbacks) => {
        callbacks.onSuccess();
      }),
    },
  },
}));

describe('SignInView', () => {
   // checks if form is rendered 
  it('renders the sign in form', () => {
    render(<SignInView />);
    
    // Check if important elements are rendered
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

//checks what happens after clicking sign in
  it('redirects to home on successful sign in', async()=> {
    render(<SignInView />);

    //fill in the form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    //check if we are redirected to home
    expect(require('next/navigation').useRouter().push).toHaveBeenCalledWith('/');

  });
});
