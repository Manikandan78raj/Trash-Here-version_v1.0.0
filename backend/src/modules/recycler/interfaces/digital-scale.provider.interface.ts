export interface ScaleReading {
  weightKg: number;
  isStable: boolean;
  timestamp: string;
  scaleCalibrationDate: string;
}

export interface IDigitalScaleProvider {
  getScaleReading(scaleId: string): Promise<ScaleReading>;
  verifyDigitalSeal(payload: string, signature: string): boolean;
  generateDigitalSeal(payload: string): string;
}
