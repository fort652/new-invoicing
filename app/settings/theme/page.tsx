"use client";

import { useUser } from "@clerk/nextjs";
import Navigation from "@/app/components/Navigation";
import PageHeader from "@/app/components/PageHeader";
import Link from "next/link";
import { useTheme } from "@/app/theme-provider";
import { useState, useEffect } from "react";

export default function ThemePage() {
  const { user } = useUser();
  const { theme, setTheme, customColors, setCustomColors } = useTheme();
  
  const [colors, setColors] = useState({
    background: "#ffffff",
    text: "#171717",
    button: "#2563eb",
  });

  useEffect(() => {
    if (customColors) {
      setColors(customColors);
    }
  }, [customColors]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <Link href="/settings" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 block">
          ← Back to Settings
        </Link>
        <PageHeader description="Choose your preferred color theme" />

        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Appearance</h3>
          
          <div className="space-y-4">
            <div
              onClick={() => setTheme("light")}
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                theme === "light"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Light Mode</h4>
                  <p className="text-gray-900 dark:text-gray-300 mt-1">
                    Classic light theme with bright backgrounds
                  </p>
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                  theme === "light" 
                    ? "border-blue-600 bg-blue-600" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {theme === "light" && (
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div
              onClick={() => setTheme("dark")}
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                theme === "dark"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Dark Mode</h4>
                  <p className="text-gray-900 dark:text-gray-300 mt-1">
                    Easy on the eyes with dark backgrounds
                  </p>
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                  theme === "dark" 
                    ? "border-blue-600 bg-blue-600" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {theme === "dark" && (
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-900 dark:text-gray-300">
              <strong>Current theme:</strong> {theme === "light" ? "Light Mode" : "Dark Mode"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow mt-8">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Custom Colors</h3>
          <p className="text-sm text-gray-900 dark:text-gray-300 mb-6">
            Personalize your app with custom colors for background, text, and buttons
          </p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={colors.background}
                  onChange={(e) => setColors({ ...colors, background: e.target.value })}
                  className="h-12 w-24 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.background}
                  onChange={(e) => setColors({ ...colors, background: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={colors.text}
                  onChange={(e) => setColors({ ...colors, text: e.target.value })}
                  className="h-12 w-24 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.text}
                  onChange={(e) => setColors({ ...colors, text: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700"
                  placeholder="#171717"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Button Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={colors.button}
                  onChange={(e) => setColors({ ...colors, button: e.target.value })}
                  className="h-12 w-24 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.button}
                  onChange={(e) => setColors({ ...colors, button: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700"
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setCustomColors(colors)}
                className="rounded-lg px-6 py-2 text-white font-medium"
                style={{ backgroundColor: colors.button }}
              >
                Apply Custom Colors
              </button>
              <button
                onClick={() => {
                  const defaultColors = {
                    background: "#ffffff",
                    text: "#171717",
                    button: "#2563eb",
                  };
                  setColors(defaultColors);
                  setCustomColors(defaultColors);
                }}
                className="rounded-lg border-2 border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Reset to Default
              </button>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
              <p className="font-medium mb-2" style={{ color: colors.text }}>
                Preview
              </p>
              <p className="text-sm mb-3" style={{ color: colors.text }}>
                This is how your custom colors will look in the app.
              </p>
              <button
                className="rounded-lg px-4 py-2 text-white text-sm font-medium"
                style={{ backgroundColor: colors.button }}
              >
                Sample Button
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
