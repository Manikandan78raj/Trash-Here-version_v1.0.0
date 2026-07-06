export interface RouteWaypoint {
  pickupId: string;
  order: number;
  lat: number;
  lng: number;
  address: string;
  customerName: string;
  status: string;
  estimatedWeightKg: number;
}

export interface OptimizedRouteResult {
  collectorId: string;
  totalWaypoints: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  encodedPolyline: string;
  waypoints: RouteWaypoint[];
}

export interface IMapsRouteProvider {
  getOptimizedRoute(
    collectorLat: number,
    collectorLng: number,
    waypoints: RouteWaypoint[],
  ): Promise<OptimizedRouteResult>;
}
