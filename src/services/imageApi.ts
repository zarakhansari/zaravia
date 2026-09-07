import type { DestinationImage } from "../types/image";

interface UnsplashPhoto {
    id: string;

    urls: {
        regular: string;
    };

    user: {
        name: string;
        links: {
            html: string;
        };
    };
}

interface UnsplashResponse {
    results: UnsplashPhoto[];
}

export async function searchDestinationImage(
    destination: string,
): Promise<DestinationImage | null> {
    const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    const url =
        `https://api.unsplash.com/search/photos` +
        `?query=${encodeURIComponent(destination)}` +
        `&per_page=1` +
        `&orientation=landscape`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Client-ID ${accessKey}`,
        },
    });

    if (!response.ok) {
        throw new Error(
            `Unsplash API failed: ${response.status}`,
        );
    }

    const data: UnsplashResponse = await response.json();

    const photo = data.results[0];

    if (!photo) {
        return null;
    }

    return {
        id: photo.id,
        url: photo.urls.regular,
        photographerName: photo.user.name,
        photographerUrl: photo.user.links.html,
    };
}