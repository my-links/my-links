import { MutableRefObject, useState } from "react";

interface InputProps {
    name: string;
    label?: string;
    labelComponent?: JSX.Element;
    type?: string;
    multiple?: boolean;
    innerRef?: MutableRefObject<any>;
    placeholder?: string;
    fieldClass?: string;
    value?: string;
    onChangeCallback: ({ target }, value) => void;
}

export default function Input({
    name,
    label,
    labelComponent,
    type = 'text',
    multiple = false,
    innerRef = null,
    placeholder = 'Type something...',
    fieldClass = '',
    value,
    onChangeCallback
}: InputProps): JSX.Element {
    const [inputValue, setInputValue] = useState<string>(value);

    function onChange({ target }) {
        setInputValue(target.value);
        onChangeCallback({ target }, target.value);
    }

    return (<div className={`input-field ${fieldClass}`}>
        {label && (
            <label htmlFor={name} title={`${name} field`}>
                {label}
            </label>
        )}
        {!!labelComponent && (
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
        />
    </div>);
}