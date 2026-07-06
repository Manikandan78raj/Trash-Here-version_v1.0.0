import { Injectable, Logger } from "@nestjs/common";
import {
  IMapsRouteProvider,
  OptimizedRouteResult,
  RouteWaypoint,
} from "./maps-route.provider.interface";

@Injectable()
export class GoogleMapsPolylineProvider implements IMapsRouteProvider {
  private readonly logger = new Logger(GoogleMapsPolylineProvider.name);

  async getOptimizedRoute(
    collectorLat: number,
    collectorLng: number,
    waypoints: RouteWaypoint[],
  ): Promise<OptimizedRouteResult> {
    this.logger.log(
      `🗺️ Calculating Google Maps Polyline Route for ${waypoints.length} waypoints`,
    );

    // Sort waypoints by nearest Euclidean distance from collector coordinates
    const sortedWaypoints = [...waypoints]
      .sort((a, b) => {
        const distA = Math.hypot(a.lat - collectorLat, a.lng - collectorLng);
        const distB = Math.hypot(b.lat - collectorLat, b.lng - collectorLng);
        return distA - distB;
      })
      .map((wp, index) => ({
        ...wp,
        order: index + 1,
      }));

    // Calculate total simulated distance and duration
    let totalDistanceKm = 0;
    let currLat = collectorLat;
    let currLng = collectorLng;

    for (const wp of sortedWaypoints) {
      const stepKm = Math.hypot(wp.lat - currLat, wp.lng - currLng) * 111;
      totalDistanceKm += stepKm;
      currLat = wp.lat;
      currLng = wp.lng;
    }

    const totalDurationMin = Math.round(
      totalDistanceKm * 3 + sortedWaypoints.length * 5,
    );
    // Standard encoded polyline simulation (e.g. San Francisco downtown loop)
    const encodedPolyline = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";

    return {
      collectorId: "", // filled by service
      totalWaypoints: sortedWaypoints.length,
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
      totalDurationMin,
      encodedPolyline,
      waypoints: sortedWaypoints,
    };
  }
}
