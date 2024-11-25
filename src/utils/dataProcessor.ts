interface ProcessOptions {
  replace?: boolean;
  uppercase?: boolean;
  trim?: boolean;
  maxLength?: number;
}

export function processData(data: string, options: ProcessOptions): string {
  if (typeof data !== 'string') {
    throw new Error('Input data must be a string');
  }

  Object.entries(options).forEach(([key, value]) => {
    if (key === 'maxLength' && typeof value !== 'number') {
      throw new Error('Invalid maxLength option: must be a number');
    } else if (key !== 'maxLength' && typeof value !== 'boolean') {
      throw new Error(`Invalid ${key} option: must be a boolean`);
    }
  });

  let result = data;

  if (options.trim) {
    result = result.trim();
  }

  if (options.replace) {
    result = result.replace(/\s/g, '-');
  }

  if (options.uppercase) {
    result = result.toUpperCase();
  }

  if (options.maxLength && options.maxLength > 0) {
    result = result.slice(0, options.maxLength);
  }

  return result;
}