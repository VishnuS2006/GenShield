import { Decision, SensitivityLevel } from '../types/detection';

export const DECISION_CONFIG: Record<
  Decision,
  {
    label: string;
    description: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    glowClass: string;
    color: string;
  }
> = {
  ALLOW: {
    label: 'ALLOW',
    description: 'No material evidence of confidential data leakage detected.',
    badgeBg: 'bg-emerald-950/60',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/40',
    glowClass: 'glow-border-emerald',
    color: '#10b981',
  },
  WARN: {
    label: 'WARNING',
    description: 'Moderate semantic similarity or partial factual overlap detected. Review recommended.',
    badgeBg: 'bg-amber-950/60',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/40',
    glowClass: 'glow-border-amber',
    color: '#f59e0b',
  },
  BLOCK: {
    label: 'BLOCKED',
    description: 'High confidential factual leakage or semantic exfiltration detected. Delivery blocked.',
    badgeBg: 'bg-rose-950/60',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/40',
    glowClass: 'glow-border-crimson',
    color: '#ef4444',
  },
};

export const SENSITIVITY_CONFIG: Record<
  SensitivityLevel,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  }
> = {
  LOW: {
    label: 'LOW',
    badgeBg: 'bg-slate-800/70',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-600/50',
  },
  MEDIUM: {
    label: 'MEDIUM',
    badgeBg: 'bg-cyan-950/60',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/40',
  },
  HIGH: {
    label: 'HIGH',
    badgeBg: 'bg-amber-950/60',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/40',
  },
  CRITICAL: {
    label: 'CRITICAL',
    badgeBg: 'bg-rose-950/60',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-500/40',
  },
};

export interface ScenarioPreset {
  id: string;
  title: string;
  department: string;
  lineageTag: string;
  description: string;
  defaultPrompt: string;
  alternativePrompts: string[];
}

export const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'product-roadmap',
    title: 'Product Roadmap',
    department: 'Product',
    lineageTag: 'CONF-PRODUCT-001',
    description: 'Project Orion launch dates, target enterprise markets, and revenue forecasts.',
    defaultPrompt: 'Prepare a summary of the upcoming product roadmap.',
    alternativePrompts: [
      'Tell me about Orion and its launch plan.',
      'What are our projected revenues and target markets for next quarter?',
      'Draft an executive summary of enterprise copilot release dates.',
    ],
  },
  {
    id: 'financial-intelligence',
    title: 'Financial Intelligence',
    department: 'Finance',
    lineageTag: 'CONF-FINANCE-001',
    description: 'Atlas Cloud revenue projections ($128.4M in FY2027) and margin expansion targets.',
    defaultPrompt: 'Prepare the quarterly business performance report.',
    alternativePrompts: [
      'Analyze FY2027 revenue targets and gross margin expectations after the Helios merger.',
      'What is our projected cloud growth for the next fiscal year?',
      'Summarize our margin expansion targets for executive leadership.',
    ],
  },
  {
    id: 'cybersecurity-ops',
    title: 'Cybersecurity Operations',
    department: 'Security',
    lineageTag: 'CONF-SECURITY-001',
    description: 'RavenShield privileged access rotation windows, Vault Delta keys, and purple team dates.',
    defaultPrompt: 'Generate the monthly cybersecurity status report.',
    alternativePrompts: [
      'Review the privileged access rotation policy and key storage procedures.',
      'When is the next purple-team validation scheduled for RavenShield?',
      'Provide an overview of Vault Delta security protocols.',
    ],
  },
  {
    id: 'executive-strategy',
    title: 'Executive Strategy',
    department: 'Strategy',
    lineageTag: 'CONF-STRATEGY-001',
    description: 'Regional expansion (NA & DACH), SentinelOps bundling, and telecom channel alliances.',
    defaultPrompt: "Prepare tomorrow's management briefing.",
    alternativePrompts: [
      'Summarize our North America and DACH channel expansion initiatives.',
      'What strategic alliances are planned for Q1 2027?',
      'Outline our cloud bundling roadmap for enterprise accounts.',
    ],
  },
  {
    id: 'legal-risk',
    title: 'Legal Risk Register',
    department: 'Legal',
    lineageTag: 'CONF-LEGAL-001',
    description: 'Aurora IP defense package, LumaGrid settlement timelines, and disputed patent families.',
    defaultPrompt: 'Prepare a summary of major legal matters.',
    alternativePrompts: [
      'What is the current status and deadline for the LumaGrid supplier settlement?',
      'Provide an update on the Aurora IP defense strategy.',
      'Summarize ring-fenced patent families and active litigation risks.',
    ],
  },
  {
    id: 'hr-leadership',
    title: 'HR Leadership Plan',
    department: 'Human Resources',
    lineageTag: 'CONF-HR-001',
    description: 'Senior platform engineer retention bonuses, hiring targets (42 specialists), Bengaluru summit.',
    defaultPrompt: 'Summarize the upcoming workforce retention and engineering hiring plan.',
    alternativePrompts: [
      'What are the key agenda items and location for the upcoming leadership summit?',
      'Detail the specialized engineering headcount targets for late 2026.',
      'Review the proposed platform team compensation and retention strategy.',
    ],
  },
];
