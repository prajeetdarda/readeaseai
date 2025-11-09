"use client";
import { useState, useEffect } from "react";
import { Volume2, PauseCircle, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import localFont from "next/font/local";

// Load OpenDyslexic font (fallback to system sans-serif)
const openDyslexic = localFont({
  src: [
    {
      path: "../fonts/OpenDyslexic-Regular.woff2",
      weight: "400",
    },
  ],
  variable: "--font-dyslexic",
});

export default function Refined() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [refinedText, setRefinedText] = useState<string>("");
  const [defaultText, setDefaultText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [rephrased, setRephrased] = useState<string>("");
  const [level, setLevel] = useState<string>("moderate");
  const [loading, setLoading] = useState(true);
  const [activeColumn, setActiveColumn] = useState<"text" | "summary">("text");

  useEffect(() => {
    const savedText = sessionStorage.getItem("pdfText");
    if (!savedText) {
      setDefaultText("No text found. Please upload a PDF first.");
      setLoading(false);
      return;
    }

    setDefaultText(savedText);
    setRefinedText(savedText);

    const fetchRefinedText = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/levels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputText: savedText, readingLevel: level }),
        });
        if (!res.ok) throw new Error("Failed to process text");
        const data = await res.json();
        setSummary(data.summary || "");
        setRephrased(data.rephrased || savedText);
        setRefinedText(data.rephrased || savedText);
      } catch (error) {
        console.error("Error:", error);
        setSummary("Error processing text.");
      } finally {
        setLoading(false);
      }
    };

    fetchRefinedText();
  }, [level]);

  const playChunks = async (textToPlay?: string) => {
    const text = textToPlay || (activeColumn === "summary" ? summary : refinedText);
    if (isPlaying || !text) return;

    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);
      const data = await res.json();
      if (!data.base64Chunks) return;

      const playSequential = (i: number) => {
        if (i >= data.base64Chunks.length) {
          setIsPlaying(false);
          return;
        }
        const newAudio = new Audio(`data:audio/mp3;base64,${data.base64Chunks[i].base64}`);
        newAudio.play();
        newAudio.onended = () => playSequential(i + 1);
        setAudio(newAudio);
      };
      playSequential(0);
      setIsPlaying(true);
    } catch (e) {
      console.error(e);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      playChunks();
    }
  };

  const formatText = (t: string) =>
    t.split(/[.!?]+/).filter(Boolean).map((s, i) => (
      <p key={i} className="mb-6 leading-loose tracking-wide text-[20px]">
        {s.trim()}.
      </p>
    ));

  return (
    <div className={`${openDyslexic.variable} font-[var(--font-dyslexic)] min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-xl border-l-4 border-orange-500 p-8 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Volume2 className="w-10 h-10 text-orange-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  Dyslexia-Friendly Reader
                </h1>
                <p className="text-gray-600 text-lg mt-1">Optimized text for comfortable reading</p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-2 border-gray-300">
              <Link href="/dyslexia" className="flex items-center gap-2">
                <Home size={20} />
                Back to Upload
              </Link>
            </Button>
          </div>
          <p className="text-gray-700 leading-relaxed mt-3">
            Your document has been optimized for dyslexia-friendly reading with enhanced spacing, simplified text,
            and text-to-speech support. Choose your reading level and switch between full text and summary.
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Controls */}
        <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-orange-200 h-fit sticky top-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Reading Level
          </h2>
          <RadioGroup value={level} onValueChange={setLevel} disabled={loading} className="space-y-3">
            {[
              { value: "smallest", label: "Most Simplified", desc: "Very short sentences" },
              { value: "smaller", label: "Simplified", desc: "Short sentences" },
              { value: "moderate", label: "Standard", desc: "Normal sentences" }
            ].map((option) => (
              <div
                key={option.value}
                className={`flex items-start space-x-3 p-4 rounded-xl hover:bg-orange-50 transition-all border-2 cursor-pointer ${
                  level === option.value ? "bg-orange-100 border-orange-400" : "border-gray-200"
                }`}
              >
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <Label htmlFor={option.value} className="cursor-pointer flex-1">
                  <div className="font-semibold text-base text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{option.desc}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {loading && (
            <div className="mt-6 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Loader2 className="animate-spin text-blue-600" size={20} />
              <span className="text-sm text-blue-900 font-medium">Processing text...</span>
            </div>
          )}

          <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              💡 <strong>Tip:</strong> Start with "Most Simplified" and adjust based on comfort level.
            </p>
          </div>
        </div>

        {/* Reading Section */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-4">
            {[
              { key: "text", label: "Full Text", icon: "📄" },
              { key: "summary", label: "Summary", icon: "📝" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveColumn(tab.key as any)}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg shadow-md transition-all ${
                  activeColumn === tab.key
                    ? "bg-gradient-to-r from-orange-600 to-yellow-600 text-white"
                    : "bg-white border-2 border-gray-300 hover:bg-orange-50 text-gray-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div className="bg-white rounded-xl shadow-xl border-2 border-gray-300 overflow-hidden">
            <div className="px-8 py-6 border-b-2 border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeColumn === "text" ? "📖 Your Optimized Text" : "📋 Quick Summary"}
              </h2>
              <Button
                onClick={togglePlayPause}
                disabled={loading}
                size="lg"
                className={`gap-2 font-semibold text-base shadow-lg ${
                  isPlaying
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white"
                }`}
              >
                {isPlaying ? (
                  <>
                    <PauseCircle size={24} /> Stop Reading
                  </>
                ) : (
                  <>
                    <Volume2 size={24} /> Listen Aloud
                  </>
                )}
              </Button>
            </div>

            <div className="p-10 min-h-[60vh] max-h-[70vh] overflow-y-auto bg-gradient-to-br from-orange-50/30 to-yellow-50/30">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <Loader2 className="animate-spin text-orange-600" size={56} />
                  <p className="text-2xl font-semibold text-gray-700">Optimizing your text...</p>
                  <p className="text-base text-gray-600">This will just take a moment</p>
                </div>
              ) : (
                <div className="prose prose-xl max-w-none text-gray-900 font-medium">
                  {activeColumn === "text"
                    ? formatText(rephrased || refinedText || defaultText)
                    : formatText(summary)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
