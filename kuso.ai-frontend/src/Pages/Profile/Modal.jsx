import React from "react";
import "./Modal.css";

const Modal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-foot">
          <button style={{ padding: '7px', fontSize: '10px' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};



export default Modal;
  
