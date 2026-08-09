'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TypingResult } from '@/app/types/dashboard';
import { extractScreenPrompts, TextPrompt } from '@/app/utils/screenTextExtractor';
import { TypingProgressBarChart } from './TypingProgressBarChart';

interface TypingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TypingModeModal({ isOpen, onClose }: TypingModeModalProps) {
  const [activeTab, setActiveTab] = useState<'practice' | 'progress'>('practice');
  const [prompts, setPrompts] = useState<TextPrompt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPrompt, setCurrentPrompt] = useState<TextPrompt | null>(null);

  // Typing test state
  const [userInput, setUserInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [history, setHistory] = useState<TypingResult[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dak_typing_results');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load typing results history', e);
    }
  }, []);

  // Save history to localStorage
  const saveResult = (result: TypingResult) => {
    setHistory((prev) => {
      const updated = [result, ...prev];
      try {
        localStorage.setItem('dak_typing_results', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save typing result', e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('dak_typing_results');
    } catch (e) {
      console.error('Failed to clear typing history', e);
    }
  };

  // Extract prompts from DOM when modal opens
  useEffect(() => {
    if (isOpen) {
      const extracted = extractScreenPrompts();
      setPrompts(extracted);
      if (extracted.length > 0 && !currentPrompt) {
        setCurrentPrompt(extracted[0]);
      }
    }
  }, [isOpen]);

  // Focus input when modal opens or prompt resets
  useEffect(() => {
    if (isOpen && activeTab === 'practice' && !isCompleted) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, activeTab, currentPrompt, isCompleted]);

  // Continuous timer ticker while test is active
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (startTime && !isCompleted) {
      timer = setInterval(() => {
        setElapsedSeconds(Math.max(1, Math.round((Date.now() - startTime) / 1000)));
      }, 200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startTime, isCompleted]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [prompts]);

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    if (selectedCategory === 'All') return prompts;
    return prompts.filter((p) => p.category === selectedCategory);
  }, [prompts, selectedCategory]);

  // Handle category switch
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const matching = cat === 'All' ? prompts : prompts.filter((p) => p.category === cat);
    if (matching.length > 0) {
      setCurrentPrompt(matching[0]);
    }
    resetTest();
  };

  // Handle switching prompt
  const handleSelectPrompt = (prompt: TextPrompt) => {
    setCurrentPrompt(prompt);
    resetTest();
  };

  const handleNextRandomPrompt = () => {
    if (filteredPrompts.length === 0) return;
    const nextIdx = Math.floor(Math.random() * filteredPrompts.length);
    setCurrentPrompt(filteredPrompts[nextIdx]);
    resetTest();
  };

  const resetTest = () => {
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Typing logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompleted || !currentPrompt) return;

    const val = e.target.value;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setUserInput(val);

    // Check completion
    if (val.length >= currentPrompt.text.length) {
      const finishTime = Date.now();
      setEndTime(finishTime);
      setIsCompleted(true);

      // Compute stats
      const targetText = currentPrompt.text;
      let correctChars = 0;
      for (let i = 0; i < targetText.length; i++) {
        if (val[i] === targetText[i]) correctChars++;
      }

      const totalSecs = Math.max(1, (finishTime - (startTime || finishTime)) / 1000);
      setElapsedSeconds(Math.round(totalSecs));
      const wordsTyped = targetText.length / 5;
      const wpm = Math.round((wordsTyped / totalSecs) * 60);
      const cpm = Math.round((targetText.length / totalSecs) * 60);
      const accuracy = Math.round((correctChars / targetText.length) * 100);

      const result: TypingResult = {
        id: `res-${Date.now()}`,
        timestamp: finishTime,
        wpm: Math.max(0, wpm),
        accuracy,
        cpm,
        durationSeconds: Math.round(totalSecs),
        sourceCategory: currentPrompt.category,
        sourceTitle: currentPrompt.title,
      };

      saveResult(result);
    }
  };

  // Metrics computation during test
  const currentMetrics = useMemo(() => {
    if (!currentPrompt) return { wpm: 0, accuracy: 100, elapsed: 0, errors: 0 };
    const targetText = currentPrompt.text;
    let errors = 0;

    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== targetText[i]) errors++;
    }

    const correct = Math.max(0, userInput.length - errors);
    const accuracy = userInput.length > 0 ? Math.round((correct / userInput.length) * 100) : 100;

    const elapsed = isCompleted && endTime && startTime
      ? Math.max(1, Math.round((endTime - startTime) / 1000))
      : elapsedSeconds;

    const words = userInput.length / 5;
    const wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;

    return { wpm, accuracy, elapsed, errors };
  }, [userInput, currentPrompt, startTime, endTime, isCompleted, elapsedSeconds]);

  // Overall analytics stats
  const analyticsStats = useMemo(() => {
    if (history.length === 0) return { peakWpm: 0, avgWpm: 0, avgAccuracy: 0, totalTests: 0 };
    const peakWpm = Math.max(...history.map((h) => h.wpm));
    const avgWpm = Math.round(history.reduce((acc, h) => acc + h.wpm, 0) / history.length);
    const avgAccuracy = Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / history.length);
    return { peakWpm, avgWpm, avgAccuracy, totalTests: history.length };
  }, [history]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.88)' }}
      onClick={onClose}
    >
      <div
        className="max-w-3xl w-full p-6 relative rounded-xl shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-bg-widget)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-4 border-b"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-sm"
              style={{
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
              }}
            >
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
                Screen Typing Mode
              </h2>
              <p className="text-[11px] text-tertiary">
                Practice speed typing with live content from your dashboard
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center p-1 rounded-lg border text-xs"
              style={{
                backgroundColor: 'var(--color-bg-page)',
                borderColor: 'var(--color-border)',
              }}
            >
              <button
                onClick={() => setActiveTab('practice')}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  activeTab === 'practice'
                    ? 'bg-subtle text-primary shadow-sm font-semibold'
                    : 'text-tertiary hover:text-secondary'
                }`}
                style={
                  activeTab === 'practice'
                    ? { backgroundColor: 'var(--color-bg-subtle)' }
                    : {}
                }
              >
                Typing Practice
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`px-3 py-1 rounded font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'progress'
                    ? 'bg-subtle text-primary shadow-sm font-semibold'
                    : 'text-tertiary hover:text-secondary'
                }`}
                style={
                  activeTab === 'progress'
                    ? { backgroundColor: 'var(--color-bg-subtle)' }
                    : {}
                }
              >
                <span>Bar Graph</span>
                {history.length > 0 && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border bg-page">
                    {history.length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-tertiary hover:text-primary transition-colors text-base font-bold px-2 py-0.5 rounded cursor-pointer ml-2"
              aria-label="Close typing mode"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab 1: Typing Practice */}
        {activeTab === 'practice' && (
          <div className="flex flex-col gap-4">
            {/* Source Category Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-tertiary mr-1">Category:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-2.5 py-1 rounded text-[11px] transition-colors border cursor-pointer ${
                      selectedCategory === cat
                        ? 'text-primary font-bold border-primary'
                        : 'text-tertiary hover:text-secondary border-subtle'
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === cat
                          ? 'var(--color-bg-subtle)'
                          : 'var(--color-bg-page)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextRandomPrompt}
                className="px-2.5 py-1 rounded text-[11px] font-medium border text-secondary hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <svg className="w-3 h-3 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
                <span>Next Snippet</span>
              </button>
            </div>

            {/* Prompt Selector Dropdown if multiple */}
            {filteredPrompts.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] text-tertiary">Select Prompt:</span>
                <select
                  value={currentPrompt?.id || ''}
                  onChange={(e) => {
                    const found = prompts.find((p) => p.id === e.target.value);
                    if (found) handleSelectPrompt(found);
                  }}
                  className="w-full p-1.5 rounded text-xs border font-sans"
                  style={{
                    backgroundColor: 'var(--color-bg-page)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {filteredPrompts.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Live Metrics Header */}
            <div
              className="grid grid-cols-4 gap-3 p-3 rounded-lg border text-center font-mono"
              style={{
                backgroundColor: 'var(--color-bg-page)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div>
                <span className="text-[10px] uppercase text-tertiary block">WPM</span>
                <span className="text-xl font-bold text-primary">{currentMetrics.wpm}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-tertiary block">Accuracy</span>
                <span className="text-xl font-bold text-primary">{currentMetrics.accuracy}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-tertiary block">Time</span>
                <span className="text-xl font-bold text-primary">{currentMetrics.elapsed}s</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-tertiary block">Errors</span>
                <span className="text-xl font-bold text-primary">{currentMetrics.errors}</span>
              </div>
            </div>

            {/* Text Typing Display Area */}
            {currentPrompt && (
              <div
                className="p-5 rounded-lg border flex flex-col gap-3 relative cursor-text select-none min-h-[140px]"
                style={{
                  backgroundColor: 'var(--color-bg-page)',
                  borderColor: 'var(--color-border)',
                }}
                onClick={() => inputRef.current?.focus()}
              >
                <div className="flex items-center justify-between text-[11px] text-tertiary font-mono border-b pb-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span>Source: {currentPrompt.source || currentPrompt.category}</span>
                  <span>{currentPrompt.title}</span>
                </div>

                {/* Target text character visualizer */}
                <div className="text-base font-mono leading-relaxed tracking-wide font-normal break-words">
                  {currentPrompt.text.split('').map((char, idx) => {
                    const userChar = userInput[idx];
                    let isCorrect = true;
                    let isTyped = idx < userInput.length;
                    let isCursor = idx === userInput.length;

                    if (isTyped) {
                      isCorrect = userChar === char;
                    }

                    return (
                      <span
                        key={idx}
                        className={`transition-colors relative ${
                          isCursor
                            ? 'border-b-2 border-primary font-bold'
                            : ''
                        }`}
                        style={{
                          color: isTyped
                            ? isCorrect
                              ? 'var(--color-text-primary)'
                              : 'var(--color-negative)'
                            : 'var(--color-text-tertiary)',
                          backgroundColor: isTyped && !isCorrect ? 'rgba(255, 0, 0, 0.15)' : undefined,
                          textDecoration: isTyped && !isCorrect ? 'underline' : 'none',
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>

                {/* Hidden Input for capturing keyboard input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  disabled={isCompleted}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-default"
                  aria-label="Type here to practice typing"
                  autoFocus
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-tertiary">
                Click text box or start typing to begin test
              </span>
              <button
                onClick={resetTest}
                className="px-3 py-1.5 rounded text-xs font-semibold border text-primary hover:bg-subtle transition-colors cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                <span>Restart Test</span>
              </button>
            </div>

            {/* Test Completed Overlay Card */}
            {isCompleted && (
              <div
                className="p-5 rounded-xl border flex flex-col gap-4 animate-fade-in"
                style={{
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <div>
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                      <span>Test Completed</span>
                    </h3>
                    <p className="text-[11px] text-tertiary">
                      Great job! Your performance has been logged to your progress bar graph.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className="px-3 py-1.5 rounded text-xs font-semibold border text-primary bg-page hover:bg-subtle transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span>View Bar Graph</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center font-mono">
                  <div className="p-2 rounded bg-page border border-subtle">
                    <span className="text-[10px] text-tertiary uppercase block">Speed</span>
                    <span className="text-xl font-extrabold text-primary">{currentMetrics.wpm} WPM</span>
                  </div>
                  <div className="p-2 rounded bg-page border border-subtle">
                    <span className="text-[10px] text-tertiary uppercase block">Accuracy</span>
                    <span className="text-xl font-extrabold text-primary">{currentMetrics.accuracy}%</span>
                  </div>
                  <div className="p-2 rounded bg-page border border-subtle">
                    <span className="text-[10px] text-tertiary uppercase block">Duration</span>
                    <span className="text-xl font-extrabold text-primary">{currentMetrics.elapsed}s</span>
                  </div>
                  <div className="p-2 rounded bg-page border border-subtle">
                    <span className="text-[10px] text-tertiary uppercase block">CPM</span>
                    <span className="text-xl font-extrabold text-primary">
                      {Math.round((currentPrompt!.text.length / currentMetrics.elapsed) * 60)}
                    </span>
                  </div>
                </div>

                {/* Immediate Mini Bar Graph View */}
                <div className="mt-1">
                  <TypingProgressBarChart results={history} height={160} />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleNextRandomPrompt}
                    className="px-4 py-2 rounded text-xs font-bold border text-primary bg-page hover:bg-subtle transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="16 3 21 3 21 8" />
                      <line x1="4" y1="20" x2="21" y2="3" />
                      <polyline points="21 16 21 21 16 21" />
                      <line x1="15" y1="15" x2="21" y2="21" />
                      <line x1="4" y1="4" x2="9" y2="9" />
                    </svg>
                    <span>Next Prompt</span>
                  </button>
                  <button
                    onClick={resetTest}
                    className="px-4 py-2 rounded text-xs font-bold text-primary transition-colors cursor-pointer border flex items-center gap-1.5"
                    style={{
                      backgroundColor: 'var(--color-text-primary)',
                      color: 'var(--color-bg-page)',
                      borderColor: 'var(--color-text-primary)',
                    }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Typing Progress & Bar Graph Section */}
        {activeTab === 'progress' && (
          <div className="flex flex-col gap-5">
            {/* Overview Metric Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div
                className="p-3 rounded-lg border text-center flex flex-col items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-bg-page)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <span className="text-[10px] uppercase font-bold text-tertiary tracking-wider">
                  Peak Speed
                </span>
                <span className="text-2xl font-black font-mono text-primary mt-1">
                  {analyticsStats.peakWpm} <span className="text-xs font-normal text-tertiary">WPM</span>
                </span>
              </div>

              <div
                className="p-3 rounded-lg border text-center flex flex-col items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-bg-page)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <span className="text-[10px] uppercase font-bold text-tertiary tracking-wider">
                  Average Speed
                </span>
                <span className="text-2xl font-black font-mono text-primary mt-1">
                  {analyticsStats.avgWpm} <span className="text-xs font-normal text-tertiary">WPM</span>
                </span>
              </div>

              <div
                className="p-3 rounded-lg border text-center flex flex-col items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-bg-page)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <span className="text-[10px] uppercase font-bold text-tertiary tracking-wider">
                  Avg Accuracy
                </span>
                <span className="text-2xl font-black font-mono text-primary mt-1">
                  {analyticsStats.avgAccuracy}%
                </span>
              </div>

              <div
                className="p-3 rounded-lg border text-center flex flex-col items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-bg-page)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <span className="text-[10px] uppercase font-bold text-tertiary tracking-wider">
                  Total Tests
                </span>
                <span className="text-2xl font-black font-mono text-primary mt-1">
                  {analyticsStats.totalTests}
                </span>
              </div>
            </div>

            {/* Main Bar Graph Section */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
                WPM Performance Progress (Bar Graph)
              </h3>
              <TypingProgressBarChart results={history} height={240} />
            </div>

            {/* Session History Table */}
            {history.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Recent Test Sessions
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-[11px] text-tertiary hover:text-negative transition-colors underline cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>

                <div
                  className="rounded-lg border overflow-hidden text-xs"
                  style={{
                    backgroundColor: 'var(--color-bg-page)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <table className="w-full text-left border-collapse font-mono">
                    <thead>
                      <tr
                        className="text-[10px] uppercase text-tertiary border-b"
                        style={{
                          backgroundColor: 'var(--color-bg-subtle)',
                          borderColor: 'var(--color-border-subtle)',
                        }}
                      >
                        <th className="p-2.5">Date & Time</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5 text-right">WPM</th>
                        <th className="p-2.5 text-right">Accuracy</th>
                        <th className="p-2.5 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                      {history.slice(0, 8).map((item) => (
                        <tr key={item.id} className="hover:bg-subtle transition-colors">
                          <td className="p-2.5 text-secondary text-[11px]">
                            {new Date(item.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-2.5 font-sans font-medium text-primary">
                            {item.sourceCategory}
                          </td>
                          <td className="p-2.5 text-right font-bold text-primary">{item.wpm}</td>
                          <td className="p-2.5 text-right text-secondary">{item.accuracy}%</td>
                          <td className="p-2.5 text-right text-tertiary">{item.durationSeconds}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
