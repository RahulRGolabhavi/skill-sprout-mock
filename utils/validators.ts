export const isNonEmptyString = (v: any): v is string => typeof v === 'string' && v.trim().length > 0;
