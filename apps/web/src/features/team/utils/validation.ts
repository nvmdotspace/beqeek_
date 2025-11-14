/**
 * Validation utilities for team management forms
 * All validators return null if valid, or error message string if invalid
 */

export const teamValidation = {
  teamName: (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return 'validation_team_name_required';
    if (trimmed.length > 100) return 'validation_team_name_too_long';
    return null;
  },

  teamDescription: (value: string): string | null => {
    if (value.length > 500) return 'validation_team_description_too_long';
    return null;
  },
};

export const roleValidation = {
  roleName: (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return 'validation_role_name_required';
    if (trimmed.length > 100) return 'validation_role_name_too_long';
    return null;
  },

  roleCode: (value: string): string | null => {
    if (!value) return null; // Optional field
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'validation_role_code_alphanumeric';
    }
    if (value.length > 50) return 'validation_role_code_too_long';
    return null;
  },

  roleDescription: (value: string): string | null => {
    if (value.length > 500) return 'validation_role_description_too_long';
    return null;
  },
};

export const memberValidation = {
  username: (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return 'validation_username_required';
    if (trimmed.length < 2) return 'validation_username_too_short';
    if (trimmed.length > 50) return 'validation_username_too_long';
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return 'validation_username_alphanumeric';
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return null; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'validation_email_invalid';
    }
    return null;
  },

  fullName: (value: string): string | null => {
    if (!value) return null; // Optional field
    if (value.length > 200) return 'validation_fullname_too_long';
    return null;
  },

  password: (value: string, isNewUser: boolean): string | null => {
    if (isNewUser && !value) return 'validation_password_required';
    if (value && value.length < 6) return 'validation_password_too_short';
    return null;
  },

  teamId: (value: string): string | null => {
    if (!value) return 'validation_team_required';
    return null;
  },

  roleId: (value: string): string | null => {
    if (!value) return 'validation_role_required';
    return null;
  },
};
