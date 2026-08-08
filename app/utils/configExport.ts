import { DashboardConfig } from '@/app/types/dashboard';

/**
 * Downloads the active DashboardConfig as a formatted JSON file.
 */
export function downloadDashboardConfig(config: DashboardConfig, filename = 'dak-dashboard-config.json') {
  if (typeof window === 'undefined') return;

  const jsonStr = JSON.stringify(config, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validates whether an imported object conforms to basic DashboardConfig requirements.
 */
export function validateDashboardConfig(parsed: any): parsed is DashboardConfig {
  if (!parsed || typeof parsed !== 'object') return false;
  if (!Array.isArray(parsed.pages)) return false;
  return parsed.pages.every((p: any) => typeof p.name === 'string' && Array.isArray(p.columns));
}
