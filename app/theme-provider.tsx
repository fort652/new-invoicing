"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Theme = "light" | "dark";

type CustomColors = {
  background: string;
  text: string;
  button: string;
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customColors: CustomColors | null;
  setCustomColors: (colors: CustomColors) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  const updateTheme = useMutation(api.users.updateTheme);
  const updateCustomColors = useMutation(api.users.updateCustomColors);
  
  const [theme, setThemeState] = useState<Theme>("light");
  const [customColors, setCustomColorsState] = useState<CustomColors | null>(null);

  useEffect(() => {
    if (currentUser?.theme) {
      setThemeState(currentUser.theme);
      if (currentUser.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    if (currentUser?.customColors) {
      setCustomColorsState(currentUser.customColors);
      applyCustomColors(currentUser.customColors);
    }
  }, [currentUser?.theme, currentUser?.customColors]);

  const applyCustomColors = (colors: CustomColors) => {
    const root = document.documentElement;
    root.style.setProperty('--custom-bg', colors.background);
    root.style.setProperty('--custom-text', colors.text);
    root.style.setProperty('--custom-button', colors.button);
    document.body.classList.add('custom-colors');
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    if (currentUser) {
      await updateTheme({
        userId: currentUser._id,
        theme: newTheme,
      });
    }
  };

  const setCustomColors = async (colors: CustomColors) => {
    setCustomColorsState(colors);
    applyCustomColors(colors);
    
    if (currentUser) {
      await updateCustomColors({
        userId: currentUser._id,
        customColors: colors,
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customColors, setCustomColors }}>
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
