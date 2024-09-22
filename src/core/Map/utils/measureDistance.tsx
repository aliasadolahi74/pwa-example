const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

type Coordinates = {latitude: number, longitude: number};
const haversineDistance = (coords1: Coordinates, coords2: Coordinates): number => {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = toRadians(coords1.latitude);
    const lat2 = toRadians(coords2.latitude);
    const deltaLat = toRadians(coords2.latitude - coords1.latitude);
    const deltaLon = toRadians(coords2.longitude - coords1.longitude);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Number((R * c).toFixed(2)); // Distance in meters
};

export default haversineDistance;