/**
 * Format a number as currency
 * @param amount The amount to format
 * @param includeCurrency Whether to include the currency symbol
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, includeCurrency = true): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: includeCurrency ? 'currency' : 'decimal',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount).replace('$', '');
};

/**
 * Format a date string to a readable format
 * @param dateString The date string to format
 * @param includeTime Whether to include the time
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, includeTime = false): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  // Check if it's today or yesterday
  const isToday = date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  const isYesterday = date.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0);
  
  if (isToday) {
    return includeTime ? `Today at ${formatTime(dateString)}` : 'Today';
  } else if (isYesterday) {
    return includeTime ? `Yesterday at ${formatTime(dateString)}` : 'Yesterday';
  }
  
  // Format for other dates
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  };
  
  if (includeTime) {
    return `${date.toLocaleDateString('en-US', options)} at ${formatTime(dateString)}`;
  }
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format a date string to time
 * @param dateString The date string to format
 * @returns Formatted time string
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
