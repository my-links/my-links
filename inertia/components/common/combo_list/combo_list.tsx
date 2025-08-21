import { Combobox, Input, InputBase, useCombobox } from '@mantine/core';
import { ComboListItem } from '~/components/common/combo_list/combo_list_item';

export type ValueWithIcon = {
	label: string;
	value: string;
	icon: React.ReactNode;
};

export function ComboList({
	selectedValue,
	values,
	setValue,
}: {
	selectedValue: string;
	values: ValueWithIcon[];
	setValue: (value: string) => void;
}) {
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});

	const selectedOption = values.find((item) => item.value === selectedValue);

	const options = values.map((item) => (
		<Combobox.Option value={item.value} key={item.value}>
			<ComboListItem emoji={item.icon} label={item.label} />
		</Combobox.Option>
	));

	return (
		<Combobox
			store={combobox}
			withinPortal={false}
			onOptionSubmit={(val) => {
				setValue(val as string);
				combobox.closeDropdown();
			}}
		>
			<Combobox.Target>
				<InputBase
					component="button"
					type="button"
					pointer
					rightSection={<Combobox.Chevron />}
					onClick={() => combobox.toggleDropdown()}
					rightSectionPointerEvents="none"
					multiline
				>
					{selectedOption ? (
						<ComboListItem
							emoji={selectedOption.icon}
							label={selectedOption.label}
						/>
					) : (
						<Input.Placeholder>Pick value</Input.Placeholder>
					)}
				</InputBase>
			</Combobox.Target>

			<Combobox.Dropdown>
				<Combobox.Options>{options}</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	);
}
