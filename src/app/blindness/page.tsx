"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Blindness() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [narration, setNarration] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const transcriptRef = useRef("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Setup spacebar listeners
  useEffect(() => {
    if (!narration) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If currently speaking/processing, spacebar cancels
      if (e.code === 'Space' && (isPlaying || isProcessing)) {
        e.preventDefault();
        cancelSpeech();
      }
      // If ready, spacebar starts recording
      else if (e.code === 'Space' && !isListening && !isPlaying && !isProcessing) {
        e.preventDefault();
        startListening();
      }
      // Block spacebar during recording
      else if (e.code === 'Space' && isListening) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Release spacebar while recording = stop and process
      if (e.code === 'Space' && isListening && !isProcessing) {
        e.preventDefault();
        stopListening();
      }
      // Block other spacebar releases
      else if (e.code === 'Space') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, isPlaying, narration, isProcessing]);

  const cancelSpeech = () => {
    console.log("Canceling speech");
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsProcessing(false);
    setCurrentResponse("");
  };

  const speak = (text: string) => {
    return new Promise<void>((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => {
        console.log("Speech ended");
        setIsPlaying(false);
        setIsProcessing(false);
        setCurrentResponse("");
        resolve();
      };
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    });
  };

  const handlePlayAudio = async () => {
    if (!narration) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      setIsPlaying(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setCurrentTranscript("");
      transcriptRef.current = "";
      setCurrentResponse("🎤 Hold spacebar and speak...");
    };

    recognitionInstance.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript + interimTranscript;
      transcriptRef.current = fullTranscript; // Store in ref immediately
      setCurrentTranscript(fullTranscript);
      setCurrentResponse(`You're saying: ${fullTranscript}`);
      console.log("Current transcript:", fullTranscript);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
    recognitionInstance.start();
  };

  const stopListening = async () => {
    if (!recognition) {
      console.log("No recognition instance");
      return;
    }

    // Use ref for immediate access to transcript
    const transcript = transcriptRef.current.trim();
    console.log("Captured transcript from ref:", transcript);
    console.log("State transcript:", currentTranscript);

    recognition.stop();
    setIsListening(false);
    setRecognition(null);

    if (!transcript) {
      console.log("No transcript detected!");
      setCurrentResponse("No speech detected");
      setIsProcessing(false);
      return;
    }

    console.log("Starting processing for:", transcript);
    // Set processing state to disable keyboard
    setIsProcessing(true);
    setCurrentResponse(`⏳ Processing: "${transcript}"`);

    // Add user question to history
    const newHistory = [...conversationHistory, { role: 'user', content: transcript }];
    setConversationHistory(newHistory);

    // Get AI response
    try {
      console.log("Calling API with:", { question: transcript });
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: transcript,
          context: narration,
          conversationHistory: conversationHistory,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        setCurrentResponse(data.answer);
        setConversationHistory([...newHistory, { role: 'assistant', content: data.answer }]);
        console.log("Speaking answer:", data.answer);
        // Speak will handle setIsProcessing(false) when done
        await speak(data.answer);
      } else {
        setCurrentResponse('Failed to get response');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Conversation error:', error);
      setCurrentResponse('Sorry, I had trouble understanding that.');
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file first");
      return;
    }

    setLoading(true);
    setNarration("");

    try {
      // Step 1: Read PDF as base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);

      // Step 2: Call API to extract and narrate with Claude
      const response = await fetch("/api/narrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfBase64: base64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(`Failed to process PDF: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      setNarration(data.narration);

      // Auto-play the narration
      setTimeout(async () => {
        await speak(data.narration);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl border-l-4 border-blue-500 p-8 mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Visual Accessibility Assistant
                </h1>
                <p className="text-gray-600 text-lg mt-1">AI-powered conversational reading support</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-3">
              Upload any PDF document to receive an intelligent, conversational narration with full voice interaction.
              Ask questions, get clarifications, and engage with your content through natural conversation powered by advanced AI.
            </p>
          </div>

          <Card className="border-2 border-gray-200 shadow-xl bg-white">
          <CardHeader className="text-start border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-gray-900">Upload Your Document</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Upload a PDF to start your accessible reading experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="border-4 border-dashed border-blue-300 rounded-xl p-12 text-center bg-gradient-to-br from-blue-50 to-cyan-50 hover:border-blue-400 transition-colors">
              <div className="flex flex-col items-center gap-4">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="max-w-md"
                />
                {file && (
                  <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                    <span className="text-xl">✓</span> {file.name}
                  </p>
                )}
                <Button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg"
                >
                  {loading ? "Processing..." : "Upload & Start Reading"}
                </Button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-12 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-blue-900">Processing your PDF...</p>
                <p className="text-sm text-gray-600 mt-2">This may take a moment</p>
              </div>
            )}

            {narration && (
              <div className="mt-8 space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-300 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">Voice Interaction</h4>
                  </div>

                  {!isListening && !isProcessing && !isPlaying && (
                    <div className="bg-white rounded-lg p-5 border-2 border-blue-200">
                      <p className="text-base text-gray-700 mb-3">
                        Press and hold <kbd className="px-3 py-1.5 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg font-bold text-blue-700 shadow-sm">SPACEBAR</kbd> to ask a question
                      </p>
                      <p className="text-sm text-gray-600">Ask anything about the document content</p>
                    </div>
                  )}

                  {isListening && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-5 bg-red-50 rounded-xl border-3 border-red-400 shadow-lg">
                        <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-lg text-red-700">🔴 Recording Your Question...</span>
                      </div>
                      <p className="text-sm text-gray-700 text-center">
                        Release <kbd className="px-2 py-1 bg-white border-2 border-gray-400 rounded font-semibold text-xs">SPACEBAR</kbd> when done speaking
                      </p>
                    </div>
                  )}

                  {(isProcessing || isPlaying) && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-5 bg-green-50 rounded-xl border-3 border-green-400 shadow-lg">
                        <div className="w-5 h-5 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-bold text-lg text-green-700">🔊 AI Assistant Speaking...</span>
                      </div>
                      <p className="text-sm text-gray-700 text-center">
                        Press <kbd className="px-2 py-1 bg-white border-2 border-gray-400 rounded font-semibold text-xs">SPACEBAR</kbd> to interrupt
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white rounded-xl border-2 border-gray-300 shadow-md">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900">Document Narration</h3>
                    <Button
                      onClick={handlePlayAudio}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg"
                    >
                      {isPlaying ? "⏸ Stop Reading" : "▶ Play Full Narration"}
                    </Button>
                  </div>
                  <div className="text-lg leading-relaxed whitespace-pre-wrap text-gray-800 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                    {narration}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
