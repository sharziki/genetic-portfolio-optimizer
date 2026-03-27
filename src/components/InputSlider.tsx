import { Info } from 'lucide-react';
import { useState } from 'react';

interface InputSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  tooltip?: string;
  disabled?: boolean;
}

export function InputSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = '',
  tooltip,
  disabled = false,
}: InputSliderProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            {label}
          </label>
          {tooltip && (
            <div className="relative">
              <button
                type="button"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                disabled={disabled}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg shadow-lg z-50 w-48 text-xs text-[hsl(var(--muted-foreground))]">
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[hsl(var(--border))]" />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="w-20 px-2 py-1 text-sm text-right bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-md text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:cursor-not-allowed"
          />
          <span className="text-sm text-[hsl(var(--muted-foreground))] w-8">
            {unit}
          </span>
        </div>
      </div>
      <input
        type="range"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full disabled:cursor-not-allowed"
      />
    </div>
  );
}
