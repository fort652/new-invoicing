"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "app-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  const updateTheme = useMutation(api.users.updateTheme);
  
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    }
    return "light";
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Apply theme to DOM
  const applyTheme = (newTheme: Theme) => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Initialize theme from localStorage immediately
  useEffect(() => {
    applyTheme(theme);
    setIsInitialized(true);
  }, []);

  // Sync with database theme when user data loads
  useEffect(() => {
    if (isInitialized && currentUser?.theme && currentUser.theme !== theme) {
      // Database theme takes precedence over localStorage for cross-device sync
      setThemeState(currentUser.theme);
      applyTheme(currentUser.theme);
      localStorage.setItem(THEME_STORAGE_KEY, currentUser.theme);
    }
  }, [currentUser?.theme, isInitialized]);

  const setTheme = async (newTheme: Theme) => {
    // Optimistically update UI immediately
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Save to localStorage for instant persistence
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    
    // Save to database for cross-device sync
    if (currentUser) {
      try {
        await updateTheme({
          userId: currentUser._id,
          theme: newTheme,
        });
      } catch (error) {
        console.error("Failed to save theme to database:", error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
