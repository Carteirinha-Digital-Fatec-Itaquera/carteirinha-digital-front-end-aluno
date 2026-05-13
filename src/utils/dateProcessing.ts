export const formatDateBR = (dateString?: string | Date): string => {
  if (!dateString) return "";
  const dateStr = typeof dateString === 'string' ? dateString : dateString.toISOString();  
  const dateOnly = dateStr.split('T')[0];
  
  return dateOnly.split('-').reverse().join('/');
};