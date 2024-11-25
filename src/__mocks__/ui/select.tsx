import React from 'react';

interface SelectProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  defaultValue: string;
  label: string;
}

export const Select: React.FC<SelectProps> = ({ children, onValueChange, defaultValue, label }) => (
  <div>
    <label htmlFor="select-input">{label}</label>
    <select 
      id="select-input"
      onChange={(e) => onValueChange(e.target.value)} 
      defaultValue={defaultValue}
      aria-label={label}
    >
      {children}
    </select>
  </div>
);

export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span role="button" aria-haspopup="listbox">{children}</span>
);

export const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <span aria-label={placeholder}>{placeholder}</span>
);

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div role="listbox">{children}</div>
);

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <option value={value}>{children}</option>
);