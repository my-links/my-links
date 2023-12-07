import { MutableRefObject, useState } from 'react';
import Toggle from 'react-toggle';

interface SelectorProps {
  name: string;
  label?: string;
  labelComponent?: JSX.Element;
  disabled?: boolean;
  innerRef?: MutableRefObject<any>;
  placeholder?: string;
  fieldClass?: string;
  isChecked?: boolean;
  onChangeCallback?: (value, { target }) => void;
}

export default function Checkbox({
  name,
  label,
  labelComponent,
  disabled = false,
  innerRef = null,
  fieldClass = '',
  placeholder = 'Type something...',
  isChecked,
  onChangeCallback,
}: Readonly<SelectorProps>): JSX.Element {
  const [checkboxValue, setCheckboxValue] = useState<boolean>(isChecked);

  function onChange({ target }) {
    setCheckboxValue(!checkboxValue);
    if (onChangeCallback) {
      onChangeCallback(!checkboxValue, { target });
    }
  }

  return (
    <div className={`checkbox-field ${fieldClass}`}>
      {label && (
        <label
          htmlFor={name}
          title={`${name} field`}
        >
          {label}
        </label>
      )}
      {labelComponent && (
        <label
          htmlFor={name}
          title={`${name} field`}
        >
          {labelComponent}
        </label>
      )}
      <Toggle
        onChange={onChange}
        checked={checkboxValue}
        id={name}
        name={name}
        ref={innerRef}
        disabled={disabled}
      />
    </div>
  );
}
