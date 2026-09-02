import type { Destination } from "../types/destination";

interface GeocodingResponse {
    results?: Array<{
        id: number;
        name: string;
        country: string;
        latitude: number;
        longitude: number;
    }>;
}

export async function searchDestinations(
    query: string,
): Promise<Destination[]> {
    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query,
        )}&count=5&language=en&format=json`,
    );

    if (!response.ok) {
        throw new Error("Failed to fetch destinations");
    }

    const data: GeocodingResponse = await response.json();

    return (
        data.results?.map((destination) => ({
            id: destination.id,
            name: destination.name,
            country: destination.country,
            latitude: destination.latitude,
            longitude: destination.longitude,
        })) ?? []
    );
}