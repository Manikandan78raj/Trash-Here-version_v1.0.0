import { GeofenceValidator } from "./geofence.validator";
import { BadRequestException } from "@nestjs/common";

describe("GeofenceValidator", () => {
  it("should return valid when distance is within maxAllowedMeters", () => {
    // Two coordinates very close to each other in SF (~10 meters apart)
    const lat1 = 37.7749;
    const lon1 = -122.4194;
    const lat2 = 37.775;
    const lon2 = -122.4194;

    const result = GeofenceValidator.verifyDistance(
      lat1,
      lon1,
      lat2,
      lon2,
      100,
    );
    expect(result.isValid).toBe(true);
    expect(result.distanceMeters).toBeLessThanOrEqual(100);
  });

  it("should throw BadRequestException when distance exceeds maxAllowedMeters", () => {
    // Two coordinates ~1.1 km apart
    const lat1 = 37.7749;
    const lon1 = -122.4194;
    const lat2 = 37.7849;
    const lon2 = -122.4194;

    expect(() => {
      GeofenceValidator.verifyDistance(lat1, lon1, lat2, lon2, 100);
    }).toThrow(BadRequestException);
  });

  it("should throw BadRequestException if coordinates are NaN or invalid", () => {
    expect(() => {
      GeofenceValidator.verifyDistance(NaN, 0, 0, 0, 100);
    }).toThrow(BadRequestException);
  });
});
