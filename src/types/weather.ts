export interface WeatherDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
}

export interface Weather {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  forecast: WeatherDay[];
}
