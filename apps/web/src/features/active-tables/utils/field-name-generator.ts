/**
 * Field Name Generator Utility
 *
 * Auto-generates unique field names from labels with Vietnamese character normalization.
 */

/**
 * Normalize Vietnamese characters to ASCII
 *
 * Converts all Vietnamese diacritics to their base characters:
 * - á, à, ả, ã, ạ, ă, ắ, ằ, ẳ, ẵ, ặ, â, ấ, ầ, ẩ, ẫ, ậ → a
 * - é, è, ẻ, ẽ, ẹ, ê, ế, ề, ể, ễ, ệ → e
 * - í, ì, ỉ, ĩ, ị → i
 * - ó, ò, ỏ, õ, ọ, ô, ố, ồ, ổ, ỗ, ộ, ơ, ớ, ờ, ở, ỡ, ợ → o
 * - ú, ù, ủ, ũ, ụ, ư, ứ, ừ, ử, ữ, ự → u
 * - ý, ỳ, ỷ, ỹ, ỵ → y
 * - đ → d
 *
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeVietnamese(text: string): string {
  return (
    text
      .normalize('NFD') // Decompose combined characters
      .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritics
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      // Additional manual mappings for characters that don't decompose properly
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[ÌÍỊỈĨ]/g, 'I')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/[ỲÝỴỶỸ]/g, 'Y')
  );
}

/**
 * Generate field name from label
 *
 * Converts label to lowercase, snake_case field name:
 * - Normalizes Vietnamese characters
 * - Converts to lowercase
 * - Replaces spaces and special chars with underscore
 * - Removes leading/trailing underscores
 * - Removes consecutive underscores
 *
 * @example
 * ```typescript
 * generateFieldName('Tên khách hàng') // 'ten_khach_hang'
 * generateFieldName('Email Address') // 'email_address'
 * generateFieldName('Số điện thoại (Mobile)') // 'so_dien_thoai_mobile'
 * generateFieldName('Giá trị đơn hàng') // 'gia_tri_don_hang'
 * ```
 *
 * @param label - Field label
 * @returns Generated field name
 */
export function generateFieldName(label: string): string {
  if (!label || typeof label !== 'string') {
    return '';
  }

  return (
    normalizeVietnamese(label)
      .toLowerCase()
      // Replace all non-alphanumeric characters with underscore
      .replace(/[^a-z0-9]+/g, '_')
      // Remove leading/trailing underscores
      .replace(/^_+|_+$/g, '')
      // Remove consecutive underscores
      .replace(/_+/g, '_')
  );
}

/**
 * Ensure field name is unique
 *
 * Appends numeric suffix if name already exists in the list.
 *
 * @example
 * ```typescript
 * ensureUniqueFieldName('email', ['email']) // 'email_2'
 * ensureUniqueFieldName('email', ['email', 'email_2']) // 'email_3'
 * ensureUniqueFieldName('name', ['title', 'description']) // 'name'
 * ```
 *
 * @param name - Proposed field name
 * @param existingNames - Array of existing field names
 * @returns Unique field name
 */
export function ensureUniqueFieldName(name: string, existingNames: string[]): string {
  if (!existingNames.includes(name)) {
    return name;
  }

  let counter = 2;
  let uniqueName = `${name}_${counter}`;

  while (existingNames.includes(uniqueName)) {
    counter++;
    uniqueName = `${name}_${counter}`;
  }

  return uniqueName;
}

/**
 * Validate field name
 *
 * Checks if field name is valid:
 * - Not empty
 * - Only lowercase letters, numbers, underscores
 * - Starts with letter or underscore
 * - Max 64 characters
 *
 * @param name - Field name to validate
 * @returns Validation result with error message
 */
export function validateFieldName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Field name is required' };
  }

  if (name.length === 0) {
    return { valid: false, error: 'Field name cannot be empty' };
  }

  if (name.length > 64) {
    return { valid: false, error: 'Field name must be 64 characters or less' };
  }

  if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
    return {
      valid: false,
      error:
        'Field name must start with letter or underscore, and contain only lowercase letters, numbers, and underscores',
    };
  }

  // Reserved SQL keywords (basic list)
  const reservedKeywords = [
    'select',
    'from',
    'where',
    'insert',
    'update',
    'delete',
    'table',
    'column',
    'index',
    'key',
    'primary',
    'foreign',
    'constraint',
    'unique',
    'null',
    'default',
    'create',
    'drop',
    'alter',
    'add',
    'user',
    'group',
    'order',
    'limit',
    'offset',
  ];

  if (reservedKeywords.includes(name.toLowerCase())) {
    return { valid: false, error: 'Field name cannot be a reserved keyword' };
  }

  return { valid: true };
}

/**
 * Generate field name with auto-increment
 *
 * Combines all utilities to generate a valid, unique field name from a label.
 *
 * @param label - Field label
 * @param existingNames - Array of existing field names to avoid conflicts
 * @returns Generated unique field name
 */
export function generateUniqueFieldName(label: string, existingNames: string[] = []): string {
  const baseName = generateFieldName(label);

  if (!baseName) {
    return ensureUniqueFieldName('field', existingNames);
  }

  const validation = validateFieldName(baseName);
  if (!validation.valid) {
    return ensureUniqueFieldName('field', existingNames);
  }

  return ensureUniqueFieldName(baseName, existingNames);
}
