import React from 'react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button className="dialog-btn dialog-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="dialog-btn dialog-btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
