import { Fragment, ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import ModalBody from '~/components/common/modal/_modal_body';
import ModalContainer from '~/components/common/modal/_modal_container';
import {
	ModalCloseBtn,
	ModalHeader,
} from '~/components/common/modal/_modal_header';
import ModalWrapper from '~/components/common/modal/_modal_wrapper';
import TextEllipsis from '~/components/common/text_ellipsis';
import useClickOutside from '~/hooks/use_click_outside';
import useGlobalHotkeys from '~/hooks/use_global_hotkeys';
import useShortcut from '~/hooks/use_shortcut';

interface ModalProps {
	title?: string;
	children: ReactNode;
	opened: boolean;
	hideCloseBtn?: boolean;
	className?: string;

	close: () => void;
}

export default function Modal({
	title,
	children,
	opened = true,
	hideCloseBtn = false,
	className,
	close,
}: ModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);
	const { setGlobalHotkeysEnabled } = useGlobalHotkeys();

	useClickOutside(modalRef, close);
	useShortcut('ESCAPE_KEY', close, { disableGlobalCheck: true });

	useEffect(() => setGlobalHotkeysEnabled(!opened), [opened]);

	if (typeof window === 'undefined') {
		return <Fragment />;
	}

	return (
		opened &&
		createPortal(
			<ModalWrapper>
				<ModalContainer className={className} ref={modalRef}>
					{(!hideCloseBtn || title) && (
						<ModalHeader>
							{title && <TextEllipsis>{title}</TextEllipsis>}
							{!hideCloseBtn && (
								<ModalCloseBtn onClick={close}>
									<IoClose size={20} />
								</ModalCloseBtn>
							)}
						</ModalHeader>
					)}
					<ModalBody>{children}</ModalBody>
				</ModalContainer>
			</ModalWrapper>,
			document.body
		)
	);
}
