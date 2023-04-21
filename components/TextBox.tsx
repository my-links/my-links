import { MutableRefObject, useState } from "react";

interface InputProps {
  name: string;
  label?: string;
  labelComponent?: JSX.Element;
  disabled?: boolean;
  type?: string;
  multiple?: boolean;
  innerRef?: MutableRefObject<any> | ((ref: any) => void);
  placeholder?: string;
  fieldClass?: string;
  value?: string;
  onChangeCallback?: (value) => void;
}

export default function TextBox({
  name,
  label,
  labelComponent,
  disabled = false,
  type = "text",
  multiple = false,
  innerRef = null,
  placeholder = "Type something...",
  fieldClass = "",
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
        <label htmlFor={name} title={`${name} field`}>
          {label}
        </label>
      )}
      {labelComponent && (
        <label htmlFor={name} title={`${name} field`}>
          {labelComponent}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        onChange={onChange}
        value={inputValue}
        multiple={multiple}
        placeholder={placeholder}
        ref={innerRef}
        disabled={disabled}
      />
    </div>
  );
}
