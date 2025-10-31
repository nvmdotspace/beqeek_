const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

const normalizeBaseUrl = (base: string) => (base.endsWith('/') ? base : `${base}/`);

export const getApiBaseUrl = (): string | undefined => {
  const base = import.meta.env.VITE_API_BASE_URL?.trim();
  return base && base.length > 0 ? base : undefined;
};

export const resolveApiUrl = (input: string): string => {
  if (ABSOLUTE_URL_REGEX.test(input)) {
    return input;
  }

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return input;
  }

  try {
    return new URL(input.replace(/^\//, ''), normalizeBaseUrl(baseUrl)).toString();
  } catch (error) {
    console.warn('[api] Failed to resolve request URL', error);
    return input;
  }
};
