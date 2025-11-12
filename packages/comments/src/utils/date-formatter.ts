import { formatDistance, format, isToday, isYesterday, isThisYear } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

/**
 * Get date-fns locale object from language code
 */
export function getDateLocale(languageCode: string) {
  switch (languageCode) {
    case 'vi':
      return vi;
    case 'en':
      return enUS;
    default:
      return vi;
  }
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date, languageCode = 'vi'): string {
  return formatDistance(date, new Date(), {
    addSuffix: true,
    locale: getDateLocale(languageCode),
  });
}

/**
 * Format date with smart formatting
 * - Today: "Today at 3:45 PM"
 * - Yesterday: "Yesterday at 3:45 PM"
 * - This year: "March 15 at 3:45 PM"
 * - Other years: "March 15, 2023 at 3:45 PM"
 */
export function formatSmartDate(date: Date, languageCode = 'vi'): string {
  const locale = getDateLocale(languageCode);
  const timeFormat = 'HH:mm';

  if (isToday(date)) {
    return `Hôm nay lúc ${format(date, timeFormat)}`;
  }

  if (isYesterday(date)) {
    return `Hôm qua lúc ${format(date, timeFormat)}`;
  }

  if (isThisYear(date)) {
    return format(date, 'dd MMM [lúc] HH:mm', { locale });
  }

  return format(date, 'dd MMM yyyy [lúc] HH:mm', { locale });
}

/**
 * Format date for comment timestamp
 * Defaults to relative time if within 7 days, otherwise smart date
 */
export function formatCommentDate(date: Date, languageCode = 'vi'): string {
  const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff < 7) {
    return formatRelativeTime(date, languageCode);
  }

  return formatSmartDate(date, languageCode);
}
