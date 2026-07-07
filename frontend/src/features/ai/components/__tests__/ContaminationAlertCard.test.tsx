import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ContaminationAlertCard } from '../ContaminationAlertCard';
import type { AiPrediction } from '../../types/ai.types';

describe('ContaminationAlertCard Component (TDD)', () => {
  const cleanPrediction: AiPrediction = {
    id: 'pred-1',
    jobId: 'job-1',
    imageId: 'img-1',
    isContaminated: false,
    contaminationRate: 0.0,
    overallConfidence: 0.98,
    recommendationType: 'DIRECT_RECYCLE',
    recommendationText: 'Clean PET bottle ready for direct recycling.',
    estimatedWeightKg: 0.5,
    co2SavedKg: 1.25,
    greenPointsEarned: 20,
    createdAt: new Date().toISOString(),
  };

  const contaminatedPrediction: AiPrediction = {
    id: 'pred-2',
    jobId: 'job-2',
    imageId: 'img-2',
    isContaminated: true,
    contaminationRate: 25.5,
    overallConfidence: 0.92,
    recommendationType: 'REQUIRES_RINSING',
    recommendationText: 'Contains food residue. Please rinse thoroughly before recycling.',
    estimatedWeightKg: 0.8,
    co2SavedKg: 0.6,
    greenPointsEarned: 10,
    createdAt: new Date().toISOString(),
  };

  it('should render success state when item is clean (0% contamination)', () => {
    render(<ContaminationAlertCard prediction={cleanPrediction} />);
    expect(screen.getByText(/0%/i)).toBeInTheDocument();
    expect(screen.getByText(/Contamination Rate by Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/Clean & Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/\+20 Pts/i)).toBeInTheDocument();
    expect(screen.getByText(/1.25 kg CO₂/i)).toBeInTheDocument();
    expect(screen.getByText(/Clean PET bottle ready/i)).toBeInTheDocument();
  });

  it('should render warning alert state when item is contaminated (>15%)', () => {
    render(<ContaminationAlertCard prediction={contaminatedPrediction} />);
    expect(screen.getByText(/25\.5%/i)).toBeInTheDocument();
    expect(screen.getByText(/Contamination Rate by Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/High Severity/i)).toBeInTheDocument();
    expect(screen.getByText(/\+10 Pts/i)).toBeInTheDocument();
    expect(screen.getByText(/Contains food residue/i)).toBeInTheDocument();
  });
});
