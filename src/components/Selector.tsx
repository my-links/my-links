import { MutableRefObject, ReactNode, useEffect, useState } from 'react';
import Select, {
  FormatOptionLabelMeta,
  GroupBase,
  OptionsOrGroups,
} from 'react-select';

type Option = { label: string | number; value: string | number };

interface SelectorProps {
  name: string;
  label?: string;
  labelComponent?: JSX.Element;
  innerRef?: MutableRefObject<any>;
  fieldClass?: string;

  options: OptionsOrGroups<Option, GroupBase<Option>>;
  value?: number | string;
  onChangeCallback?: (value: number | string) => void;
  formatOptionLabel?: (
    data: Option,
    formatOptionLabelMeta: FormatOptionLabelMeta<Option>,
  ) => ReactNode;

  disabled?: boolean;
}

export default function Selector({
  name,
  label,
  labelComponent,
  innerRef = null,
  fieldClass = '',
  value,
  options = [],
  onChangeCallback,
  formatOptionLabel,
  disabled = false,
}: SelectorProps): JSX.Element {
  const [selectorValue, setSelectorValue] = useState<Option>();

  useEffect(() => {
    if (options.length === 0) return;

    const option = options.find((o: Option) => o.value === value) as Option;
    if (option) {
      setSelectorValue(option);
    }
  }, [options, value]);

  function handleChange(selectedOption: Option) {
    setSelectorValue(selectedOption);
    if (onChangeCallback) {
      onChangeCallback(selectedOption.value);
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
      {labelComponent && (
        <label
          htmlFor={name}
          title={`${name} field`}
        >
          {labelComponent}
        </label>
      )}
      <Select
        value={selectorValue}
        onChange={handleChange}
        options={options}
        ref={innerRef}
        isDisabled={disabled}
        menuPlacement='auto'
        formatOptionLabel={
          formatOptionLabel
            ? (value, formatOptionLabelMeta) =>
                formatOptionLabel(value, formatOptionLabelMeta)
            : undefined
        }
      />
    </div>
  );
}
