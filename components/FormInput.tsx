import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  index: number;
  error?: string;
  className?: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label, name, type = 'text', value, onChange, required = false,
  placeholder, options, index, error, className = '', onKeyDown, disabled = false, min, max
}) => {
  const baseClasses = "w-full px-3 py-2 bg-white border rounded-md text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cadovina-500 focus:border-cadovina-500 disabled:bg-gray-100 disabled:text-gray-500";
  const borderClass = error ? "border-red-500" : "border-gray-300";
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (type === 'date' && !disabled && inputRef.current) {
      try {
        inputRef.current.showPicker();
      } catch (error) {
        // Fallback
      }
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={name} className="mb-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {options ? (
        <select 
            id={name} 
            name={name} 
            value={value} 
            onChange={onChange} 
            onKeyDown={onKeyDown} 
            data-index={index} 
            disabled={disabled} 
            className={`${baseClasses} ${borderClass} appearance-none cursor-pointer`}
        >
          <option value="">-- Chọn {label} --</option>
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <div className="relative">
            <input 
                ref={inputRef}
                id={name} 
                name={name} 
                type={type} 
                value={value} 
                onChange={onChange} 
                onKeyDown={onKeyDown} 
                data-index={index} 
                placeholder={placeholder} 
                required={required} 
                disabled={disabled} 
                min={min}
                max={max}
                className={`${baseClasses} ${borderClass} ${type === 'date' ? 'pr-10' : ''}`} 
            />
            {type === 'date' && !disabled && (
                <button
                    type="button"
                    onClick={handleIconClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cadovina-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    tabIndex={-1}
                >
                    <Calendar size={16} />
                </button>
            )}
        </div>
      )}
      {error && <span className="mt-1 text-xs text-red-500 italic">{error}</span>}
    </div>
  );
};
