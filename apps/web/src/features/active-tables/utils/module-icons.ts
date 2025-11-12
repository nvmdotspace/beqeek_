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
 * Uses Atlassian-inspired semantic color tokens for consistent theming
 */
export const MODULE_COLORS = {
  // HRM / Employee - Blue (accent-blue)
  hrm: {
    bg: 'bg-accent-blue-subtle',
    text: 'text-accent-blue',
    border: 'border-accent-blue/20',
    hover: 'hover:bg-accent-blue-subtle/80',
    badge: 'bg-accent-blue-subtle text-accent-blue-subtle-foreground border-accent-blue/20',
  },
  employee: {
    bg: 'bg-accent-blue-subtle',
    text: 'text-accent-blue',
    border: 'border-accent-blue/20',
    hover: 'hover:bg-accent-blue-subtle/80',
    badge: 'bg-accent-blue-subtle text-accent-blue-subtle-foreground border-accent-blue/20',
  },
  employeeprofile: {
    bg: 'bg-accent-blue-subtle',
    text: 'text-accent-blue',
    border: 'border-accent-blue/20',
    hover: 'hover:bg-accent-blue-subtle/80',
    badge: 'bg-accent-blue-subtle text-accent-blue-subtle-foreground border-accent-blue/20',
  },

  // Organization - Muted/Secondary
  department: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    hover: 'hover:bg-muted/80',
    badge: 'bg-muted text-muted-foreground border-border',
  },

  // Work Process - Purple (accent-purple)
  workprocess: {
    bg: 'bg-accent-purple-subtle',
    text: 'text-accent-purple',
    border: 'border-accent-purple/20',
    hover: 'hover:bg-accent-purple-subtle/80',
    badge: 'bg-accent-purple-subtle text-accent-purple-subtle-foreground border-accent-purple/20',
  },
  workflow: {
    bg: 'bg-accent-purple-subtle',
    text: 'text-accent-purple',
    border: 'border-accent-purple/20',
    hover: 'hover:bg-accent-purple-subtle/80',
    badge: 'bg-accent-purple-subtle text-accent-purple-subtle-foreground border-accent-purple/20',
  },

  // Job & Career - Muted/Secondary
  jobtitle: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    hover: 'hover:bg-muted/80',
    badge: 'bg-muted text-muted-foreground border-border',
  },

  // CRM / Customer - Teal (accent-teal)
  crm: {
    bg: 'bg-accent-teal-subtle',
    text: 'text-accent-teal',
    border: 'border-accent-teal/20',
    hover: 'hover:bg-accent-teal-subtle/80',
    badge: 'bg-accent-teal-subtle text-accent-teal-subtle-foreground border-accent-teal/20',
  },
  customer: {
    bg: 'bg-accent-teal-subtle',
    text: 'text-accent-teal',
    border: 'border-accent-teal/20',
    hover: 'hover:bg-accent-teal-subtle/80',
    badge: 'bg-accent-teal-subtle text-accent-teal-subtle-foreground border-accent-teal/20',
  },
  customerpipeline: {
    bg: 'bg-accent-purple-subtle',
    text: 'text-accent-purple',
    border: 'border-accent-purple/20',
    hover: 'hover:bg-accent-purple-subtle/80',
    badge: 'bg-accent-purple-subtle text-accent-purple-subtle-foreground border-accent-purple/20',
  },

  // Finance / Budget - Orange (accent-orange)
  finance: {
    bg: 'bg-accent-orange-subtle',
    text: 'text-accent-orange',
    border: 'border-accent-orange/20',
    hover: 'hover:bg-accent-orange-subtle/80',
    badge: 'bg-accent-orange-subtle text-accent-orange-subtle-foreground border-accent-orange/20',
  },
  budget: {
    bg: 'bg-accent-orange-subtle',
    text: 'text-accent-orange',
    border: 'border-accent-orange/20',
    hover: 'hover:bg-accent-orange-subtle/80',
    badge: 'bg-accent-orange-subtle text-accent-orange-subtle-foreground border-accent-orange/20',
  },
  salarypolicy: {
    bg: 'bg-accent-orange-subtle',
    text: 'text-accent-orange',
    border: 'border-accent-orange/20',
    hover: 'hover:bg-accent-orange-subtle/80',
    badge: 'bg-accent-orange-subtle text-accent-orange-subtle-foreground border-accent-orange/20',
  },
  salarysetup: {
    bg: 'bg-accent-orange-subtle',
    text: 'text-accent-orange',
    border: 'border-accent-orange/20',
    hover: 'hover:bg-accent-orange-subtle/80',
    badge: 'bg-accent-orange-subtle text-accent-orange-subtle-foreground border-accent-orange/20',
  },
  taxdeduction: {
    bg: 'bg-accent-orange-subtle',
    text: 'text-accent-orange',
    border: 'border-accent-orange/20',
    hover: 'hover:bg-accent-orange-subtle/80',
    badge: 'bg-accent-orange-subtle text-accent-orange-subtle-foreground border-accent-orange/20',
  },

  // Benefits & Policies - Green (accent-green)
  benefitpolicy: {
    bg: 'bg-accent-green-subtle',
    text: 'text-accent-green',
    border: 'border-accent-green/20',
    hover: 'hover:bg-accent-green-subtle/80',
    badge: 'bg-accent-green-subtle text-accent-green-subtle-foreground border-accent-green/20',
  },
  rewardpolicy: {
    bg: 'bg-accent-green-subtle',
    text: 'text-accent-green',
    border: 'border-accent-green/20',
    hover: 'hover:bg-accent-green-subtle/80',
    badge: 'bg-accent-green-subtle text-accent-green-subtle-foreground border-accent-green/20',
  },
  penalty: {
    bg: 'bg-accent-orange-subtle',
    text: 'text-accent-orange',
    border: 'border-accent-orange/20',
    hover: 'hover:bg-accent-orange-subtle/80',
    badge: 'bg-accent-orange-subtle text-accent-orange-subtle-foreground border-accent-orange/20',
  },
  insurancepolicy: {
    bg: 'bg-accent-green-subtle',
    text: 'text-accent-green',
    border: 'border-accent-green/20',
    hover: 'hover:bg-accent-green-subtle/80',
    badge: 'bg-accent-green-subtle text-accent-green-subtle-foreground border-accent-green/20',
  },

  // Documents - Muted/Secondary
  contract: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    hover: 'hover:bg-muted/80',
    badge: 'bg-muted text-muted-foreground border-border',
  },

  // Sales / Deals - Purple (accent-purple)
  sales: {
    bg: 'bg-accent-purple-subtle',
    text: 'text-accent-purple',
    border: 'border-accent-purple/20',
    hover: 'hover:bg-accent-purple-subtle/80',
    badge: 'bg-accent-purple-subtle text-accent-purple-subtle-foreground border-accent-purple/20',
  },
  deal: {
    bg: 'bg-accent-purple-subtle',
    text: 'text-accent-purple',
    border: 'border-accent-purple/20',
    hover: 'hover:bg-accent-purple-subtle/80',
    badge: 'bg-accent-purple-subtle text-accent-purple-subtle-foreground border-accent-purple/20',
  },

  // Metrics - Purple (accent-purple)
  employeemonthlymetrics: {
    bg: 'bg-accent-purple-subtle',
    text: 'text-accent-purple',
    border: 'border-accent-purple/20',
    hover: 'hover:bg-accent-purple-subtle/80',
    badge: 'bg-accent-purple-subtle text-accent-purple-subtle-foreground border-accent-purple/20',
  },

  // Operations / Tasks - Magenta (accent-magenta)
  operations: {
    bg: 'bg-accent-magenta-subtle',
    text: 'text-accent-magenta',
    border: 'border-accent-magenta/20',
    hover: 'hover:bg-accent-magenta-subtle/80',
    badge: 'bg-accent-magenta-subtle text-accent-magenta-subtle-foreground border-accent-magenta/20',
  },
  task: {
    bg: 'bg-accent-magenta-subtle',
    text: 'text-accent-magenta',
    border: 'border-accent-magenta/20',
    hover: 'hover:bg-accent-magenta-subtle/80',
    badge: 'bg-accent-magenta-subtle text-accent-magenta-subtle-foreground border-accent-magenta/20',
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
  const normalized = moduleType.toLowerCase().replace(/[\s_-]/g, '') as ModuleType;

  return MODULE_ICONS[normalized] || MODULE_ICONS.standard;
};

/**
 * Get the color scheme for a module type
 */
export const getModuleColors = (moduleType?: string): ColorScheme => {
  if (!moduleType) return MODULE_COLORS.standard;

  // Normalize: lowercase, remove spaces/hyphens/underscores
  const normalized = moduleType.toLowerCase().replace(/[\s_-]/g, '') as keyof typeof MODULE_COLORS;

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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
