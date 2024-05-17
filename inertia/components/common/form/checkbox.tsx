import { ChangeEvent, Fragment, InputHTMLAttributes, useState } from 'react';
import Toggle from 'react-toggle';
import FormField from '~/components/common/form/_form_field';
import FormFieldError from '~/components/common/form/_form_field_error';

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  name: string;
  checked: boolean;
  errors?: string[];
  onChange?: (name: string, checked: boolean) => void;
}

export default function Checkbox({
  name,
  label,
  checked = false,
  errors = [],
  onChange,
  required = false,
  ...props
}: InputProps): JSX.Element {
  const [checkboxChecked, setCheckboxChecked] = useState<boolean>(checked);

  if (typeof window === 'undefined') return <Fragment />;

  function _onChange({ target }: ChangeEvent<HTMLInputElement>) {
    setCheckboxChecked(target.checked);
    if (onChange) {
      onChange(target.name, target.checked);
    }
  }

  return (
    <FormField
      css={{ alignItems: 'center', gap: '1em', flexDirection: 'row' }}
      required={required}
    >
      <label htmlFor={name} title={label}>
        {label}
      </label>
      <Toggle
        {...props}
        onChange={_onChange}
        checked={checkboxChecked}
        placeholder={props.placeholder ?? 'Type something...'}
        name={name}
        id={name}
      />
      {errors.length > 0 &&
        errors.map((error) => <FormFieldError>{error}</FormFieldError>)}
    </FormField>
  );
}
