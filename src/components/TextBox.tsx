import { MutableRefObject, useState } from 'react';

interface InputProps {
  name: string;
  label?: string;
  disabled?: boolean;
  innerRef?: MutableRefObject<any> | ((ref: any) => void);
  placeholder?: string;
  fieldClass?: string;
  inputClass?: string;
  value?: string;
  onChangeCallback?: (value) => void;
}

export default function TextBox({
  name,
  label,
  disabled = false,
  innerRef = null,
  placeholder = 'Type something...',
  fieldClass = '',
  inputClass = '',
  value,
  onChangeCallback,
}: InputProps): JSX.Element {
  const [inputValue, setInputValue] = useState<string>(value);

  function onChange({ target }) {
    setInputValue(target.value);
    if (onChangeCallback) {
      onChangeCallback(target.value);
    }
  }

  return (
    <div className={`input-field ${fieldClass}`}>
      {label && (
        <label
          htmlFor={name}
          title={`${name} field`}
        >
          {label}
        </label>
      )}
      <input
        onChange={onChange}
        value={inputValue}
        className={inputClass}
        name={name}
        id={name}
        placeholder={placeholder}
        ref={innerRef}
        disabled={disabled}
      />
    </div>
  );
}
