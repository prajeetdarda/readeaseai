"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Volume2, Upload, CheckCircle } from "lucide-react";
import Link from "next/link";
import localFont from "next/font/local";

// Dyslexia-friendly font
const openDyslexic = localFont({
  src: [
    {
      path: "../fonts/OpenDyslexic-Regular.woff2",
      weight: "400",
    },
  ],
  variable: "--font-dyslexic",
});

export default function DyslexiaPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsProcessing(true);

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.text) {
        sessionStorage.setItem("pdfText", data.text);
        window.location.href = "/processed";
      } else {
        console.error("Error parsing PDF:", data.error);
        alert("Error processing PDF. Please try again.");
      }
    } catch (err) {
      console.error("Error uploading PDF:", err);
      alert("Error uploading PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`${openDyslexic.variable} font-[var(--font-dyslexic)] min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-xl border-l-4 border-orange-500 p-8 mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <FileText className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Dyslexia Reading Support
              </h1>
              <p className="text-gray-600 text-lg mt-1">Clear, comfortable reading designed for dyslexia</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed mt-3">
            Upload any PDF and transform it into a dyslexia-friendly reading experience. Enjoy optimized fonts,
            adjustable spacing, color overlays, and text-to-speech support for comfortable, accessible reading.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* UPLOAD CARD */}
          <Card className="lg:col-span-2 border-2 border-gray-200 shadow-xl bg-white">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your PDF Document</h2>

              <div className="border-4 border-dashed border-orange-300 rounded-xl p-12 text-center bg-gradient-to-br from-orange-50 to-yellow-50 hover:border-orange-400 transition-colors mb-6">
                <div className="flex flex-col items-center gap-4">
                  <Upload className="w-16 h-16 text-orange-600" />
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="max-w-md text-base"
                  />
                  {selectedFile && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {selectedFile.name}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={handleProcess}
                    disabled={!selectedFile || isProcessing}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold text-lg rounded-xl shadow-lg"
                  >
                    {isProcessing ? "Processing..." : "Process & Start Reading"}
                  </Button>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-5 border-2 border-orange-200">
                <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Features
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>OpenDyslexic font for improved readability</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>Adjustable text spacing and line height</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>Color overlay options to reduce eye strain</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>Built-in text-to-speech support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>AI-powered text simplification</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* HOW IT WORKS CARD */}
          <Card className="border-2 border-gray-200 shadow-xl bg-white">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                How It Works
              </h3>
              <ol className="space-y-4 text-base text-gray-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                  <div>
                    <span className="font-semibold block">Upload PDF</span>
                    <span className="text-sm text-gray-600">Select your document to get started</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                  <div>
                    <span className="font-semibold block">AI Processing</span>
                    <span className="text-sm text-gray-600">Text is extracted and optimized</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                  <div>
                    <span className="font-semibold block">Customize Settings</span>
                    <span className="text-sm text-gray-600">Adjust reading level and preferences</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">4</span>
                  <div>
                    <span className="font-semibold block">Read Comfortably</span>
                    <span className="text-sm text-gray-600">Enjoy your dyslexia-friendly content</span>
                  </div>
                </li>
              </ol>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
