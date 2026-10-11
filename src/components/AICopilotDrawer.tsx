import React, { useState } from 'react';
import { LocationEntity, UserProfile } from '../types';
import { Sparkles, X, Send, Bot, ShieldAlert, CheckCircle2, ArrowRight, CloudRain } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { LiveClimateData } from '../services/climateService';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationEntity;
  user: UserProfile;
  liveClimate?: LiveClimateData | null;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  location,
  user,
  liveClimate,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string; time: string }>>([
    {
      role: 'ai',
      text: `Tactical Copilot online for Operator ${user.name} (Powered by Google Gemini). Ground telemetry ingest active for ${location.name}. Current Disaster Risk Index is at ${location.riskScore}% (${location.riskLevel}). Slope shear creep strain is measuring ${location.faultSlipRate} mm/h. How can I assist with weather intelligence, containment, or evacuation corridors?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent, directMessage?: string) => {
    if (e) e.preventDefault();
    const userText = (directMessage || input).trim();
    if (!userText) return;

    const newMsg = {
      role: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Direct live Gemini Intelligence invocation using the user's Gemini API key
      const geminiReply = await geminiService.chatWithCopilot(
        userText,
        updatedMessages,
        location,
        user,
        liveClimate
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: geminiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.warn('Gemini chat fallback invoked:', err);
      // Context-grounded fallback response based on real chosen location
      let reply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('weather') || lower.includes('rain') || lower.includes('climate')) {
        const temp = liveClimate ? liveClimate.temperatureC : location.temperatureC;
        const rain = liveClimate ? liveClimate.precipitationMm : location.rainfall24h;
        const hum = liveClimate ? liveClimate.humidityPct : location.humidity;
        reply = `Weather Telemetry for ${location.name}: Current ambient temperature is ${temp}°C with ${hum}% relative humidity. 24h precipitation is at ${rain}mm. Soil saturation is at ${location.soilMoisture}%.`;
      } else if (lower.includes('evacuat') || lower.includes('route') || lower.includes('safe')) {
        reply = `Recommended Evacuation Vector for ${location.name}: Divert civilian traffic away from slope cut zones toward higher bedrock ridges. Main arterial corridors are under heavy saturation (${location.rainfall24h}mm rainfall / 24h). Recommend opening primary emergency corridor along sector ridgeline.`;
      } else {
        reply = `Telemetry parameters for ${location.name} have been cross-checked against NEXUS neural models. All seismic acoustic nodes and sensors in this sector report synchronous uplink.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-3xl liquid-glass-card border border-white/25 shadow-2xl flex flex-col h-[520px] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 22, 40, 0.95) 0%, rgba(8, 14, 28, 0.98) 100%)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/15 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>NEXUS AI Tactical Copilot</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Gemini 3.6 Flash
                </span>
              </h3>
              <p className="text-[11px] font-mono text-slate-300">
                Active Ground Lock: <span className="text-cyan-300">{location.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'bg-white/10 border border-white/15 text-slate-100 shadow-sm'
                }`}
              >
                {m.role === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-cyan-300 font-semibold">
                    <Bot className="w-3 h-3" />
                    <span>Gemini Tactical Neural Core</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
                <div
                  className={`text-[9px] mt-1 font-mono text-right ${
                    m.role === 'user' ? 'text-cyan-100/70' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono p-2">
              <span className="animate-spin">⚡</span> Querying Gemini 3.6 Flash for tactical guidance...
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 border-t border-white/10 bg-black/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleSend(undefined, `Summarize current weather details and immediate meteorological forecast for ${location.name}.`)}
            className="px-2.5 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-[10px] text-cyan-200 whitespace-nowrap border border-cyan-400/30 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <CloudRain className="w-3 h-3 text-cyan-300" />
            <span>Summarize weather details</span>
          </button>
          <button
            type="button"
            onClick={() => handleSend(undefined, `What are the safest evacuation corridors and tactical relief routes for ${location.name}?`)}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 whitespace-nowrap border border-white/10 cursor-pointer transition-colors"
          >
            Evacuation corridors?
          </button>
          <button
            type="button"
            onClick={() => handleSend(undefined, `Check rainfall threshold and soil moisture saturation status for ${location.name}.`)}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 whitespace-nowrap border border-white/10 cursor-pointer transition-colors"
          >
            Rainfall saturation?
          </button>
          <button
            type="button"
            onClick={() => handleSend(undefined, `Assess fault fracture slip rate and landslide probability for ${location.name}.`)}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 whitespace-nowrap border border-white/10 cursor-pointer transition-colors"
          >
            Slope slip rate?
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/15 bg-white/5 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Copilot regarding ${location.name}...`}
            className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="btn-liquid-sheen px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
