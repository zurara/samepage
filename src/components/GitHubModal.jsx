import React, { useState } from 'react';

export default function GitHubModal({ onClose, githubStatus, onConnect, onCreate }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [mode, setMode] = useState('connect');
  const [changingRepo, setChangingRepo] = useState(false);

  function handleAuthorize() {
    fetch('/api/github/config')
      .then(res => res.json())
      .then(({ clientId }) => {
        const redirectUri = encodeURIComponent('http://localhost:8000/api/github/callback');
        const scope = 'repo';
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
        window.location.href = authUrl;
      })
      .catch(err => {
        console.error('Failed to get GitHub config:', err);
        alert('Failed to start GitHub authorization');
      });
  }

  function handleConnect() {
    if (repoUrl.trim() && onConnect) {
      onConnect(repoUrl.trim());
    }
  }

  function handleCreate() {
    if (newRepoName.trim() && onCreate) {
      onCreate(newRepoName.trim());
    }
  }

  const isConnected = githubStatus?.connected;
  const username = githubStatus?.user?.login;
  const hasRepo = githubStatus?.repo;
  const repoName = githubStatus?.repo?.name;

  return (
    <div className="dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog github-modal">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h3 className="dialog-title">
          {isConnected ? 'GitHub Connected' : 'Connect to GitHub'}
        </h3>
        <p className="dialog-message">
          {isConnected
            ? `Connected as ${username}`
            : 'Connect your documentation to a separate GitHub repository. This won\'t affect your project\'s existing git setup.'}
        </p>

        {hasRepo && !changingRepo && (
          <div className="repo-connected-section">
            <p className="repo-connected">Repository: {repoName}</p>
            <button className="dialog-btn" onClick={() => setChangingRepo(true)}>
              Change Repository
            </button>
          </div>
        )}

        {!isConnected && (
          <div className="dialog-actions">
            <button className="dialog-btn dialog-btn-primary" onClick={handleAuthorize}>
              Authorize with GitHub
            </button>
          </div>
        )}

        {isConnected && (!hasRepo || changingRepo) && (
          <div className="repo-section">
            <div className="repo-tabs">
              <button
                className={`repo-tab ${mode === 'connect' ? 'active' : ''}`}
                onClick={() => setMode('connect')}
              >
                Connect Existing
              </button>
              <button
                className={`repo-tab ${mode === 'create' ? 'active' : ''}`}
                onClick={() => setMode('create')}
              >
                Create New
              </button>
            </div>

            {mode === 'connect' && (
              <div className="repo-form">
                <label className="repo-label">Repository URL</label>
                <input
                  type="text"
                  className="repo-input"
                  placeholder="https://github.com/user/my-docs"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <button
                  className="dialog-btn dialog-btn-primary"
                  onClick={handleConnect}
                  disabled={!repoUrl.trim()}
                >
                  Connect Repository
                </button>
              </div>
            )}

            {mode === 'create' && (
              <div className="repo-form">
                <label className="repo-label">Repository Name</label>
                <input
                  type="text"
                  className="repo-input"
                  placeholder="my-project"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                />
                <button
                  className="dialog-btn dialog-btn-primary"
                  onClick={handleCreate}
                  disabled={!newRepoName.trim()}
                >
                  Create Repository
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
