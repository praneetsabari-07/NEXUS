/**
 * NEXUS Gemini AI Intelligence Service
 * Powers the Tactical Copilot Chatbot and Dynamic Location Weather Summaries.
 */

import { LocationEntity, UserProfile } from '../types';
import { LiveClimateData } from './climateService';

export const DEFAULT_GEMINI_KEY = '';

// Preferred Gemini models in order of priority
const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];

class GeminiService {
  private inMemoryWeatherCache = new Map<string, { summary: string; timestamp: number }>();

  getApiKey(): string {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
    if (envKey && envKey.trim()) return envKey.trim();

    try {
      const stored = localStorage.getItem('nexus_gemini_api_key');
      if (stored && stored.trim()) return stored.trim();
    } catch {
      // Ignore localStorage errors
    }

    return DEFAULT_GEMINI_KEY;
  }

  saveApiKey(key: string): void {
    try {
      localStorage.setItem('nexus_gemini_api_key', key.trim());
    } catch (e) {
      console.warn('Failed to save Gemini API key:', e);
    }
  }

  /**
   * Generic content generator across fallback Gemini models
   */
  async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = this.getApiKey();

    for (const model of GEMINI_MODELS) {
      try {
        const body: any = {
          contents: [{ parts: [{ text: prompt }] }],
        };

        if (systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: systemInstruction }],
          };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.warn(`Gemini model ${model} returned ${response.status}:`, errData);
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      } catch (err) {
        console.warn(`Error invoking ${model}:`, err);
      }
    }

    throw new Error('All Gemini model endpoints failed. Please check network connectivity or API key.');
  }

  /**
   * Generates a 1-2 sentence tactical weather summary for the selected location
   */
  async summarizeLocationWeather(
    location: LocationEntity,
    liveClimate?: LiveClimateData | null,
    forceRefresh: boolean = false
  ): Promise<string> {
    const cacheKey = `${location.id}_${location.lat}_${location.lng}`;
    const now = Date.now();

    if (!forceRefresh) {
      const cached = this.inMemoryWeatherCache.get(cacheKey);
      if (cached && now - cached.timestamp < 10 * 60 * 1000) {
        return cached.summary;
      }
    }

    const temp = liveClimate ? liveClimate.temperatureC : location.temperatureC;
    const humidity = liveClimate ? liveClimate.humidityPct : location.humidity;
    const rain = liveClimate ? liveClimate.rainfall24hMm : location.rainfall24h;
    const soil = liveClimate ? liveClimate.soilMoisturePct : location.soilMoisture;
    const condition = liveClimate ? liveClimate.weatherCondition : 'Humid & Overcast';
    const wind = liveClimate ? `${liveClimate.windSpeedKmh} km/h` : '12 km/h';

    const prompt = `You are the meteorologist for the NEXUS Disaster Response System.
Provide a crisp, accurate, 1 to 2 sentence tactical weather summary for ${location.name} (${location.taluk ? location.taluk + ' Taluk, ' : ''}${location.district}, ${location.state}).
Live ground measurements:
- Ambient Temperature: ${temp}°C
- Atmospheric Condition: ${condition}
- Relative Humidity: ${humidity}%
- 24-Hour Precipitation: ${rain} mm
- Soil Moisture Saturation: ${soil}%
- Wind Velocity: ${wind}
- Elevation: ${location.elevationMsl}m MSL
- Local Slope/Flood Risk: ${location.hazardDescription}

Highlight current weather details, rain impact on ground terrain, and short-term atmospheric trajectory. Keep response within 2 sentences, highly descriptive, professional and without markdown headers.`;

    try {
      const summary = await this.generateContent(prompt);
      this.inMemoryWeatherCache.set(cacheKey, { summary, timestamp: now });
      return summary;
    } catch (err) {
      console.warn('Falling back to local weather summary generator:', err);
      return `${location.name} is currently experiencing ${condition.toLowerCase()} conditions at ${temp}°C with ${humidity}% relative humidity and ${rain}mm precipitation. Soil saturation is measured at ${soil}%, maintaining a ${location.riskLevel.toLowerCase()} hydrological watch.`;
    }
  }

  /**
   * Handles multi-turn chat conversation with the NEXUS Copilot
   */
  async chatWithCopilot(
    userMessage: string,
    history: Array<{ role: 'ai' | 'user'; text: string }>,
    location: LocationEntity,
    user: UserProfile,
    liveClimate?: LiveClimateData | null
  ): Promise<string> {
    const temp = liveClimate ? liveClimate.temperatureC : location.temperatureC;
    const humidity = liveClimate ? liveClimate.humidityPct : location.humidity;
    const rain = liveClimate ? liveClimate.rainfall24hMm : location.rainfall24h;
    const soil = liveClimate ? liveClimate.soilMoisturePct : location.soilMoisture;
    const condition = liveClimate ? liveClimate.weatherCondition : 'Overcast';

    const systemInstruction = `You are NEXUS Tactical AI Copilot v4.8 ProbNet, an advanced AI system for real-time disaster management, meteorological analysis, and emergency tactical command in Tamil Nadu, India.
You are collaborating with Operator ${user.name} (${user.role}, Clearance: ${user.clearanceLevel}).

Current Ground Location Context:
- Location: ${location.name}
- District: ${location.district} | Taluk: ${location.taluk} | State: ${location.state}
- Coordinates: ${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E | Elevation: ${location.elevationMsl}m MSL
- Disaster Risk Index (DRI): ${location.riskScore}% [${location.riskLevel}]
- Fault / Slope Creep: ${location.faultSlipRate} mm/h
- Local Hazard Overview: ${location.hazardDescription}

Current Telemetric Weather & Climate:
- Temperature: ${temp}°C
- Condition: ${condition}
- Humidity: ${humidity}%
- 24h Precipitation: ${rain} mm
- Soil Moisture: ${soil}%

Guidelines:
- Provide precise, decisive, and actionable emergency management, evacuation, weather, and engineering advice.
- When asked about weather or climate, integrate the exact telemetry and provide clear atmospheric guidance.
- Keep tone professional, authoritative, and tactically grounded.`;

    const recentHistory = history.slice(-6).map((msg) => `${msg.role === 'user' ? 'Operator' : 'Copilot'}: ${msg.text}`).join('\n');
    const fullPrompt = `${recentHistory ? `Previous Radio Transcript:\n${recentHistory}\n\n` : ''}Operator ${user.name}: ${userMessage}\n\nCopilot Response:`;

    return this.generateContent(fullPrompt, systemInstruction);
  }
}

export const geminiService = new GeminiService();
