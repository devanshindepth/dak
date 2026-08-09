import { NextResponse } from 'next/server';

export interface BenchmarkModel {
  rank: number;
  model: string;
  score: string;
}

export interface BenchmarkResult {
  id: string;
  name: string;
  description: string;
  url: string;
  unit: string;
  models: BenchmarkModel[];
  updatedAt: string;
  sourceNote: string;
}

// All data sourced from official leaderboard pages (August 2026).
// Updated manually — no AI extraction, no scraping.
const BENCHMARKS: BenchmarkResult[] = [
  {
    id: 'terminal-bench',
    name: 'Terminal Bench',
    description: 'Agentic CLI & shell execution benchmark — resolution rate across terminal tasks',
    url: 'https://www.frontierbench.ai/',
    unit: '%',
    updatedAt: 'Aug 2026',
    sourceNote: 'frontierbench.ai (Terminal-Bench)',
    models: [
      { rank: 1, model: 'Claude Opus 5', score: '78.2' },
      { rank: 2, model: 'GPT-5.6 Sol', score: '76.5' },
      { rank: 3, model: 'Gemini 3 Pro', score: '75.9' },
      { rank: 4, model: 'Kimi K3', score: '74.8' },
      { rank: 5, model: 'DeepSeek V4 Flash 0731', score: '73.4' },
    ],
  },
  {
    id: 'artificial-analysis',
    name: 'Artificial Analysis',
    description: 'Artificial Analysis Intelligence Index v4.1.1 — composite benchmark across reasoning, coding, & omniscience',
    url: 'https://artificialanalysis.ai/',
    unit: ' pts',
    updatedAt: 'Aug 2026',
    sourceNote: 'artificialanalysis.ai — Intelligence Index v4.1.1',
    models: [
      { rank: 1, model: 'Claude Opus 5 (Adaptive Reasoning)', score: '142' },
      { rank: 2, model: 'GPT-5.6 Sol (Reasoning Max)', score: '139' },
      { rank: 3, model: 'Muse Spark 1.2 (xhigh)', score: '135' },
      { rank: 4, model: 'DeepSeek V4 Flash 0731 (Reasoning Max)', score: '50' },
      { rank: 5, model: 'Kimi K3', score: '128' },
    ],
  },
  {
    id: 'deepswe',
    name: 'DeepSWE',
    description: 'Long-horizon software engineering tasks across 113 original repos',
    url: 'https://deepswe.datacurve.ai',
    unit: '%',
    updatedAt: 'Aug 7, 2026',
    sourceNote: 'deepswe.datacurve.ai — official leaderboard (v1.1)',
    models: [
      { rank: 1, model: 'claude-opus-5 [max]', score: '74' },
      { rank: 2, model: 'gpt-5.6-sol [max]', score: '73' },
      { rank: 3, model: 'claude-fable-5 [max]', score: '70' },
      { rank: 4, model: 'gpt-5.6-terra [max]', score: '70' },
      { rank: 5, model: 'kimi-k3 [max]', score: '69' },
    ],
  },
  {
    id: 'toolathlon',
    name: 'Toolathlon-Verified',
    description: 'Multi-step tool use across 108 tasks spanning 32 apps and 604 tools',
    url: 'https://hkust.mintlify.app/docs/leaderboard',
    unit: '%',
    updatedAt: 'Aug 5, 2026',
    sourceNote: 'hkust.mintlify.app — official leaderboard',
    models: [
      { rank: 1, model: 'Kimi K3 (max)', score: '76.5' },
      { rank: 2, model: 'Claude Opus 4.8 (max)', score: '76.2' },
      { rank: 3, model: 'Muse Spark 1.2 (xhigh)', score: '75.9' },
      { rank: 4, model: 'Muse Spark 1.1 (xhigh)', score: '75.6' },
      { rank: 5, model: 'GPT-5.5 (xhigh)', score: '73.5' },
    ],
  },
  {
    id: 'nl2repo',
    name: 'NL2Repo',
    description: 'Long-horizon repository-level understanding & 0-to-1 repository generation',
    url: 'https://llm-stats.com/benchmarks/nl2repo',
    unit: '',
    updatedAt: 'Aug 8, 2026',
    sourceNote: 'llm-stats.com/benchmarks/nl2repo (ZeroEval API)',
    models: [
      { rank: 1, model: 'Qwen3.8 Max', score: '0.559' },
      { rank: 2, model: 'DeepSeek-V4-Flash-0731', score: '0.542' },
      { rank: 3, model: 'GLM-5.2', score: '0.489' },
      { rank: 4, model: 'Qwen3.7 Max', score: '0.472' },
      { rank: 5, model: 'Seed 2.1 Pro', score: '0.470' },
    ],
  },
  {
    id: 'agents-last-exam',
    name: "Agents' Last Exam",
    description: "UC Berkeley RDI benchmark evaluating AI agents on real-world professional workflows across 55 occupations",
    url: 'https://agents-last-exam.org/leaderboard',
    unit: '%',
    updatedAt: 'Aug 2026',
    sourceNote: 'agents-last-exam.org (ALE-V1)',
    models: [
      { rank: 1, model: 'Claude Fable 5 Max', score: '14.2' },
      { rank: 2, model: 'GPT-5.5 (High Effort)', score: '12.8' },
      { rank: 3, model: 'Gemini 3 Pro (xhigh)', score: '11.5' },
      { rank: 4, model: 'Composer 2.5', score: '9.6' },
      { rank: 5, model: 'DeepSeek V4 Flash', score: '8.4' },
    ],
  },
  {
    id: 'dsbench-hard',
    name: 'DSBench-Hard',
    description: 'DeepSeek internal test set of difficult coding-agent & data modeling problems',
    url: 'https://llm-stats.com/benchmarks/dsbench-hard',
    unit: '',
    updatedAt: 'Aug 8, 2026',
    sourceNote: 'llm-stats.com / zeroeval API',
    models: [
      { rank: 1, model: 'DeepSeek-V4-Flash-0731', score: '0.596' },
    ],
  },
  {
    id: 'livebench',
    name: 'LiveBench',
    description: 'Contamination-free benchmark — 23 tasks across 7 categories, refreshed every 6 months',
    url: 'https://livebench.ai',
    unit: '',
    updatedAt: 'Jun 25, 2026',
    sourceNote: 'livebench.ai — release 2026-06-25 (latest)',
    models: [
      { rank: 1, model: 'Claude Fable 5 Max', score: '83.0' },
      { rank: 2, model: 'GPT-5.6 Sol Max', score: '81.0' },
      { rank: 3, model: 'GPT-5.5 Thinking xHigh', score: '80.2' },
      { rank: 4, model: 'Claude 5 Opus Max', score: '80.1' },
      { rank: 5, model: 'Kimi K3', score: '79.2' },
    ],
  },
];

export async function GET() {
  return NextResponse.json(BENCHMARKS);
}
