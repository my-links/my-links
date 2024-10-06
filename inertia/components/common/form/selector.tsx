import { useTheme } from '@emotion/react';
import { InputHTMLAttributes, ReactNode, useEffect, useState } from 'react';
import Select, {
	FormatOptionLabelMeta,
	GroupBase,
	OptionsOrGroups,
} from 'react-select';
import FormField from '~/components/common/form/_form_field';

type Option = { label: string | number; value: string | number };

interface SelectorProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
	label: string;
	name: string;
	errors?: string[];
	options: OptionsOrGroups<Option, GroupBase<Option>>;
	value: number | string;
	onChangeCallback?: (value: number | string) => void;
	formatOptionLabel?: (
		data: Option,
		formatOptionLabelMeta: FormatOptionLabelMeta<Option>
	) => ReactNode;
}

export default function Selector({
	name,
	label,
	value,
	errors = [],
	options,
	onChangeCallback,
	formatOptionLabel,
	required = false,
	...props
}: SelectorProps): JSX.Element {
	const theme = useTheme();
	const [selectorValue, setSelectorValue] = useState<Option>();

	useEffect(() => {
		if (options.length === 0) return;

		const option = options.find((o: any) => o.value === value);
		if (option) {
			setSelectorValue(option as Option);
		}
	}, [options, value]);

	const handleChange = (selectedOption: Option) => {
		setSelectorValue(selectedOption);
		if (onChangeCallback) {
			onChangeCallback(selectedOption.value);
		}
	};

	return (
		<FormField required={required}>
			{label && (
				<label htmlFor={name} title={`${name} field`}>
					{label}
				</label>
			)}
			<Select
				value={selectorValue}
				onChange={(newValue) => handleChange(newValue as Option)}
				options={options}
				isDisabled={props.disabled}
				menuPlacement="auto"
				formatOptionLabel={
					formatOptionLabel
						? (val, formatOptionLabelMeta) =>
								formatOptionLabel(val, formatOptionLabelMeta)
						: undefined
				}
				css={{ color: theme.colors.black }}
			/>
		</FormField>
	);
}
