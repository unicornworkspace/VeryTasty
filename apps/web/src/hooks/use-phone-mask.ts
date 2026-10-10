import { useState, useCallback } from 'react';
import { formatPhone } from '@/lib/utils';

interface UsePhoneMaskReturn {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}

/**
 * Custom hook for phone input with +7 mask
 */
export function usePhoneMask(initialValue = ''): UsePhoneMaskReturn {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formatted = formatPhone(rawValue);
    setValue(formatted);
  }, []);

  const onBlur = useCallback(() => {
    // Normalize on blur
    const digits = value.replace(/\D/g, '');
    if (digits.length > 0 && !digits.startsWith('7')) {
      setValue('+7' + digits);
    }
  }, [value]);

  return { value, onChange, onBlur };
}
