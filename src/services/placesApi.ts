import type { Place } from "../types/place";

interface OverpassElement {
    id: number;
    lat?: number;
    lon?: number;
    center?: {
        lat: number;
        lon: number;
    };
    tags?: {
        name?: string;
        tourism?: string;
        amenity?: string;
        leisure?: string;
    };
}

interface OverpassResponse {
    elements: OverpassElement[];
}

// Cache completed requests
const placesCache = new Map<string, Place[]>();

// Cache requests that are currently running
const placesRequests = new Map<string, Promise<Place[]>>();

export async function getPlaces(
    latitude: number,
    longitude: number,
): Promise<Place[]> {
    const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;

    // Return cached data if we already fetched this location
    const cachedPlaces = placesCache.get(cacheKey);

    if (cachedPlaces) {
        return cachedPlaces;
    }

    // If this exact request is already running,
    // reuse it instead of sending another request.
    const existingRequest = placesRequests.get(cacheKey);

    if (existingRequest) {
        return existingRequest;
    }

    const request = fetchPlaces(latitude, longitude);

    placesRequests.set(cacheKey, request);

    try {
        const places = await request;

        placesCache.set(cacheKey, places);

        return places;
    } finally {
        placesRequests.delete(cacheKey);
    }
}

async function fetchPlaces(
    latitude: number,
    longitude: number,
): Promise<Place[]> {
    const query = `
    [out:json];
    (
      node["tourism"](around:5000,${latitude},${longitude});
      way["tourism"](around:5000,${latitude},${longitude});
    );
    out center;
  `;

    const response = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
            method: "POST",
            body: query,
        },
    );

    if (!response.ok) {
        throw new Error(
            `Places API failed: ${response.status}`,
        );
    }

    const data: OverpassResponse = await response.json();

    return data.elements
        .filter((place) => place.tags?.name)
        .map((place) => ({
            id: String(place.id),
            name: place.tags?.name ?? "Unknown place",
            type:
                place.tags?.tourism ??
                place.tags?.amenity ??
                place.tags?.leisure ??
                "Place",
            latitude:
                place.lat ??
                place.center?.lat ??
                latitude,
            longitude:
                place.lon ??
                place.center?.lon ??
                longitude,
        }))
        .slice(0, 12);
}