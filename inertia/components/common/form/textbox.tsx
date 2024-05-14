import styled from '@emotion/styled';
import { ChangeEvent, InputHTMLAttributes, useState } from 'react';
import FormField from '~/components/common/form/_form_field';
import Input from '~/components/common/form/_input';

// TODO: create a global style variable (fontSize)
const InputLegend = styled.p(({ theme }) => ({
  fontSize: '12px',
  color: theme.colors.lightRed,
}));

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  name: string;
  value?: string;
  errors?: string[];
  onChange?: (name: string, value: string) => void;
}

export default function TextBox({
  name,
  label,
  value = '',
  errors = [],
  onChange,
  required = false,
  ...props
}: InputProps): JSX.Element {
  const [inputValue, setInputValue] = useState<string>(value);

  function _onChange({ target }: ChangeEvent<HTMLInputElement>) {
    setInputValue(target.value);
    if (onChange) {
      onChange(target.name, target.value);
    }
  }

  return (
    <FormField required={required}>
      <label htmlFor={name} title={label}>
        {label}
      </label>
      <Input
        {...props}
        name={name}
        onChange={_onChange}
        value={inputValue}
        placeholder={props.placeholder ?? 'Type something...'}
      />
      {errors.length > 0 &&
        errors.map((error) => <InputLegend>{error}</InputLegend>)}
    </FormField>
  );
}
