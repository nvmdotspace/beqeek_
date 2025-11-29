/**
 * Workflow Forms - Constants and Templates
 *
 * Form type definitions and default configurations.
 * Matches legacy implementation patterns.
 *
 * @see /docs/html-module/workflow-forms.blade.php (lines 200-264)
 */

import type { FormTypeDefinition, FormConfig } from './types';

/**
 * Form type definitions for template selection UI
 * Displayed in the "Select Form Type" view
 */
export const FORM_TYPES: FormTypeDefinition[] = [
  {
    type: 'BASIC',
    name: 'Form Cơ bản',
    description: 'Form cơ bản với các trường văn bản và email.',
    logo: '',
    icon: 'FileText',
  },
  {
    type: 'SUBSCRIPTION',
    name: 'Form Đăng ký',
    description: 'Form dành cho đăng ký nhận thông tin hoặc bản tin.',
    logo: '',
    icon: 'Mail',
  },
  {
    type: 'SURVEY',
    name: 'Form Khảo sát',
    description: 'Form khảo sát với các trường tùy chọn và câu hỏi.',
    logo: '',
    icon: 'ClipboardList',
  },
];

/**
 * Default form configurations by template type
 * Used when creating a new form from template
 */
export const FORM_CONFIGS: Record<string, FormConfig> = {
  BASIC: {
    title: 'Form Cơ bản',
    fields: [
      {
        type: 'text',
        label: 'Họ và Tên',
        name: 'fullName',
        required: true,
        placeholder: 'Nhập họ và tên',
      },
      {
        type: 'email',
        label: 'Email',
        name: 'email',
        required: true,
        placeholder: 'Nhập địa chỉ email',
      },
    ],
    submitButton: { text: 'Gửi' },
  },

  SUBSCRIPTION: {
    title: 'Đăng ký nhận thông tin',
    fields: [
      {
        type: 'text',
        label: 'Họ và Tên',
        name: 'fullName',
        required: true,
        placeholder: 'Nhập họ và tên',
      },
      {
        type: 'email',
        label: 'Email',
        name: 'email',
        required: true,
        placeholder: 'Nhập địa chỉ email',
      },
      {
        type: 'select',
        label: 'Bạn biết chúng tôi qua đâu?',
        name: 'source',
        required: true,
        options: [
          { value: '', text: 'Chọn một tùy chọn' },
          { value: 'social', text: 'Mạng xã hội' },
          { value: 'friend', text: 'Bạn bè giới thiệu' },
          { value: 'ads', text: 'Quảng cáo' },
          { value: 'other', text: 'Khác' },
        ],
      },
    ],
    submitButton: { text: 'Đăng ký' },
  },

  SURVEY: {
    title: 'Khảo sát ý kiến',
    fields: [
      {
        type: 'text',
        label: 'Họ và Tên',
        name: 'fullName',
        required: true,
        placeholder: 'Nhập họ và tên',
      },
      {
        type: 'email',
        label: 'Email',
        name: 'email',
        required: true,
        placeholder: 'Nhập địa chỉ email',
      },
      {
        type: 'select',
        label: 'Bạn đánh giá dịch vụ của chúng tôi thế nào?',
        name: 'rating',
        required: true,
        options: [
          { value: '', text: 'Chọn một tùy chọn' },
          { value: 'excellent', text: 'Tuyệt vời' },
          { value: 'good', text: 'Tốt' },
          { value: 'average', text: 'Trung bình' },
          { value: 'poor', text: 'Kém' },
        ],
      },
      {
        type: 'textarea',
        label: 'Ý kiến đóng góp',
        name: 'feedback',
        required: false,
        placeholder: 'Nhập ý kiến của bạn',
        maxlength: 1500,
      },
      {
        type: 'date',
        label: 'Ngày khảo sát',
        name: 'surveyDate',
        required: true,
        placeholder: 'Chọn ngày',
      },
      {
        type: 'datetime-local',
        label: 'Thời điểm khảo sát',
        name: 'surveyDateTime',
        required: false,
        placeholder: 'Chọn ngày và giờ',
      },
    ],
    submitButton: { text: 'Gửi khảo sát' },
  },
};

/**
 * Field type constants for validation and UI
 */
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  DATETIME_LOCAL: 'datetime-local',
} as const;

/**
 * Default submit button text by locale
 */
export const DEFAULT_SUBMIT_BUTTON_TEXT: Record<string, string> = {
  vi: 'Gửi',
  en: 'Submit',
};
