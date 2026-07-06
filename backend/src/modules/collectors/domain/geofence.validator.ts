import { BadRequestException } from "@nestjs/common";

export interface GeofenceValidationResult {
  isValid: boolean;
  distanceMeters: number;
  maxAllowedMeters: number;
}

export class GeofenceValidator {
  private static readonly EARTH_RADIUS_METERS = 6371000;

  /**
   * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
   * Throws BadRequestException if distance exceeds maxAllowedMeters.
   */
  public static verifyDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    maxAllowedMeters: number = 100,
  ): GeofenceValidationResult {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      throw new BadRequestException(
        "Invalid GPS coordinates provided for geofence verification.",
      );
    }

    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = Math.round(this.EARTH_RADIUS_METERS * c);

    if (distanceMeters > maxAllowedMeters) {
      throw new BadRequestException(
        `Geofence violation: Collector is ${distanceMeters}m away from pickup address (maximum allowed is ${maxAllowedMeters}m). Please move closer to the bin.`,
      );
    }

    return {
      isValid: true,
      distanceMeters,
      maxAllowedMeters,
    };
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
