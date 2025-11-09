"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { FontSelector } from "./ui/fontSelector";
import { Geist, Atkinson_Hyperlegible } from "next/font/google";
import localFont from "next/font/local";
import { useEffect, useState } from "react";
import { Slider } from "./ui/slider";
import { Button } from "@/components/ui/button";
import { Home, Settings2 } from "lucide-react";
import Link from "next/link";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const atkinsonHyperlegible = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const openDyslexic = localFont({
  src: "../../public/fonts/OpenDyslexic-Regular.woff2",
});

export function AppSidebar() {
  const [font, setFont] = useState(atkinsonHyperlegible.className);
  const [spacing, setSpacing] = useState(1.5);

  // Apply letter spacing globally
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "custom-spacing";
    style.innerHTML = `
      body, p, h1, h2, h3, h4, span, div {
        letter-spacing: ${spacing}px !important;
      }
    `;
    const oldStyle = document.getElementById("custom-spacing");
    if (oldStyle) oldStyle.remove();
    document.head.appendChild(style);
    return () => {
      const remove = document.getElementById("custom-spacing");
      if (remove) remove.remove();
    };
  }, [spacing]);

  // Apply selected font
  useEffect(() => {
    document.body.classList.remove(
      geistSans.className,
      openDyslexic.className,
      atkinsonHyperlegible.className
    );
    if (font) document.body.classList.add(font);
  }, [font]);

  return (
    <Sidebar className="bg-white border-r-2 border-gray-200">
      <SidebarHeader className="py-4 px-4 border-b-2 border-gray-200">
        <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold shadow-lg">
          <Link href="/" className="flex items-center justify-center gap-2">
            <Home size={20} />
            Back to Home
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-2 pb-2">
          <Settings2 className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-bold text-gray-900">Reading Settings</h2>
        </div>

        {/* FONT */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-900 font-semibold text-base mb-3">
            Font Style
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <FontSelector
              fonts={[
                { label: "Atkinson Hyperlegible", value: atkinsonHyperlegible.className },
                { label: "OpenDyslexic", value: openDyslexic.className },
                { label: "Standard Sans", value: geistSans.className },
              ]}
              onChange={(font) => setFont(font)}
              defaultValue={atkinsonHyperlegible.className}
            />
          </SidebarGroupContent>
          <p className="text-xs text-gray-600 mt-2">
            Choose a font optimized for readability
          </p>
        </SidebarGroup>

        {/* LETTER SPACING */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-900 font-semibold text-base mb-3">
            Letter Spacing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={[spacing]}
              onValueChange={(val) => setSpacing(val[0])}
              className="mb-2"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700 font-medium">
                Current: {spacing}px
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSpacing(1.5)}
                className="text-xs"
              >
                Reset
              </Button>
            </div>
          </SidebarGroupContent>
          <p className="text-xs text-gray-600 mt-2">
            Adjust spacing between letters for comfort
          </p>
        </SidebarGroup>

        {/* INFO BOX */}
        <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>💡 Tip:</strong> Atkinson Hyperlegible font and moderate spacing work best for most readers with dyslexia.
          </p>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t-2 border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Accessibility-focused reading
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
