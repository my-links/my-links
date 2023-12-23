import clsx from 'clsx';
import { MutableRefObject, useState } from 'react';
import Toggle from 'react-toggle';

interface SelectorProps {
  name: string;
  label?: string;
  labelComponent?: JSX.Element;
  disabled?: boolean;
  innerRef?: MutableRefObject<any>;
  isChecked?: boolean;
  onChangeCallback?: (value, { target }) => void;
  dir?: 'ltr' | 'rtl';
}

export default function Checkbox({
  name,
  label,
  labelComponent,
  disabled = false,
  innerRef = null,
  isChecked,
  onChangeCallback,
  dir = 'ltr',
}: Readonly<SelectorProps>): JSX.Element {
  const [checkboxValue, setCheckboxValue] = useState<boolean>(isChecked);

  function onChange({ target }) {
    setCheckboxValue(!checkboxValue);
    if (onChangeCallback) {
      onChangeCallback(!checkboxValue, { target });
    }
  }

  return (
    <div className={clsx('checkbox-field', 'fieldClass', dir)}>
      {label && (
        <label
          htmlFor={name}
          title={label}
        >
          {label}
        </label>
      )}
      {labelComponent && (
        <label
          htmlFor={name}
          title={name}
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
