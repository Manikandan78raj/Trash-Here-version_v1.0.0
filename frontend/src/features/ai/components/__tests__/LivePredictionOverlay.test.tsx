import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LivePredictionOverlay } from '../LivePredictionOverlay';
import type { DetectedObject } from '../../types/ai.types';

describe('LivePredictionOverlay Component (TDD)', () => {
  const mockObjects: DetectedObject[] = [
    {
      id: '1',
      label: 'PET_BOTTLE',
      confidenceScore: 0.95,
      xMin: 0.1,
      yMin: 0.1,
      xMax: 0.5,
      yMax: 0.8,
      materialType: 'PLASTIC_PET',
      isContaminant: false,
    },
    {
      id: '2',
      label: 'FOOD_RESIDUE',
      confidenceScore: 0.88,
      xMin: 0.6,
      yMin: 0.2,
      xMax: 0.9,
      yMax: 0.4,
      materialType: 'ORGANIC_WASTE',
      isContaminant: true,
    },
  ];

  it('should render bounding box overlays for detected objects', () => {
    render(
      <LivePredictionOverlay
        imageUrl="https://storage.trashhere.com/test.jpg"
        detectedObjects={mockObjects}
      />,
    );

    expect(screen.getByText(/PET_BOTTLE/i)).toBeInTheDocument();
    expect(screen.getByText(/95%/i)).toBeInTheDocument();
    expect(screen.getByText(/FOOD_RESIDUE/i)).toBeInTheDocument();
    expect(screen.getByText(/88%/i)).toBeInTheDocument();
  });

  it('should apply warning contamination highlights for contaminant objects', () => {
    render(
      <LivePredictionOverlay
        imageUrl="https://storage.trashhere.com/test.jpg"
        detectedObjects={mockObjects}
      />,
    );

    expect(screen.getByText(/Contaminant/i)).toBeInTheDocument();
  });

  it('should render cleanly when detectedObjects is empty', () => {
    render(
      <LivePredictionOverlay
        imageUrl="https://storage.trashhere.com/test.jpg"
        detectedObjects={[]}
      />,
    );

    expect(screen.queryByText(/PET_BOTTLE/i)).not.toBeInTheDocument();
  });
});
