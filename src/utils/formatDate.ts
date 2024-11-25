const formatDate = (date: Date, locale: string = 'en-US', options?: Intl.DateTimeFormatOptions): string => {
  return date.toLocaleDateString(locale, options);
};

export default formatDate;