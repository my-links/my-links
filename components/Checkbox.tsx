import { MutableRefObject, useState } from 'react';

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

export default function Selector({
    name,
    label,
    labelComponent,
    disabled = false,
    innerRef = null,
    fieldClass = '',
    placeholder = 'Type something...',
    isChecked,
    onChangeCallback
}: SelectorProps): JSX.Element {
    const [checkboxValue, setCheckboxValue] = useState<boolean>(isChecked);

    function onChange({ target }) {
        setCheckboxValue(!checkboxValue);
        if (onChangeCallback) {
            onChangeCallback(!checkboxValue, { target });
        }
    }

    return (<div className={`checkbox-field ${fieldClass}`}>
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
            type='checkbox'
            id={name}
            name={name}
            onChange={onChange}
            checked={checkboxValue}
            placeholder={placeholder}
            ref={innerRef}
            disabled={disabled}
        />
    </div>);
}