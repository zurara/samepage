import React from 'react';

export default function ConflictDialog({ file, local, remote, onKeepLocal, onKeepRemote, onClose }) {
  return (
    <div className="dialog-overlay">
      <div className="dialog conflict-dialog">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h3 className="dialog-title">Sync Conflict</h3>
        <p className="conflict-file">File: {file}</p>
        <div className="conflict-diff">
          <div className="conflict-side">
            <h4>Local Version</h4>
            <pre className="conflict-content">{local || '(empty)'}</pre>
          </div>
          <div className="conflict-side">
            <h4>Remote Version</h4>
            <pre className="conflict-content">{remote || '(empty)'}</pre>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn dialog-btn-primary" onClick={onKeepLocal}>Keep Local</button>
          <button className="dialog-btn dialog-btn-primary" onClick={onKeepRemote}>Keep Remote</button>
        </div>
      </div>
    </div>
  );
}
