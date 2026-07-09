import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { VerifyOtpPage } from '../pages/VerifyOtpPage';

const mockLogin = vi.fn();
let mockIsAuthenticated = false;

vi.mock('@/common/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    isLoading: false,
    login: mockLogin,
    logout: vi.fn(),
    user: null,
  }),
}));

const mockAuthApiLogin = vi.fn();
const mockAuthApiRegister = vi.fn();
const mockAuthApiSendOtp = vi.fn();
const mockAuthApiVerifyOtp = vi.fn();

vi.mock('@/common/auth/auth.api', () => ({
  authApi: {
    login: (...args: any[]) => mockAuthApiLogin(...args),
    register: (...args: any[]) => mockAuthApiRegister(...args),
    sendOtp: (...args: any[]) => mockAuthApiSendOtp(...args),
    verifyOtp: (...args: any[]) => mockAuthApiVerifyOtp(...args),
  },
}));

vi.mock('@/common/notifications/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Frontend Authentication Pages & Flows (TDD & Verification)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
  });

  it('renders LoginPage and handles login submission cleanly', async () => {
    mockAuthApiLogin.mockResolvedValueOnce({
      accessToken: 'jwt.mock.token',
      expiresIn: 3600,
      user: { id: 'usr-1', email: 'test@enterprise.com', fullName: 'Test User', role: 'USER' },
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<div data-testid="app-dashboard">Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('name@enterprise.com'), {
      target: { value: 'test@enterprise.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Sign In to Enterprise'));

    await waitFor(() => {
      expect(mockAuthApiLogin).toHaveBeenCalledWith({
        email: 'test@enterprise.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith('jwt.mock.token', {
        id: 'usr-1',
        email: 'test@enterprise.com',
        fullName: 'Test User',
        role: 'USER',
      });
    });
  });

  it('redirects away from LoginPage if user is already authenticated', () => {
    mockIsAuthenticated = true;

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<div data-testid="app-dashboard">Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('app-dashboard')).toBeInTheDocument();
  });

  it('renders RegisterPage and allows role selection & submission', async () => {
    mockAuthApiRegister.mockResolvedValueOnce({
      accessToken: 'jwt.mock.token.reg',
      expiresIn: 3600,
      user: { id: 'usr-2', email: 'collector@enterprise.com', fullName: 'Logistics Pro', role: 'COLLECTOR' },
    });

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/collector" element={<div data-testid="collector-ws">Collector Workspace</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Logistics Collector'));
    fireEvent.change(screen.getByPlaceholderText('Alex Morgan'), {
      target: { value: 'Logistics Pro' },
    });
    fireEvent.change(screen.getByPlaceholderText('alex.morgan@enterprise.com'), {
      target: { value: 'collector@enterprise.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), {
      target: { value: 'strongpass123' },
    });

    fireEvent.click(screen.getByText('Register & Claim +500 Points'));

    await waitFor(() => {
      expect(mockAuthApiRegister).toHaveBeenCalledWith({
        fullName: 'Logistics Pro',
        email: 'collector@enterprise.com',
        phone: undefined,
        role: 'COLLECTOR',
        password: 'strongpass123',
      });
    });
  });

  it('renders ForgotPasswordPage and handles placeholder behavior', async () => {
    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('name@enterprise.com'), {
      target: { value: 'recovery@enterprise.com' },
    });
    fireEvent.click(screen.getByText('Send Recovery Link'));

    await waitFor(() => {
      expect(screen.getByText('Check Your Inbox')).toBeInTheDocument();
    });
  });

  it('renders VerifyOtpPage step 1 and transitions to step 2 on OTP dispatch', async () => {
    mockAuthApiSendOtp.mockResolvedValueOnce({
      success: true,
      message: 'OTP sent successfully',
      devOtp: '123456',
    });

    render(
      <MemoryRouter initialEntries={['/verify-otp']}>
        <Routes>
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('SMS OTP Verification')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('+1 (555) 0101'), {
      target: { value: '+1-555-9999' },
    });
    fireEvent.click(screen.getByText('Send SMS Passcode'));

    await waitFor(() => {
      expect(mockAuthApiSendOtp).toHaveBeenCalledWith({ phone: '+1-555-9999' });
      expect(screen.getByText('Enter Passcode')).toBeInTheDocument();
      expect(screen.getByText('123456')).toBeInTheDocument();
    });
  });
});
