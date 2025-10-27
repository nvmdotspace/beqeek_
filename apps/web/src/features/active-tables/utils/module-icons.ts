import {
  Users,
  UserCog,
  UserCircle,
  DollarSign,
  TrendingUp,
  Package,
  Database,
  Building2,
  GitBranch,
  FileText,
  Briefcase,
  Award,
  Receipt,
  ShieldCheck,
  Calculator,
  type LucideIcon,
} from 'lucide-react';

/**
 * Module type icon mapping
 * Maps module/table types to appropriate Lucide icons
 */
export const MODULE_ICONS = {
  // HRM / Employee Management
  hrm: Users,
  employee: Users,
  employees: Users,
  employeeprofile: UserCircle,
  team: Users,
  staff: Users,

  // Organization Structure
  department: Building2,
  departments: Building2,
  division: Building2,
  branch: Building2,

  // Work & Process
  workprocess: GitBranch,
  workflow: GitBranch,
  workflows: GitBranch,
  process: GitBranch,

  // Job & Career
  jobtitle: Briefcase,
  position: Briefcase,
  career: Briefcase,

  // CRM / Customer Management
  crm: UserCog,
  customer: UserCog,
  customers: UserCog,
  customerpipeline: TrendingUp,
  client: UserCog,
  clients: UserCog,
  contact: UserCog,
  contacts: UserCog,

  // Finance / Budget
  finance: DollarSign,
  budget: DollarSign,
  accounting: DollarSign,
  invoice: DollarSign,
  invoices: DollarSign,
  payment: DollarSign,
  payments: DollarSign,
  salarypolicy: DollarSign,
  salarysetup: Calculator,
  taxdeduction: Receipt,

  // Benefits & Policies
  benefitpolicy: Award,
  benefit: Award,
  benefits: Award,
  rewardpolicy: Award,
  reward: Award,
  rewards: Award,
  penalty: Award,
  insurancepolicy: ShieldCheck,
  insurance: ShieldCheck,

  // Documents & Contracts
  contract: FileText,
  contracts: FileText,
  document: FileText,
  documents: FileText,

  // Sales / Deals
  sales: TrendingUp,
  deal: TrendingUp,
  deals: TrendingUp,
  opportunity: TrendingUp,
  opportunities: TrendingUp,
  pipeline: TrendingUp,

  // Operations / Tasks
  operations: Package,
  operation: Package,
  task: Package,
  tasks: Package,
  project: Package,
  projects: Package,

  // Metrics & Analytics
  employeemonthlymetrics: TrendingUp,
  metrics: TrendingUp,
  analytics: TrendingUp,

  // Standard / Generic
  standard: Database,
  default: Database,
  generic: Database,
  table: Database,
  data: Database,
} as const;

/**
 * Module type color mapping
 * HSL colors for module type visual coding
 */
export const MODULE_COLORS = {
  // HRM / Employee - Blue
  hrm: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  employee: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  employeeprofile: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },

  // Organization - Slate
  department: {
    bg: 'bg-slate-100 dark:bg-slate-900/20',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
    hover: 'hover:bg-slate-50 dark:hover:bg-slate-900/30',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },

  // Work Process - Indigo
  workprocess: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  workflow: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },

  // Job & Career - Violet
  jobtitle: {
    bg: 'bg-violet-100 dark:bg-violet-900/20',
    text: 'text-violet-700 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
    hover: 'hover:bg-violet-50 dark:hover:bg-violet-900/30',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  },

  // CRM / Customer - Teal
  crm: {
    bg: 'bg-teal-100 dark:bg-teal-900/20',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    hover: 'hover:bg-teal-50 dark:hover:bg-teal-900/30',
    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  },
  customer: {
    bg: 'bg-teal-100 dark:bg-teal-900/20',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    hover: 'hover:bg-teal-50 dark:hover:bg-teal-900/30',
    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  },
  customerpipeline: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/30',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },

  // Finance / Budget - Amber
  finance: {
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  budget: {
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  salarypolicy: {
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  salarysetup: {
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  taxdeduction: {
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },

  // Benefits & Policies - Green
  benefitpolicy: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    hover: 'hover:bg-green-50 dark:hover:bg-green-900/30',
    badge: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  rewardpolicy: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    hover: 'hover:bg-green-50 dark:hover:bg-green-900/30',
    badge: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  penalty: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/30',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  insurancepolicy: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },

  // Documents - Slate
  contract: {
    bg: 'bg-slate-100 dark:bg-slate-900/20',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
    hover: 'hover:bg-slate-50 dark:hover:bg-slate-900/30',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },

  // Sales / Deals - Purple
  sales: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/30',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  deal: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/30',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },

  // Metrics - Purple
  employeemonthlymetrics: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/30',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },

  // Operations / Tasks - Rose
  operations: {
    bg: 'bg-rose-100 dark:bg-rose-900/20',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    hover: 'hover:bg-rose-50 dark:hover:bg-rose-900/30',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  task: {
    bg: 'bg-rose-100 dark:bg-rose-900/20',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    hover: 'hover:bg-rose-50 dark:hover:bg-rose-900/30',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },

  // Standard / Generic - Default
  standard: {
    bg: 'bg-secondary',
    text: 'text-secondary-foreground',
    border: 'border-border',
    hover: 'hover:bg-secondary/80',
    badge: 'bg-secondary text-secondary-foreground border-border',
  },
  default: {
    bg: 'bg-secondary',
    text: 'text-secondary-foreground',
    border: 'border-border',
    hover: 'hover:bg-secondary/80',
    badge: 'bg-secondary text-secondary-foreground border-border',
  },
} as const;

type ModuleType = keyof typeof MODULE_ICONS;
type ColorScheme = {
  bg: string;
  text: string;
  border: string;
  hover: string;
  badge: string;
};

/**
 * Get the icon component for a module type
 * Normalizes the input and returns the appropriate Lucide icon
 */
export const getModuleIcon = (moduleType?: string): LucideIcon => {
  if (!moduleType) return MODULE_ICONS.standard;

  // Normalize: lowercase, remove spaces/hyphens/underscores
  const normalized = moduleType
    .toLowerCase()
    .replace(/[\s_-]/g, '') as ModuleType;

  return MODULE_ICONS[normalized] || MODULE_ICONS.standard;
};

/**
 * Get the color scheme for a module type
 */
export const getModuleColors = (moduleType?: string): ColorScheme => {
  if (!moduleType) return MODULE_COLORS.standard;

  // Normalize: lowercase, remove spaces/hyphens/underscores
  const normalized = moduleType
    .toLowerCase()
    .replace(/[\s_-]/g, '') as keyof typeof MODULE_COLORS;

  return MODULE_COLORS[normalized] || MODULE_COLORS.standard;
};

/**
 * Get a formatted module type label
 * Converts "employee_management" -> "Employee Management"
 */
export const getModuleTypeLabel = (moduleType?: string): string => {
  if (!moduleType) return 'Standard';

  return moduleType
    .split(/[\s_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
