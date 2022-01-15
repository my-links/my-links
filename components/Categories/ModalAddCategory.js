import Modal from 'react-modal';

import styles from '../../styles/categories.module.scss';

Modal.setAppElement('#__next');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

export default function ModalAddCategory({ categories, isOpen, closeModal }) {
    function handleAddCategory() {

    }

    return (
        <Modal
            className={styles['modal-overlay']}
            isOpen={isOpen}
            onRequestClose={closeModal}
            style={customStyles}
        >
            <h2>Ajouter une catégorie</h2>
            <button onClick={closeModal}>close</button>
        </Modal>
    );
}