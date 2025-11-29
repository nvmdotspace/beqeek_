/**
 * Workflow Connectors - Connector Type Definitions
 *
 * Array of all supported connector types with metadata for selection UI
 */

import {
  CONNECTOR_TYPE_SMTP,
  CONNECTOR_TYPE_GOOGLE_SHEETS,
  CONNECTOR_TYPE_ZALO_OA,
  CONNECTOR_TYPE_KIOTVIET,
  CONNECTOR_TYPE_ACTIVE_TABLE,
  type ConnectorTypeDefinition,
} from './types.js';

/**
 * Array of all supported connector types
 * Used in connector type selection view
 */
export const CONNECTOR_TYPES: ConnectorTypeDefinition[] = [
  {
    type: CONNECTOR_TYPE_SMTP,
    name: 'SMTP',
    description: 'Kết nối với máy chủ SMTP để gửi email.',
    logo: '',
    icon: 'Mail',
  },
  {
    type: CONNECTOR_TYPE_GOOGLE_SHEETS,
    name: 'Google Sheet',
    description: 'Kết nối với Google Sheet để truy cập dữ liệu người dùng và dịch vụ.',
    logo: 'https://a.mktgcdn.com/p/-PwOQsJ3DFhmP-ysVNuotfaRuvS5CJnvkxe-xSGj8ZQ/4267x4267.png',
  },
  {
    type: CONNECTOR_TYPE_ZALO_OA,
    name: 'Zalo OA',
    description: 'Kết nối với Zalo Official Account để gửi tin nhắn và quản lý khách hàng.',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMDg68zSJU2TpKyMFJwkWpuGsXF_FTMJguqA&s',
  },
  {
    type: CONNECTOR_TYPE_KIOTVIET,
    name: 'Kiotviet',
    description: 'Kết nối với Kiotviet để quản lý bán hàng và kho.',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu9JZqHuRPU5YePaTYEB8OuU-ejDAPlYH8UQ&s',
  },
  {
    type: CONNECTOR_TYPE_ACTIVE_TABLE,
    name: 'Bảng',
    description: 'Kết nối với bảng để quản lý dữ liệu',
    logo: '',
    icon: 'Table',
  },
];
