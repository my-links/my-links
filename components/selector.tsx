import { MutableRefObject, useState } from "react";

interface SelectorProps {
    name: string;
    label?: string;
    labelComponent?: JSX.Element;
    innerRef?: MutableRefObject<any>;
    fieldClass?: string;
    value?: string | number;
    onChangeCallback: ({ target }, value) => void;
    children?: any;
}

export default function Selector({
    name,
    label,
    labelComponent,
    innerRef = null,
    fieldClass = '',
    value,
    onChangeCallback,
    children
}: SelectorProps): JSX.Element {
    const [inputValue, setInputValue] = useState<string | number>(value);

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
        <select
            id={name}
            name={name}
            onChange={onChange}
            value={inputValue}
            ref={innerRef}
        >
            {children}
        </select>
    </div>);
}