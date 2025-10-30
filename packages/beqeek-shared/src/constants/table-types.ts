/**
 * Table Type Constants
 *
 * Defines all available table types (templates) for Active Tables.
 * Each type represents a pre-configured template with specific fields and configurations.
 *
 * Based on tableTypes from active-tables.blade.php
 */

/**
 * Available table types
 */
export const TABLE_TYPE_BLANK = 'BLANK' as const;
export const TABLE_TYPE_TASK_EISENHOWER = 'TASK_EISENHOWER' as const;
export const TABLE_TYPE_CONTRACT = 'CONTRACT' as const;
export const TABLE_TYPE_HAIR_SALON_CUSTOMER = 'HAIR_SALON_CUSTOMER' as const;
export const TABLE_TYPE_PROTOTYPE = 'PROTOTYPE' as const;
export const TABLE_TYPE_INSIGHT_TTM = 'INSIGHT_TTM' as const;
export const TABLE_TYPE_CONTENT_SCRIPT_MANAGEMENT = 'CONTENT_SCRIPT_MANAGEMENT' as const;
export const TABLE_TYPE_SWOT_EVALUATION = 'SWOT_EVALUATION' as const;
export const TABLE_TYPE_SCAMPER = 'SCAMPER' as const;
export const TABLE_TYPE_HERZBERG_FACTOR = 'HERZBERG_FACTOR' as const;
export const TABLE_TYPE_ONBOARDING = 'ONBOARDING' as const;
export const TABLE_TYPE_CUSTOMER_PIPELINE = 'CUSTOMER_PIPELINE' as const;
export const TABLE_TYPE_VENDOR_MANAGEMENT = 'VENDOR_MANAGEMENT' as const;
export const TABLE_TYPE_ASSET_MANAGEMENT = 'ASSET_MANAGEMENT' as const;
export const TABLE_TYPE_TRAINING_PROGRAM = 'TRAINING_PROGRAM' as const;
export const TABLE_TYPE_LEARNING_PROGRESS = 'LEARNING_PROGRESS' as const;
export const TABLE_TYPE_CULTURE_MANAGEMENT = 'CULTURE_MANAGEMENT' as const;
export const TABLE_TYPE_CULTURE_PROGRAM_REGISTRATION = 'CULTURE_PROGRAM_REGISTRATION' as const;
export const TABLE_TYPE_BENEFIT_POLICY = 'BENEFIT_POLICY' as const;
export const TABLE_TYPE_TAX_DEDUCTION = 'TAX_DEDUCTION' as const;
export const TABLE_TYPE_WORK_PROCESS = 'WORK_PROCESS' as const;
export const TABLE_TYPE_DEPARTMENT = 'DEPARTMENT' as const;
export const TABLE_TYPE_JOB_TITLE = 'JOB_TITLE' as const;
export const TABLE_TYPE_EMPLOYEE_PROFILE = 'EMPLOYEE_PROFILE' as const;
export const TABLE_TYPE_BENEFIT_MANAGEMENT = 'BENEFIT_MANAGEMENT' as const;
export const TABLE_TYPE_BENEFIT_PROGRAM_PARTICIPANT = 'BENEFIT_PROGRAM_PARTICIPANT' as const;
export const TABLE_TYPE_TIME_OFF_RECORD_MANAGEMENT = 'TIME_OFF_RECORD_MANAGEMENT' as const;
export const TABLE_TYPE_APPROVAL_REQUEST = 'APPROVAL_REQUEST' as const;
export const TABLE_TYPE_LEAVE_POLICY = 'LEAVE_POLICY' as const;
export const TABLE_TYPE_INSURANCE_POLICY = 'INSURANCE_POLICY' as const;
export const TABLE_TYPE_REWARD_POLICY = 'REWARD_POLICY' as const;
export const TABLE_TYPE_PENALTY = 'PENALTY' as const;
export const TABLE_TYPE_EMPLOYEE_MONTHLY_METRICS = 'EMPLOYEE_MONTHLY_METRICS' as const;
export const TABLE_TYPE_SALARY_POLICY = 'SALARY_POLICY' as const;
export const TABLE_TYPE_SALARY_SETUP = 'SALARY_SETUP' as const;

/**
 * All table types
 */
export const TABLE_TYPES = [
  TABLE_TYPE_BLANK,
  TABLE_TYPE_TASK_EISENHOWER,
  TABLE_TYPE_CONTRACT,
  TABLE_TYPE_HAIR_SALON_CUSTOMER,
  TABLE_TYPE_PROTOTYPE,
  TABLE_TYPE_INSIGHT_TTM,
  TABLE_TYPE_CONTENT_SCRIPT_MANAGEMENT,
  TABLE_TYPE_SWOT_EVALUATION,
  TABLE_TYPE_SCAMPER,
  TABLE_TYPE_HERZBERG_FACTOR,
  TABLE_TYPE_ONBOARDING,
  TABLE_TYPE_CUSTOMER_PIPELINE,
  TABLE_TYPE_VENDOR_MANAGEMENT,
  TABLE_TYPE_ASSET_MANAGEMENT,
  TABLE_TYPE_TRAINING_PROGRAM,
  TABLE_TYPE_LEARNING_PROGRESS,
  TABLE_TYPE_CULTURE_MANAGEMENT,
  TABLE_TYPE_CULTURE_PROGRAM_REGISTRATION,
  TABLE_TYPE_BENEFIT_POLICY,
  TABLE_TYPE_TAX_DEDUCTION,
  TABLE_TYPE_WORK_PROCESS,
  TABLE_TYPE_DEPARTMENT,
  TABLE_TYPE_JOB_TITLE,
  TABLE_TYPE_EMPLOYEE_PROFILE,
  TABLE_TYPE_BENEFIT_MANAGEMENT,
  TABLE_TYPE_BENEFIT_PROGRAM_PARTICIPANT,
  TABLE_TYPE_TIME_OFF_RECORD_MANAGEMENT,
  TABLE_TYPE_APPROVAL_REQUEST,
  TABLE_TYPE_LEAVE_POLICY,
  TABLE_TYPE_INSURANCE_POLICY,
  TABLE_TYPE_REWARD_POLICY,
  TABLE_TYPE_PENALTY,
  TABLE_TYPE_EMPLOYEE_MONTHLY_METRICS,
  TABLE_TYPE_SALARY_POLICY,
  TABLE_TYPE_SALARY_SETUP,
] as const;

/**
 * Table type union
 */
export type TableType = (typeof TABLE_TYPES)[number];

/**
 * Table type metadata structure
 */
export interface TableTypeMetadata {
  type: TableType;
  nameKey: string; // i18n key for name
  descriptionKey: string; // i18n key for description
  logoUrl: string;
}

/**
 * Table type metadata with i18n keys
 * Names and descriptions should be localized using Paraglide
 */
export const TABLE_TYPE_METADATA: Record<TableType, TableTypeMetadata> = {
  [TABLE_TYPE_BLANK]: {
    type: TABLE_TYPE_BLANK,
    nameKey: 'tableType_blank_name',
    descriptionKey: 'tableType_blank_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/table.png',
  },
  [TABLE_TYPE_TASK_EISENHOWER]: {
    type: TABLE_TYPE_TASK_EISENHOWER,
    nameKey: 'tableType_taskEisenhower_name',
    descriptionKey: 'tableType_taskEisenhower_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_CONTRACT]: {
    type: TABLE_TYPE_CONTRACT,
    nameKey: 'tableType_contract_name',
    descriptionKey: 'tableType_contract_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_HAIR_SALON_CUSTOMER]: {
    type: TABLE_TYPE_HAIR_SALON_CUSTOMER,
    nameKey: 'tableType_hairSalonCustomer_name',
    descriptionKey: 'tableType_hairSalonCustomer_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_PROTOTYPE]: {
    type: TABLE_TYPE_PROTOTYPE,
    nameKey: 'tableType_prototype_name',
    descriptionKey: 'tableType_prototype_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_INSIGHT_TTM]: {
    type: TABLE_TYPE_INSIGHT_TTM,
    nameKey: 'tableType_insightTTM_name',
    descriptionKey: 'tableType_insightTTM_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_CONTENT_SCRIPT_MANAGEMENT]: {
    type: TABLE_TYPE_CONTENT_SCRIPT_MANAGEMENT,
    nameKey: 'tableType_contentScript_name',
    descriptionKey: 'tableType_contentScript_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_SWOT_EVALUATION]: {
    type: TABLE_TYPE_SWOT_EVALUATION,
    nameKey: 'tableType_swot_name',
    descriptionKey: 'tableType_swot_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_SCAMPER]: {
    type: TABLE_TYPE_SCAMPER,
    nameKey: 'tableType_scamper_name',
    descriptionKey: 'tableType_scamper_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_HERZBERG_FACTOR]: {
    type: TABLE_TYPE_HERZBERG_FACTOR,
    nameKey: 'tableType_herzberg_name',
    descriptionKey: 'tableType_herzberg_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_ONBOARDING]: {
    type: TABLE_TYPE_ONBOARDING,
    nameKey: 'tableType_onboarding_name',
    descriptionKey: 'tableType_onboarding_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_CUSTOMER_PIPELINE]: {
    type: TABLE_TYPE_CUSTOMER_PIPELINE,
    nameKey: 'tableType_customerPipeline_name',
    descriptionKey: 'tableType_customerPipeline_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_VENDOR_MANAGEMENT]: {
    type: TABLE_TYPE_VENDOR_MANAGEMENT,
    nameKey: 'tableType_vendor_name',
    descriptionKey: 'tableType_vendor_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_ASSET_MANAGEMENT]: {
    type: TABLE_TYPE_ASSET_MANAGEMENT,
    nameKey: 'tableType_asset_name',
    descriptionKey: 'tableType_asset_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_TRAINING_PROGRAM]: {
    type: TABLE_TYPE_TRAINING_PROGRAM,
    nameKey: 'tableType_training_name',
    descriptionKey: 'tableType_training_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_LEARNING_PROGRESS]: {
    type: TABLE_TYPE_LEARNING_PROGRESS,
    nameKey: 'tableType_learningProgress_name',
    descriptionKey: 'tableType_learningProgress_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_CULTURE_MANAGEMENT]: {
    type: TABLE_TYPE_CULTURE_MANAGEMENT,
    nameKey: 'tableType_culture_name',
    descriptionKey: 'tableType_culture_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_CULTURE_PROGRAM_REGISTRATION]: {
    type: TABLE_TYPE_CULTURE_PROGRAM_REGISTRATION,
    nameKey: 'tableType_cultureRegistration_name',
    descriptionKey: 'tableType_cultureRegistration_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_BENEFIT_POLICY]: {
    type: TABLE_TYPE_BENEFIT_POLICY,
    nameKey: 'tableType_benefitPolicy_name',
    descriptionKey: 'tableType_benefitPolicy_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_TAX_DEDUCTION]: {
    type: TABLE_TYPE_TAX_DEDUCTION,
    nameKey: 'tableType_taxDeduction_name',
    descriptionKey: 'tableType_taxDeduction_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_WORK_PROCESS]: {
    type: TABLE_TYPE_WORK_PROCESS,
    nameKey: 'tableType_workProcess_name',
    descriptionKey: 'tableType_workProcess_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_DEPARTMENT]: {
    type: TABLE_TYPE_DEPARTMENT,
    nameKey: 'tableType_department_name',
    descriptionKey: 'tableType_department_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_JOB_TITLE]: {
    type: TABLE_TYPE_JOB_TITLE,
    nameKey: 'tableType_jobTitle_name',
    descriptionKey: 'tableType_jobTitle_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_EMPLOYEE_PROFILE]: {
    type: TABLE_TYPE_EMPLOYEE_PROFILE,
    nameKey: 'tableType_employeeProfile_name',
    descriptionKey: 'tableType_employeeProfile_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_BENEFIT_MANAGEMENT]: {
    type: TABLE_TYPE_BENEFIT_MANAGEMENT,
    nameKey: 'tableType_benefitManagement_name',
    descriptionKey: 'tableType_benefitManagement_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_BENEFIT_PROGRAM_PARTICIPANT]: {
    type: TABLE_TYPE_BENEFIT_PROGRAM_PARTICIPANT,
    nameKey: 'tableType_benefitParticipant_name',
    descriptionKey: 'tableType_benefitParticipant_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_TIME_OFF_RECORD_MANAGEMENT]: {
    type: TABLE_TYPE_TIME_OFF_RECORD_MANAGEMENT,
    nameKey: 'tableType_timeOff_name',
    descriptionKey: 'tableType_timeOff_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_APPROVAL_REQUEST]: {
    type: TABLE_TYPE_APPROVAL_REQUEST,
    nameKey: 'tableType_approval_name',
    descriptionKey: 'tableType_approval_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_LEAVE_POLICY]: {
    type: TABLE_TYPE_LEAVE_POLICY,
    nameKey: 'tableType_leavePolicy_name',
    descriptionKey: 'tableType_leavePolicy_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_INSURANCE_POLICY]: {
    type: TABLE_TYPE_INSURANCE_POLICY,
    nameKey: 'tableType_insurance_name',
    descriptionKey: 'tableType_insurance_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_REWARD_POLICY]: {
    type: TABLE_TYPE_REWARD_POLICY,
    nameKey: 'tableType_reward_name',
    descriptionKey: 'tableType_reward_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_PENALTY]: {
    type: TABLE_TYPE_PENALTY,
    nameKey: 'tableType_penalty_name',
    descriptionKey: 'tableType_penalty_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_EMPLOYEE_MONTHLY_METRICS]: {
    type: TABLE_TYPE_EMPLOYEE_MONTHLY_METRICS,
    nameKey: 'tableType_employeeMetrics_name',
    descriptionKey: 'tableType_employeeMetrics_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_SALARY_POLICY]: {
    type: TABLE_TYPE_SALARY_POLICY,
    nameKey: 'tableType_salaryPolicy_name',
    descriptionKey: 'tableType_salaryPolicy_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
  [TABLE_TYPE_SALARY_SETUP]: {
    type: TABLE_TYPE_SALARY_SETUP,
    nameKey: 'tableType_salarySetup_name',
    descriptionKey: 'tableType_salarySetup_description',
    logoUrl: 'https://img.icons8.com/color/64/000000/link.png',
  },
};
