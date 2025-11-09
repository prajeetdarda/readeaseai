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
      <div className="flex justify-center items-center w-full min-h-screen p-4">
        <Card className="w-2/3 min-h-[66vh] border-2 bg-[#FFFAEF] text-[#020402]">
          <CardHeader className="text-start">
            <CardTitle className="text-4xl pb-8">Blindness Support</CardTitle>
            <CardDescription className="text-xl">
              Upload PDF for conversational narration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button onClick={handleUpload} disabled={loading || !file}>
                {loading ? "Processing..." : "Upload & Convert"}
              </Button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <p className="text-lg">Processing your PDF...</p>
              </div>
            )}

            {narration && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                  <h4 className="text-xl font-semibold mb-3">🎤 Push to Talk</h4>

                  {!isListening && !isProcessing && !isPlaying && (
                    <p className="text-sm text-gray-600 mb-4">
                      Press <kbd className="px-2 py-1 bg-white border rounded">SPACEBAR</kbd> to start recording
                    </p>
                  )}

                  {isListening && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded border-2 border-red-300">
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-medium text-red-700">🔴 Recording...</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Release <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">SPACEBAR</kbd> to send
                      </p>
                    </div>
                  )}

                  {(isProcessing || isPlaying) && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded border-2 border-green-300">
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium text-green-700">🔊 Speaking...</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">SPACEBAR</kbd> to cancel
                      </p>
                    </div>
                  )}

                  {/* {currentResponse && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <p className="text-sm text-gray-600 mb-1">Current:</p>
                      <p className="text-base">{currentResponse}</p>
                    </div>
                  )} */}

                  {/* {conversationHistory.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Conversation History:</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {conversationHistory.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded text-sm ${
                              msg.role === 'user'
                                ? 'bg-blue-100 text-right'
                                : 'bg-gray-100 text-left'
                            }`}
                          >
                            <span className="font-semibold">{msg.role === 'user' ? 'You: ' : 'AI: '}</span>
                            {msg.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold">Conversational Narration:</h3>
                    <Button onClick={handlePlayAudio} variant="outline">
                      {isPlaying ? "⏸ Stop Audio" : "▶ Play Audio"}
                    </Button>
                  </div>
                  <div className="text-lg leading-relaxed whitespace-pre-wrap">
                    {narration}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
