"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, Eye, Brain, Focus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center min-h-screen w-full px-4 py-8 bg-gradient-to-b from-slate-50 to-white">
        {/* HERO SECTION */}
        <div className="flex flex-col items-center gap-4 py-8 max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              ReadEase AI
            </span>
          </h1>

          <h2 className="text-2xl font-semibold text-gray-800 mt-2">
            Empowering Everyone to Read with Confidence
          </h2>

          <p className="text-base text-gray-600 max-w-2xl leading-relaxed mt-1">
            AI-powered reading assistance tailored for individuals with dyslexia, visual impairments,
            autism, and ADHD. Transform any text into an accessible, personalized reading experience.
          </p>
        </div>

        {/* FEATURES SECTION */}
        <div className="mt-6 mb-12">
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">
            Choose Your Reading Mode
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Dyslexia Card */}
            <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 border-orange-500 bg-gradient-to-br from-orange-50 to-white">
              <Link href="/dyslexia" className="flex flex-col h-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Dyslexia Support</h4>
                </div>

                <p className="text-sm text-gray-700 mb-4 leading-relaxed flex-grow">
                  Specialized reading experience with optimized fonts, adjustable spacing, and color overlays. Designed to reduce reading difficulty and enhance comprehension for dyslexic readers.
                </p>

                <div className="flex flex-col gap-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>OpenDyslexic font support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>Customizable text spacing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>Color overlay options</span>
                  </div>
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm py-2">
                  Start Reading
                </Button>
              </Link>
            </Card>

            {/* Blindness Card */}
            <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-white">
              <Link href="/blindness" className="flex flex-col h-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Visual Support</h4>
                </div>

                <p className="text-sm text-gray-700 mb-4 leading-relaxed flex-grow">
                  Full accessibility with advanced text-to-speech capabilities and conversational AI assistant. Navigate and understand content through voice interaction.
                </p>

                <div className="flex flex-col gap-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Natural text-to-speech</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>AI conversational assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Voice navigation controls</span>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2">
                  Start Reading
                </Button>
              </Link>
            </Card>

            {/* Autism Card */}
            <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-white">
              <Link href="/autism" className="flex flex-col h-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Brain className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Autism Support</h4>
                </div>

                <p className="text-sm text-gray-700 mb-4 leading-relaxed flex-grow">
                  Structured reading environment with simplified text, visual supports, and predictable formatting. Reduces cognitive load and enhances comprehension.
                </p>

                <div className="flex flex-col gap-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Simplified text structure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Visual supports & icons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Predictable layout patterns</span>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700 text-sm py-2">
                  Start Reading
                </Button>
              </Link>
            </Card>

            {/* ADHD Card */}
            <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-white">
              <Link href="/adhd" className="flex flex-col h-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Focus className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">ADHD Support</h4>
                </div>

                <p className="text-sm text-gray-700 mb-4 leading-relaxed flex-grow">
                  Enhanced focus with chunked content, active highlighting, and attention management tools. Designed to maintain concentration and improve information retention.
                </p>

                <div className="flex flex-col gap-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Chunked content delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Active text highlighting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Focus mode & progress tracking</span>
                  </div>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm py-2">
                  Start Reading
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
