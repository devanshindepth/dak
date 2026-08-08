'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig, ThemePreset } from '@/app/types/dashboard';

interface ThemeContextType {
  currentPreset: 'snow' | 'slate';
  setPreset: (presetName: 'snow' | 'slate') => void;
  presets: Record<string, ThemePreset>;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  config?: ThemeConfig;
  children: React.ReactNode;
}

const DAK_PRESETS: Record<'snow' | 'slate', ThemePreset> = {
  slate: {
    light: false,
    backgroundColor: '240 10 4',
    primaryColor: '0 0 98',
    positiveColor: '142 71 45',
    negativeColor: '0 84 60',
    contrastMultiplier: 1.3,
  },
  snow: {
    light: true,
    backgroundColor: '0 0 98',
    primaryColor: '0 0 5',
    positiveColor: '142 71 35',
    negativeColor: '0 84 50',
    contrastMultiplier: 1.2,
  },
};

function applyThemePreset(preset: ThemePreset, isLight: boolean) {
  const root = document.documentElement;

  if (preset.backgroundColor) {
    const [h, s, l] = preset.backgroundColor.split(' ');
    root.style.setProperty('--bg-h', h || '0');
    root.style.setProperty('--bg-s', s ? `${s}%` : '0%');
    root.style.setProperty('--bg-l', l ? `${l}%` : '4%');
  }

  if (preset.primaryColor) {
    const [h, s, l] = preset.primaryColor.split(' ');
    root.style.setProperty('--primary-h', h || '0');
    root.style.setProperty('--primary-s', s ? `${s}%` : '0%');
    root.style.setProperty('--primary-l', l ? `${l}%` : '98%');
  }

  if (preset.positiveColor) {
    const [h, s, l] = preset.positiveColor.split(' ');
    root.style.setProperty('--positive-h', h || '142');
    root.style.setProperty('--positive-s', s ? `${s}%` : '71%');
    root.style.setProperty('--positive-l', l ? `${l}%` : '45%');
  }

  if (preset.negativeColor) {
    const [h, s, l] = preset.negativeColor.split(' ');
    root.style.setProperty('--negative-h', h || '0');
    root.style.setProperty('--negative-s', s ? `${s}%` : '84%');
    root.style.setProperty('--negative-l', l ? `${l}%` : '60%');
  }

  if (preset.contrastMultiplier !== undefined) {
    root.style.setProperty('--contrast', String(preset.contrastMultiplier));
  }

  if (isLight) {
    root.setAttribute('data-theme-light', 'true');
  } else {
    root.removeAttribute('data-theme-light');
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentPreset, setCurrentPresetState] = useState<'snow' | 'slate'>('slate');

  useEffect(() => {
    const saved = localStorage.getItem('dak-theme-preset') as 'snow' | 'slate';
    if (saved && DAK_PRESETS[saved]) {
      setCurrentPresetState(saved);
    }
  }, []);

  const setPreset = (presetName: 'snow' | 'slate') => {
    if (DAK_PRESETS[presetName]) {
      setCurrentPresetState(presetName);
      localStorage.setItem('dak-theme-preset', presetName);
    }
  };

  const activePresetConfig = DAK_PRESETS[currentPreset];
  const isLight = Boolean(activePresetConfig.light);

  useEffect(() => {
    applyThemePreset(activePresetConfig, isLight);
  }, [currentPreset, activePresetConfig, isLight]);

  return (
    <ThemeContext.Provider
      value={{
        currentPreset,
        setPreset,
        presets: DAK_PRESETS,
        isLight,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
