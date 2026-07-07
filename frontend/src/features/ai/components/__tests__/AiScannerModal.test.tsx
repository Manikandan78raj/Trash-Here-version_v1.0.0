import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AiScannerModal } from '../AiScannerModal';

// Mock TanStack Query hooks
const mockCreateUploadUrl = vi.fn();
const mockUploadImage = vi.fn();
const mockAnalyzeImage = vi.fn();

vi.mock('../../hooks/useAiQuery', () => ({
  useCreateUploadUrl: () => ({
    mutateAsync: mockCreateUploadUrl,
    isPending: false,
  }),
  useUploadImage: () => ({
    mutateAsync: mockUploadImage,
    isPending: false,
  }),
  useAnalyzeImage: () => ({
    mutateAsync: mockAnalyzeImage,
    isPending: false,
  }),
}));

describe('AiScannerModal Component (TDD)', () => {
  let queryClient: QueryClient;
  const mockOnClose = vi.fn();
  const mockOnScanComplete = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderComponent = (isOpen = true) =>
    render(
      <QueryClientProvider client={queryClient}>
        <AiScannerModal
          isOpen={isOpen}
          onClose={mockOnClose}
          onScanComplete={mockOnScanComplete}
        />
      </QueryClientProvider>,
    );

  it('should not render when isOpen is false', () => {
    renderComponent(false);
    expect(screen.queryByText(/AI Waste Scanner/i)).not.toBeInTheDocument();
  });

  it('should render camera access and drag-and-drop upload zone', () => {
    renderComponent(true);
    expect(screen.getByText(/AI Waste Scanner/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop waste image here/i)).toBeInTheDocument();
    expect(screen.getByText(/Supported formats: JPEG, PNG, WebP, HEIC/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Take Photo/i })).toBeInTheDocument();
  });

  it('should handle image file selection and trigger upload to S3 and analysis', async () => {
    mockCreateUploadUrl.mockResolvedValueOnce({
      presignedUrl: 'https://s3.trashhere.com/upload-key',
      storageKey: 'ai-uploads/test.jpg',
      uploadId: 'upload-123',
    });
    mockUploadImage.mockResolvedValueOnce(undefined);
    mockAnalyzeImage.mockResolvedValueOnce({
      jobId: 'job-999',
      status: 'QUEUED',
    });

    renderComponent(true);

    const file = new File(['dummy content'], 'waste.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-upload-input');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockCreateUploadUrl).toHaveBeenCalledWith({
        mimeType: 'image/jpeg',
        fileSizeBytes: file.size,
      });
    });

    await waitFor(() => {
      expect(mockUploadImage).toHaveBeenCalled();
      expect(mockAnalyzeImage).toHaveBeenCalledWith({
        storageKey: 'ai-uploads/test.jpg',
        sha256Hash: expect.any(String),
        modelType: 'HYBRID_VISION',
      });
    });

    expect(mockOnScanComplete).toHaveBeenCalledWith('job-999');
  });

  it('should reject unsupported file formats', async () => {
    renderComponent(true);
    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('file-upload-input');
    fireEvent.change(input, { target: { files: [file] } });

    expect(mockCreateUploadUrl).not.toHaveBeenCalled();
    expect(await screen.findByText(/Unsupported file format/i)).toBeInTheDocument();
  });
});
