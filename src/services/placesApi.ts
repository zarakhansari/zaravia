import type { Place } from "../types/place";

interface GeoapifyFeature {
    properties: {
        place_id: string;
        name?: string;
        lat: number;
        lon: number;
        categories?: string[];
    };
}

interface GeoapifyResponse {
    features: GeoapifyFeature[];
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
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    if (!apiKey) {
        throw new Error("Geoapify API key is missing");
    }

    const params = new URLSearchParams({
        categories: "tourism",
        filter: `circle:${longitude},${latitude},5000`,
        bias: `proximity:${longitude},${latitude}`,
        limit: "20",
        lang: "en",
        apiKey,
    });

    const response = await fetch(
        `https://api.geoapify.com/v2/places?${params.toString()}`,
    );

    if (!response.ok) {
        throw new Error(
            `Places API failed: ${response.status}`,
        );
    }

    const data: GeoapifyResponse = await response.json();

    return data.features
        .filter((place) => place.properties.name)
        .map((place) => ({
            id: place.properties.place_id,

            name: place.properties.name ?? "Unknown place",

            type:
                place.properties.categories?.[0] ??
                "Place",

            latitude: place.properties.lat,

            longitude: place.properties.lon,
        }))
        .slice(0, 12);
}