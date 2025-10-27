import React, { useEffect, useRef, useState } from "react";
import { FcAssistant } from "react-icons/fc";
import { PiPhoneCallFill } from "react-icons/pi";
import useAiStore from "../../stores/aiStore";
import { IoMdCall } from "react-icons/io";
import { FiX, FiSend, FiMic, FiMicOff, FiVolumeX } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const AiOverlay = () => {
  const { messages, isLoading, sendMessage, makeCall } = useAiStore();
  const [callName, setCallName] = useState("");
  const [callNumber, setCallNumber] = useState("");
  const [isDisplayChatCard, setIsDisplayChatCard] = useState(false);
  const [isDisplayCallCard, setIsDisplayCallCard] = useState(false);

  // Chat & Voice state
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micError, setMicError] = useState('');
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const inputMessageRef = useRef('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    inputMessageRef.current = inputMessage;
  }, [inputMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isLoading]);

  // Initialize Web Speech API (SpeechRecognition & SpeechSynthesis)
  useEffect(() => {
    // SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = 'en-US';
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onresult = (event) => {
          let interim = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          const cleanedFinal = finalTranscript.trim();
          setTranscript(cleanedFinal || interim);
          if (cleanedFinal) {
            inputMessageRef.current = cleanedFinal;
            setInputMessage(cleanedFinal);
            setMicError('');
            handleSendMessage();
          }
        };

        rec.onerror = (e) => {
          console.warn('Speech recognition error', e);
          setIsRecording(false);
          const errorMessage = (() => {
            switch (e.error) {
              case 'not-allowed':
                return 'Microphone access was denied. Please enable microphone permissions.';
              case 'no-speech':
                return 'No speech detected. Please try speaking again.';
              case 'audio-capture':
                return 'No microphone was found. Check your audio device.';
              case 'network':
                return 'Network error while processing speech. Check your connection.';
              default:
                return 'An unexpected microphone error occurred. Please try again.';
            }
          })();
          setMicError(errorMessage);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      } catch (err) {
        console.warn('SpeechRecognition init failed', err);
        setMicError('Speech recognition could not be initialized in this browser.');
      }
    }

    // SpeechSynthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      // cleanup
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.onresult = null;
          rec.onend = null;
          rec.onerror = null;
          rec.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      const synth = synthesisRef.current || window.speechSynthesis;
      if (synth) {
        try { synth.cancel(); } catch (e) {}
        synthesisRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleSendMessage = async (overrideText) => {
    const textToSend = (overrideText ?? inputMessageRef.current ?? '').trim();
    if (!textToSend) return;
    setInputMessage('');
    setTranscript('');
    inputMessageRef.current = '';
    try {
      // append user message locally if store does not already contain it
      // sendMessage should update messages in store
      await sendMessage(textToSend);
      // after sending, speak the bot's reply when available (aiStore handles pushing bot message)
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleVoiceInput = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      setMicError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      try { rec.stop(); } catch (e) { console.warn(e); }
      setIsRecording(false);
      return;
    }

    try {
      setMicError('');
      rec.start();
      setIsRecording(true);
      setTranscript('');
    } catch (err) {
      console.warn('Could not start recognition', err);
      setIsRecording(false);
      setMicError('Unable to access the microphone. Please check your device and try again.');
    }
  };

  // Play TTS for the latest bot message
  const handleSpeak = (text) => {
    const synth = synthesisRef.current || window.speechSynthesis;
    if (!synth) return;
    try {
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 1;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      synth.speak(utter);
    } catch (e) {
      console.warn('TTS failed', e);
    }
  };

  const stopSpeaking = () => {
    const synth = synthesisRef.current || window.speechSynthesis;
    if (!synth) return;
    try { synth.cancel(); } catch (e) { console.warn(e); }
    setIsSpeaking(false);
  };

  // When messages update, auto-speak the last bot response
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last && last.sender === 'bot' && last.text) {
      // slight delay to ensure UI has rendered
      setTimeout(() => handleSpeak(last.text), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);
  return (
    <div className={`fixed z-[100] h-screen w-full pointer-events-none ${isDisplayCallCard || isDisplayChatCard ? 'bg-[#00000015] backdrop-blur-[3px]' : ''}`}>
      {/* buttons */}
      <div className="flex gap-1 absolute bottom-10 right-10 pointer-events-auto p-1 border-2 rounded-2xl border-blue-700  outline-blue-300 outline-3">
        <button
          className="p-2 bg-blue-300 rounded-2xl border-2 border-blue-600 hover:bg-blue-200 cursor-pointer active:translate-y-0.5 shadow-md"
          onClick={() => setIsDisplayChatCard(!isDisplayChatCard)}
        >
          <FcAssistant size={36} />
        </button>
        <button
          className="p-2 bg-blue-300 rounded-2xl border-2 border-blue-600 hover:bg-blue-200 cursor-pointer active:translate-y-0.5 shadow-md"
          onClick={() => setIsDisplayCallCard(!isDisplayCallCard)}
        >
          <PiPhoneCallFill size={36} />
        </button>
      </div>

      {/* chat card */}
      {isDisplayChatCard && (
        <div className='fixed bottom-30 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 pointer-events-auto flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out sm:w-96 xs:w-80'>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <FcAssistant className="text-white" size={26} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">AI Health Assistant</h3>
                  <p className="text-blue-100 text-sm">Ask me anything about your health</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Close chat"
                  className="p-2 rounded-full hover:bg-white/20 text-white"
                  onClick={() => {
                    stopSpeaking();
                    const rec = recognitionRef.current;
                    if (rec) {
                      try { rec.stop(); } catch (e) { console.warn(e); }
                    }
                    setIsDisplayChatCard(false);
                  }}
                >
                  <FiX />
                </button>
              </div>
            </div>
          </div>

          {/* Body - messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50" aria-live="polite">
            {(!messages || messages.length === 0) && (
              <div className="text-center text-gray-500 mt-8 space-y-3">
                <FcAssistant className="mx-auto text-4xl" />
                <p className="text-sm">Hello! I'm your AI health assistant. Try asking: "Find a doctor near me"</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">Book an appointment</button>
                  <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">Find a doctor</button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages && messages.map((m, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'bot' ? (
                    <>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <FcAssistant />
                        </div>
                      </div>
                      <div className="max-w-[80%]">
                        <div className="bg-white rounded-2xl p-3 shadow-sm text-gray-800 text-sm whitespace-pre-wrap">
                          {m.text}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="max-w-[80%]">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-3 shadow-sm text-white text-sm whitespace-pre-wrap">
                          {m.text}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                          {m.text?.trim()?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FcAssistant />
                  </div>
                  <div className="bg-white rounded-2xl p-3 shadow-sm text-gray-800 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce inline-block" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce inline-block delay-75" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce inline-block delay-150" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Footer - input */}
          <div className="border-t border-gray-200 bg-white p-4">
            {isRecording && (
              <div className="mb-2 text-sm italic text-gray-600 bg-blue-50 p-2 rounded">Listening... {transcript}</div>
            )}
            {micError && (
              <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {micError}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                aria-label="Type your message"
                type="text"
                placeholder="Type your message or use voice..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                disabled={isLoading || isRecording || isSpeaking}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />

              <button
                aria-label="Voice input"
                onClick={() => handleVoiceInput()}
                disabled={isLoading || isSpeaking}
                className={`p-3 rounded-xl ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {isRecording ? <FiMicOff /> : <FiMic />}
              </button>

              <button
                aria-label="Send message"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : <FiSend />}
              </button>
            </div>
            {isSpeaking && (
              <div className="mt-2 flex items-center justify-end">
                <button onClick={stopSpeaking} aria-label="Stop speaking" className="text-sm px-3 py-2 bg-red-500 text-white rounded">Stop Speaking <FiVolumeX className="inline ml-2" /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* call card */}
      {isDisplayCallCard && (
        <div className="absolute bottom-30 right-10 w-80 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <PiPhoneCallFill className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Emergency Call</h3>
                <p className="text-blue-100 text-sm">Connect with emergency services</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="bg-white p-6">
            <div className="space-y-4">
              {/* Name Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={callName}
                  onChange={(e) => setCallName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 placeholder:text-gray-400"
                />
              </div>

              {/* Phone Number Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={callNumber}
                  onChange={(e) => setCallNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 placeholder:text-gray-400"
                />
              </div>

              {/* Call Button */}
              <button 
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-6 group"
                disabled={!callName || !callNumber}
                onClick={()=>{
                  makeCall(callName, callNumber);
                  setCallName("");
                  setCallNumber("");
                }}
              >
                <IoMdCall className="group-hover:animate-bounce" size={20} />
                <span>Call Now</span>
              </button>

              {/* Info Text */}
              <p className="text-center text-xs text-gray-500 mt-3">
                Your call will be connected to emergency services
              </p>
            </div>
          </div>

          {/* Decorative Bottom Border */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        </div>
      )}
    </div>
  );
};

export default AiOverlay;
