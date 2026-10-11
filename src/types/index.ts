export * from './database';

export interface NeedsAttentionResult {
  flag: boolean;
  reason: string | null;
}

export interface ContentCountSummary {
  planned: number;
  completed: number;
  remaining: number;
  progressPct: number | null;
}

export interface ProjectWithStats {
  project: import('./database').Project;
  stats: import('./database').ProjectStatsView;
  needsAttention: NeedsAttentionResult;
}
