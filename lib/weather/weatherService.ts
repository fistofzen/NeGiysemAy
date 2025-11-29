import { addDays } from "date-fns";

export type WeatherRequest = {
  location: string;
  date: Date;
};

export type WeatherConditions = {
  date: Date;
  summary: string;
  temperatureMinC: number;
  temperatureMaxC: number;
  precipitationChance: number;
  windSpeedKph: number;
};

export interface WeatherService {
  getWeatherForDate(request: WeatherRequest): Promise<WeatherConditions>;
  getWeatherForRange(location: string, start: Date, end: Date): Promise<WeatherConditions[]>;
}

class MockWeatherService implements WeatherService {
  async getWeatherForDate({ location, date }: WeatherRequest): Promise<WeatherConditions> {
    // Simple deterministic mock so UI has stable data during development.
    const baseTemp = 12 + Math.abs(location.length % 8);
    return {
      date,
      summary: "Parçalı bulutlu ve hafif rüzgarlı",
      temperatureMinC: baseTemp,
      temperatureMaxC: baseTemp + 6,
      precipitationChance: 0.25,
      windSpeedKph: 18,
    };
  }

  async getWeatherForRange(location: string, start: Date, end: Date): Promise<WeatherConditions[]> {
    const days: WeatherConditions[] = [];
    let cursor = new Date(start);
    while (cursor <= end) {
      days.push(await this.getWeatherForDate({ location, date: new Date(cursor) }));
      cursor = addDays(cursor, 1);
    }
    return days;
  }
}

// TODO: Replace with real client that calls OpenWeatherMap or similar service.
const mockWeatherService = new MockWeatherService();

export const weatherService: WeatherService = mockWeatherService;
