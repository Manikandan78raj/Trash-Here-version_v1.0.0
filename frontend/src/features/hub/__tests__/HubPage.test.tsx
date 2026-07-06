import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HubPage } from '../pages/HubPage';

const mockUpdateProfile = vi.fn();
const mockUploadAvatar = vi.fn();
const mockUpdateSettings = vi.fn();
const mockChangePassword = vi.fn();
const mockUpdateEmail = vi.fn();
const mockRequestGdpr = vi.fn();

vi.mock('../api/hub.api', () => ({
  useProfile: vi.fn(),
  useUpdateProfile: () => ({ mutate: mockUpdateProfile, isPending: false }),
  useUploadAvatar: () => ({ mutate: mockUploadAvatar, isPending: false }),
  useSettings: vi.fn(),
  useUpdateSettings: () => ({ mutate: mockUpdateSettings, isPending: false }),
  useChangePassword: () => ({ mutate: mockChangePassword, isPending: false }),
  useUpdateEmail: () => ({ mutate: mockUpdateEmail, isPending: false }),
  useRequestGdprExport: () => ({ mutate: mockRequestGdpr, isPending: false }),
}));

vi.mock('@/common/theme/useTheme', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

import { useProfile, useSettings } from '../api/hub.api';

describe('HubPage Component & Tabs TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useProfile as any).mockReturnValue({
      data: {
        id: 'usr-123',
        email: 'cto@trashhere.com',
        fullName: 'Manikandan Raj',
        phone: '+15550192',
        bio: 'Enterprise Founder',
        ecoScore: 890,
        carbonSavedKg: 145.2,
        isVerified: true,
        referralCode: 'TRASH-FOUNDER',
        role: { name: 'ENTERPRISE PRO' },
        wallet: { balance: 250.0 },
      },
      isLoading: false,
    });
    (useSettings as any).mockReturnValue({
      data: {
        theme: 'DARK',
        language: 'en',
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        pickupAlerts: true,
        rewardAlerts: true,
        securityAlerts: true,
        marketingAlerts: false,
        profileVisibility: 'PUBLIC',
        locationSharing: true,
        dataCollectionConsent: true,
        sessionTimeoutMinutes: 60,
        twoFactorEnabled: true,
      },
      isLoading: false,
    });
  });

  it('should render HubPage header and default Profile tab correctly', () => {
    render(<HubPage />);
    expect(screen.getByText('Account & System Hub')).toBeInTheDocument();
    expect(screen.getByText('Manikandan Raj')).toBeInTheDocument();
    expect(screen.getByText('cto@trashhere.com')).toBeInTheDocument();
    expect(screen.getByText('890')).toBeInTheDocument();
  });

  it('should switch to Preferences & Theme tab when clicked', async () => {
    render(<HubPage />);
    const settingsTabBtn = screen.getByRole('button', { name: /Preferences & Theme/i });
    fireEvent.click(settingsTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Appearance & Theme')).toBeInTheDocument();
      expect(screen.getByText('Notification Channels & Alerts')).toBeInTheDocument();
    });
  });

  it('should switch to Security & Password tab and show strength meter', async () => {
    render(<HubPage />);
    const securityTabBtn = screen.getByRole('button', { name: /Security & Password/i });
    fireEvent.click(securityTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Password Management')).toBeInTheDocument();
      expect(screen.getByText('Password Strength')).toBeInTheDocument();
    });
  });

  it('should switch to GDPR tab and trigger data export request', async () => {
    render(<HubPage />);
    const gdprTabBtn = screen.getByRole('button', { name: /Data & Privacy \(GDPR\)/i });
    fireEvent.click(gdprTabBtn);

    await waitFor(() => {
      expect(screen.getByText('GDPR & CCPA Data Portability Center')).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /Request Data Export/i });
    fireEvent.click(exportBtn);
    expect(mockRequestGdpr).toHaveBeenCalled();
  });
});
