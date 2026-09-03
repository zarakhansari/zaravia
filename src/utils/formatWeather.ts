export interface WeatherDescription {
    label: string;
    icon: string;
}

export function getWeatherDescription(
    weatherCode: number,
): WeatherDescription {
    switch (weatherCode) {
        case 0:
            return {
                label: "Clear sky",
                icon: "☀️",
            };

        case 1:
            return {
                label: "Mainly clear",
                icon: "🌤️",
            };

        case 2:
            return {
                label: "Partly cloudy",
                icon: "⛅",
            };

        case 3:
            return {
                label: "Overcast",
                icon: "☁️",
            };

        case 45:
        case 48:
            return {
                label: "Foggy",
                icon: "🌫️",
            };

        case 51:
        case 53:
        case 55:
            return {
                label: "Drizzle",
                icon: "🌦️",
            };

        case 61:
        case 63:
        case 65:
            return {
                label: "Rain",
                icon: "🌧️",
            };

        case 71:
        case 73:
        case 75:
            return {
                label: "Snow",
                icon: "🌨️",
            };

        case 80:
        case 81:
        case 82:
            return {
                label: "Rain showers",
                icon: "🌦️",
            };

        case 95:
            return {
                label: "Thunderstorm",
                icon: "⛈️",
            };

        case 96:
        case 99:
            return {
                label: "Thunderstorm with hail",
                icon: "⛈️",
            };

        default:
            return {
                label: "Unknown",
                icon: "🌍",
            };
    }
}