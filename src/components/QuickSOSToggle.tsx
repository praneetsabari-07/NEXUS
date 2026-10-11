import React, { useState, useEffect } from 'react';
import { ShieldAlert, Send, CheckCircle2, AlertTriangle, Key, X, ExternalLink, RefreshCw, MessageSquare, PhoneCall } from 'lucide-react';
import { SOSService, SOSSendingResult } from '../services/sosService';
import { LocationEntity } from '../types';

interface QuickSOSToggleProps {
  currentLocation: LocationEntity;
}

export const QuickSOSToggle: React.FC<QuickSOSToggleProps> = ({ currentLocation }) => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [walletInfo, setWalletInfo] = useState<{ wallet: string; smsCount: number } | null>({ wallet: '50.00', smsCount: 200 });
  const [sendResult, setSendResult] = useState<SOSSendingResult | null>(null);

  // Load stored Fast2SMS API key on mount
  useEffect(() => {
    const key = SOSService.getApiKey();
    setApiKey(key);
    SOSService.checkWallet(key).then((w) => {
      if (w.success) setWalletInfo({ wallet: w.wallet, smsCount: w.smsCount });
    });
  }, []);

  const handleToggle = () => {
    const nextState = !isSOSActive;
    setIsSOSActive(nextState);
    if (nextState) {
      setIsModalOpen(true);
    }
  };

  const handleSaveApiKey = () => {
    SOSService.saveApiKey(apiKey);
    setIsEditingKey(false);
    SOSService.checkWallet(apiKey).then((w) => {
      if (w.success) setWalletInfo({ wallet: w.wallet, smsCount: w.smsCount });
    });
  };

  const handleSendSOS = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const city = currentLocation.taluk ? `${currentLocation.taluk}, ${currentLocation.district}` : currentLocation.district;
      const region = currentLocation.state || 'Tamil Nadu';

      const result = await SOSService.dispatchSOS({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        city: city,
        region: region,
        country: 'India',
        phoneNumber: '8754603193',
        customApiKey: apiKey
      });

      setSendResult(result);
      if (result.success) {
        setIsSOSActive(true);
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || 'Error executing Fast2SMS dispatch',
        formattedMessage: '',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsSending(false);
    }
  };

  // Live preview message
  const previewData = SOSService.buildSOSMessage({
    lat: currentLocation.latitude,
    lng: currentLocation.longitude,
    city: currentLocation.taluk ? `${currentLocation.taluk}, ${currentLocation.district}` : currentLocation.district,
    region: currentLocation.state || 'Tamil Nadu',
    country: 'India'
  });

  const mobileSmsHref = SOSService.getMobileSmsUrl('8754603193', previewData.message);
  const whatsAppHref = SOSService.getWhatsAppUrl('8754603193', previewData.message);

  return (
    <>
      {/* 1. Header Toggle Button replacing "GRID ACTIVE" */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggle}
          title={isSOSActive ? 'Emergency SOS Mode Active - Click to Manage / Dispatch' : 'Click to Toggle SOS Quick Sender'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 cursor-pointer border shadow-sm select-none ${
            isSOSActive
              ? 'bg-rose-500/25 border-rose-400 text-rose-200 shadow-rose-500/30'
              : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/20 text-slate-300 hover:text-white'
          }`}
        >
          {/* Animated Indicator dot */}
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                isSOSActive ? 'bg-rose-400' : 'bg-slate-400'
              } opacity-75`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isSOSActive ? 'bg-rose-500' : 'bg-slate-500'
              }`}
            ></span>
          </span>

          <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
            {isSOSActive ? 'SOS ENGAGED' : 'SOS'}
          </span>

          {/* Toggle Switch Pill Graphic */}
          <div
            className={`w-7 h-3.5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
              isSOSActive ? 'bg-rose-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md"></div>
          </div>
        </button>

        {isSOSActive && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] font-mono text-rose-300 hover:text-white underline cursor-pointer hidden xl:inline"
          >
            Manage Alert
          </button>
        )}
      </div>

      {/* 2. Fast2SMS Quick SOS Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(244,63,94,0.3)] text-slate-100 font-sans relative overflow-hidden">
            {/* Top Glowing Ambient Accents */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Quick SOS Sender (Fast2SMS)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Target Mobile: <strong className="text-rose-300">+91 8754603193</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* API Key & Wallet Status Bar */}
            <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-slate-300 flex items-center gap-1 text-[11px]">
                  <Key className="w-3.5 h-3.5 text-cyan-400" /> Fast2SMS API Key:
                </span>
                <div className="flex items-center gap-2">
                  {walletInfo && (
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Balance: ₹{walletInfo.wallet} ({walletInfo.smsCount} SMS)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditingKey(!isEditingKey)}
                    className="text-[10px] text-cyan-300 hover:underline cursor-pointer"
                  >
                    {isEditingKey ? 'Cancel' : (apiKey ? 'Edit' : 'Add API Key')}
                  </button>
                </div>
              </div>

              {isEditingKey ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Enter Fast2SMS API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span className="truncate max-w-[280px]">
                    {apiKey ? `${apiKey.slice(0, 10)}••••••••••••${apiKey.slice(-6)}` : 'Key Not Configured'}
                  </span>
                  <a
                    href="https://www.fast2sms.com/dashboard/dev-api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>Fast2SMS Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Message Preview Box (Exactly matching user format) */}
            <div className="mt-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5 tracking-wider">
                SMS Payload Preview (Live Location Synced)
              </span>
              <pre className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-200 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
                {previewData.message}
              </pre>
            </div>

            {/* Status Alert feedback */}
            {sendResult && (
              <div
                className={`mt-4 p-3 rounded-2xl border text-xs font-mono flex items-start gap-2.5 ${
                  sendResult.success
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                }`}
              >
                {sendResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-bold">{sendResult.message}</p>
                  {sendResult.message.includes('100 INR') && (
                    <div className="mt-2 pt-2 border-t border-rose-500/30">
                      <p className="text-[11px] text-slate-300">
                        Fast2SMS requires completing one payment of ₹100 or more to activate REST API routes for new accounts.
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <a
                          href="https://www.fast2sms.com/dashboard/add-credit"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-white font-bold bg-rose-600 hover:bg-rose-500 px-3 py-1 rounded-lg"
                        >
                          <span>Complete ₹100 Activation</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-[11px] text-slate-400">OR use the 1-Click Mobile SMS button below:</span>
                      </div>
                    </div>
                  )}
                  {sendResult.requestId && (
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Request ID: <span className="text-white font-mono">{sendResult.requestId}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Dual Workable Emergency Dispatch Channels */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={mobileSmsHref}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 flex items-center justify-center gap-2 text-xs font-bold transition text-center"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>📱 Open Phone SMS</span>
              </a>

              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-bold transition text-center"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>💬 Send via WhatsApp</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsSOSActive(false);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 cursor-pointer"
              >
                Deactivate / Close
              </button>

              <button
                type="button"
                disabled={isSending}
                onClick={handleSendSOS}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting SOS...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Fast2SMS API</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
