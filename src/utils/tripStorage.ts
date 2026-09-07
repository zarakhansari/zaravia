import type { Place } from "../types/place";

const PLACES_KEY = "zaravia-trip-places";
const CITIES_KEY = "zaravia-trip-cities";

export interface TripCity {
    id: number;
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}

/*
 * Places
 */

export function getTripPlaces(): Place[] {
    const savedPlaces = localStorage.getItem(PLACES_KEY);

    if (!savedPlaces) {
        return [];
    }

    try {
        return JSON.parse(savedPlaces);
    } catch {
        return [];
    }
}

export function saveTripPlaces(places: Place[]) {
    localStorage.setItem(
        PLACES_KEY,
        JSON.stringify(places),
    );
}

export function addTripPlace(place: Place): Place[] {
    const currentPlaces = getTripPlaces();

    const alreadyAdded = currentPlaces.some(
        (item) => item.id === place.id,
    );

    if (alreadyAdded) {
        return currentPlaces;
    }

    const updatedPlaces = [
        ...currentPlaces,
        place,
    ];

    saveTripPlaces(updatedPlaces);

    return updatedPlaces;
}

export function removeTripPlace(placeId: string): Place[] {
    const currentPlaces = getTripPlaces();

    const updatedPlaces = currentPlaces.filter(
        (place) => place.id !== placeId,
    );

    saveTripPlaces(updatedPlaces);

    return updatedPlaces;
}

/*
 * Cities
 */

export function getTripCities(): TripCity[] {
    const savedCities = localStorage.getItem(CITIES_KEY);

    if (!savedCities) {
        return [];
    }

    try {
        return JSON.parse(savedCities);
    } catch {
        return [];
    }
}

export function saveTripCities(cities: TripCity[]) {
    localStorage.setItem(
        CITIES_KEY,
        JSON.stringify(cities),
    );
}

export function addTripCity(
    city: TripCity,
): TripCity[] {
    const currentCities = getTripCities();

    const alreadyAdded = currentCities.some(
        (item) => item.id === city.id,
    );

    if (alreadyAdded) {
        return currentCities;
    }

    const updatedCities = [
        ...currentCities,
        city,
    ];

    saveTripCities(updatedCities);

    return updatedCities;
}

export function removeTripCity(
    cityId: number,
): TripCity[] {
    const currentCities = getTripCities();

    const updatedCities = currentCities.filter(
        (city) => city.id !== cityId,
    );

    saveTripCities(updatedCities);

    return updatedCities;
}