'use client';

import React, { useState } from 'react';
import { TypingResult } from '@/app/types/dashboard';

interface TypingProgressBarChartProps {
  results: TypingResult[];
  height?: number;
}

export function TypingProgressBarChart({ results, height = 240 }: TypingProgressBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!results || results.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 rounded-lg text-center border border-dashed"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-subtle)',
          minHeight: height,
        }}
      >
      <svg className="w-8 h-8 mb-2 text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
        <p className="text-xs font-semibold text-primary mb-1">No Typing Progress Data Yet</p>
        <p className="text-[11px] text-tertiary max-w-xs">
          Complete a typing test in Typing Mode to view your WPM progress bar graph here!
        </p>
      </div>
    );
  }

  // Display up to 16 recent sessions in chronological order
  const displayResults = [...results].sort((a, b) => a.timestamp - b.timestamp).slice(-16);
  const wpms = displayResults.map((r) => r.wpm);
  const maxWpm = Math.max(...wpms, 60);
  const chartMaxY = Math.ceil(maxWpm / 20) * 20 + 10;
  const avgWpm = Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length);

  const svgWidth = 600;
  const svgHeight = height;
  const paddingLeft = 40;
  const paddingBottom = 35;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const barCount = displayResults.length;
  const totalGapSpace = chartWidth * 0.3;
  const barWidth = Math.min(36, (chartWidth - totalGapSpace) / barCount);
  const gap = (chartWidth - barWidth * barCount) / (barCount + 1);

  const yTicks = [0, 20, 40, 60, 80, 100, 120].filter((t) => t <= chartMaxY);

  return (
    <div className="w-full flex flex-col gap-2 relative">
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: 'var(--color-text-primary)' }}
            />
            <span className="text-[11px] font-medium text-secondary">Session WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5 inline-block border-t border-dashed"
              style={{ borderColor: 'var(--color-text-tertiary)' }}
            />
            <span className="text-[11px] font-medium text-tertiary">Avg ({avgWpm} WPM)</span>
          </div>
        </div>
        <span className="text-[10px] text-tertiary uppercase font-mono tracking-wider">
          {barCount} Test{barCount > 1 ? 's' : ''} Tracked
        </span>
      </div>

      <div
        className="w-full rounded-lg relative overflow-hidden p-2"
        style={{
          backgroundColor: 'var(--color-bg-page)',
          border: '1px solid var(--color-border)',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tick) => {
            const yPos = paddingTop + chartHeight - (tick / chartMaxY) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={svgWidth - paddingRight}
                  y2={yPos}
                  stroke="var(--color-border-subtle)"
                  strokeDasharray={tick === 0 ? undefined : '3,3'}
                  strokeWidth={1}
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--color-text-tertiary)"
                  fontFamily="var(--font-mono)"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Average Line */}
          {avgWpm > 0 && (
            <line
              x1={paddingLeft}
              y1={paddingTop + chartHeight - (avgWpm / chartMaxY) * chartHeight}
              x2={svgWidth - paddingRight}
              y2={paddingTop + chartHeight - (avgWpm / chartMaxY) * chartHeight}
              stroke="var(--color-text-tertiary)"
              strokeDasharray="4,4"
              strokeWidth={1.5}
            />
          )}

          {/* Bars */}
          {displayResults.map((item, idx) => {
            const barH = (item.wpm / chartMaxY) * chartHeight;
            const xPos = paddingLeft + gap + idx * (barWidth + gap);
            const yPos = paddingTop + chartHeight - barH;
            const isHovered = hoveredIdx === idx;

            const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <g
                key={item.id || idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-opacity duration-150"
                style={{ opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1 }}
              >
                {/* Invisible hover trigger area */}
                <rect
                  x={xPos - gap / 2}
                  y={paddingTop}
                  width={barWidth + gap}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                />

                {/* Main Bar */}
                <rect
                  x={xPos}
                  y={yPos}
                  width={barWidth}
                  height={Math.max(barH, 2)}
                  rx={3}
                  ry={3}
                  fill={isHovered ? 'var(--color-text-primary)' : 'var(--color-primary-dimmed)'}
                  stroke={isHovered ? 'var(--color-text-primary)' : 'none'}
                  strokeWidth={1}
                />

                {/* WPM value on top of bar */}
                <text
                  x={xPos + barWidth / 2}
                  y={Math.max(yPos - 6, paddingTop + 8)}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={isHovered ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}
                  fontFamily="var(--font-mono)"
                >
                  {item.wpm}
                </text>

                {/* X-axis Session Label */}
                <text
                  x={xPos + barWidth / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--color-text-tertiary)"
                  fontFamily="var(--font-mono)"
                >
                  #{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip when hovering over a bar */}
        {hoveredIdx !== null && displayResults[hoveredIdx] && (
          <div
            className="absolute top-3 right-3 p-2.5 rounded shadow-lg text-xs pointer-events-none z-10 animate-fade-in flex flex-col gap-1 border"
            style={{
              backgroundColor: 'var(--color-bg-widget)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div className="flex items-center justify-between gap-3 pb-1 border-b border-subtle">
              <span className="font-bold text-primary font-mono">
                {displayResults[hoveredIdx].wpm} WPM
              </span>
              <span className="text-[10px] text-tertiary font-mono">
                {displayResults[hoveredIdx].accuracy}% Acc
              </span>
            </div>
            <div className="text-[11px] text-secondary">
              Source: <span className="font-semibold">{displayResults[hoveredIdx].sourceCategory}</span>
            </div>
            <div className="text-[10px] text-tertiary truncate max-w-[200px]">
              {displayResults[hoveredIdx].sourceTitle}
            </div>
            <div className="text-[9px] text-tertiary font-mono pt-1">
              {new Date(displayResults[hoveredIdx].timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
