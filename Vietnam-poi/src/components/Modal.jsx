// frontend/src/components/Modal.jsx
import React from 'react';
import '../Modal.css'; // We'll create this CSS file next

const Modal = ({ isVisible, message, onConfirm, onClose }) => {
  // If the modal is not visible, render nothing
  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="modal-button modal-button-confirm" onClick={onConfirm}>
            Có
          </button>
          <button className="modal-button modal-button-cancel" onClick={onClose}>
            Không
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;