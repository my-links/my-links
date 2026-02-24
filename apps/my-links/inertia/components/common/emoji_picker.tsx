import clsx from 'clsx';
import EmojiPickerReact, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useRef, useState } from 'react';
import { useClickOutside } from '~/hooks/use_click_outside';

const DEFAULT_EMOJI = '📁';

interface EmojiPickerProps {
	selectedEmoji: string | null;
	setSelectedEmoji: (emoji: string | null) => void;
	disabled?: boolean;
}

export function EmojiPicker({
	selectedEmoji,
	setSelectedEmoji,
	disabled = false,
}: EmojiPickerProps) {
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const emojiPickerRef = useRef<HTMLDivElement>(null);

	useClickOutside({
		ref: emojiPickerRef,
		onClickOutside: () => setShowEmojiPicker(false),
	});

	const handleEmojiClick = (emojiData: EmojiClickData) => {
		if (disabled) return;
		setSelectedEmoji(emojiData.emoji);
		setShowEmojiPicker(false);
	};

	return (
		<div className="relative" ref={emojiPickerRef}>
			<button
				type="button"
				onClick={() => setShowEmojiPicker(!showEmojiPicker)}
				disabled={disabled}
				className={clsx(
					'w-12 h-12 flex items-center justify-center text-2xl border rounded-lg bg-white dark:bg-gray-800 transition-colors',
					disabled
						? 'border-gray-300 dark:border-gray-600 cursor-not-allowed'
						: 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'
				)}
			>
				{selectedEmoji ?? DEFAULT_EMOJI}
			</button>
			{showEmojiPicker && !disabled && (
				<div className="absolute z-50 mt-2 left-0">
					<EmojiPickerReact
						onEmojiClick={handleEmojiClick}
						theme={Theme.AUTO}
						width={300}
						height={350}
					/>
				</div>
			)}
		</div>
	);
}
