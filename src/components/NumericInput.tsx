import React, { useEffect, useState } from 'react';

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  placeholder?: string;
  className?: string;
  title?: string;
  id?: string;
  name?: string;
  onBlurDefault?: number;
  disabled?: boolean;
}

/**
 * Robust numeric input component that decouples user keystrokes from immediate numeric parsing.
 * Allows typing '0.', '0.0', '0.03', negative signs, and completely clearing the input
 * without cursor snapping, auto-reversion, or inability to delete digits.
 */
export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 'any',
  placeholder,
  className = '',
  title,
  id,
  name,
  onBlurDefault,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [text, setText] = useState<string>(() => {
    if (value === undefined || value === null || isNaN(value)) return '';
    return String(value);
  });

  // Synchronize when value changes externally (e.g. preset loaded, recipe clicked) while user is not typing
  useEffect(() => {
    if (!isFocused) {
      if (value === undefined || value === null || isNaN(value)) {
        setText('');
      } else {
        setText(String(value));
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);

    // If empty or intermediate decimal (e.g. "0.", "0.0", "-"), do not fire an invalid NaN to parent
    if (raw.trim() === '' || raw === '.' || raw === '-' || raw.endsWith('.')) {
      return;
    }

    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const trimmed = text.trim();

    if (trimmed === '' || trimmed === '.' || isNaN(parseFloat(trimmed))) {
      const fallback = onBlurDefault !== undefined ? onBlurDefault : 0;
      setText(fallback === 0 && onBlurDefault === undefined ? '' : String(fallback));
      onChange(fallback);
    } else {
      let parsed = parseFloat(trimmed);
      if (min !== undefined && parsed < min) parsed = min;
      if (max !== undefined && parsed > max) parsed = max;
      setText(String(parsed));
      onChange(parsed);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      id={id}
      name={name}
      disabled={disabled}
      value={text}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      className={className}
      title={title}
    />
  );
};
