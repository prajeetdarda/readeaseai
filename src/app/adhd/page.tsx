'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, BookOpen, Ear, Puzzle, Upload } from 'lucide-react';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState('adhd');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const modes = [
    {
      id: 'adhd',
      name: 'ADHD Focus Mode',
      icon: Brain,
      color: 'purple',
      desc: 'Content delivered in manageable chunks with focus-enhancing features, gamified elements, and strategic break reminders to maintain concentration and improve retention'
    },

  ];

  async function handleConvert() {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Please use a PDF smaller than 10MB');
      return;
    }

    setLoading(true);
    try {
      console.log('📄 Converting file:', file.name, 'Size:', file.size);
      
      const base64 = await fileToBase64(file);
      console.log('✅ Base64 conversion done, length:', base64.length);

      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, mode })
      });

      const data = await response.json();
      console.log('📡 Server response:', data);

      if (data.success) {
        sessionStorage.setItem('pdfContent', JSON.stringify(data));
        sessionStorage.setItem('pdfMode', mode);
        router.push('/reader');
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('💥 Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (!result) {
          reject(new Error('Failed to read file'));
          return;
        }
        resolve(result.split(',')[1]);
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  }

  const currentMode = modes.find(m => m.id === mode)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-xl shadow-xl border-l-4 border-purple-500 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-purple-100 rounded-xl flex-shrink-0">
              <Brain className="w-12 h-12 text-purple-600" />
            </div>
            <div className="flex-grow">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                ADHD Focus Assistant
              </h1>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Upload any PDF to receive an ADHD-optimized reading experience with chunked content, focus mode, interactive breaks, and gamified learning.
                Designed to maintain attention, reduce overwhelm, and improve information retention through bite-sized sections and active engagement.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Chunked content delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Focus-enhancing features</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Regular break reminders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Gamified learning elements</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border-t-4 border-pink-500 p-10">
          <h2 className="text-2xl font-bold text-purple-800 mb-8">Upload Your PDF Document</h2>

          <div className="border-4 border-dashed border-purple-300 rounded-xl p-16 text-center bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400 transition-colors">
            <Upload className="mx-auto mb-4 text-purple-600" size={72} />

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="pdf-upload"
            />

            <label
              htmlFor="pdf-upload"
              className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 inline-block transition-all shadow-lg hover:shadow-xl"
            >
              Choose PDF File
            </label>

            <p className="text-gray-600 mt-4 text-sm">Upload any educational or reading material</p>

            {file && (
              <div className="mt-6 bg-white rounded-lg p-5 shadow-sm inline-block">
                <p className="text-green-600 font-semibold text-lg flex items-center gap-2 justify-center">
                  <span className="text-2xl">✓</span> {file.name}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={handleConvert}
              disabled={loading}
              className={`w-full mt-8 py-5 rounded-xl font-bold text-xl transition-all shadow-lg ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full" />
                  Converting to {currentMode.name}...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>✨</span> Start ADHD-Optimized Reading
                </span>
              )}
            </button>
          )}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-block bg-white rounded-lg shadow-md px-6 py-3">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span className="text-lg">🔒</span> Your PDFs are processed securely and never stored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
