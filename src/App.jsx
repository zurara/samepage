import React, { useState, useEffect } from 'react';
import FileBrowser from './components/FileBrowser';
import Editor from './components/Editor';
import GitHubModal from './components/GitHubModal';
import ConflictDialog from './components/ConflictDialog';
import Terminal from './components/Terminal';

export default function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [githubStatus, setGithubStatus] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    fetch('/api/github/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) setGithubStatus(data);
      })
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    if (params.get('github') === 'success') {
      setShowGitHubModal(true);
      window.history.replaceState({}, '', window.location.pathname);
      fetch('/api/github/status')
        .then(res => res.json())
        .then(data => {
          if (data.success) setGithubStatus(data);
        })
        .catch(() => {});
    }
  }, []);

  const hasRepo = githubStatus?.repo;

  return (
    <div className="app">
      {/* Notion-like sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${sidebarHover && !sidebarOpen ? 'sidebar-peek' : ''}`}
        onMouseEnter={() => !sidebarOpen && setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">◆</span>
            <span className="brand-name">Samepage</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => { setSidebarOpen(!sidebarOpen); setSidebarHover(false); }}
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {sidebarOpen ? (
                <path d="M11 3L6 8L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              ) : (
                <path d="M5 3L10 8L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              )}
            </svg>
          </button>
        </div>

        <FileBrowser onFileSelect={setCurrentFile} currentFile={currentFile} />

        <div className="sidebar-footer">
          <div className="sidebar-footer-actions">
            {hasRepo && (
              <>
                <button
                  className="sidebar-action-btn"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/github/pull', { method: 'POST' });
                      const data = await res.json();
                      if (data.success) {
                        window.location.reload();
                      } else if (data.conflict) {
                        setConflict(data);
                      } else {
                        alert('Pull failed: ' + data.error);
                      }
                    } catch (error) {
                      alert('Pull failed');
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2V14M8 2L4 6M8 2L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 8 8)"/>
                  </svg>
                  Pull
                </button>
                <button
                  className="sidebar-action-btn"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/github/push', { method: 'POST' });
                      const data = await res.json();
                      if (data.success) {
                        alert(data.message);
                      } else {
                        alert('Push failed: ' + data.error);
                      }
                    } catch (error) {
                      alert('Push failed');
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 14V2M8 2L4 6M8 2L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Push
                </button>
              </>
            )}
          </div>
          <button
            className="sidebar-github-btn"
            onClick={() => setShowTerminal(t => !t)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 3L6 8L2 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Terminal</span>
          </button>
          <button
            className="sidebar-github-btn"
            onClick={() => setShowGitHubModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>{githubStatus?.connected ? githubStatus.user?.login : 'Connect GitHub'}</span>
          </button>
        </div>
      </aside>

      {/* Sidebar hover trigger when collapsed */}
      {!sidebarOpen && (
        <div
          className="sidebar-trigger"
          onMouseEnter={() => setSidebarHover(true)}
        />
      )}

      {/* Main content */}
      <main className="main-content">
        <Editor file={currentFile} onSave={() => console.log('Saved!')} />
        {showTerminal && (
          <Terminal onClose={() => setShowTerminal(false)} />
        )}
      </main>

      {showGitHubModal && (
        <GitHubModal
          onClose={() => setShowGitHubModal(false)}
          githubStatus={githubStatus}
          onConnect={async (repoUrl) => {
            try {
              const res = await fetch('/api/github/clone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl })
              });
              const data = await res.json();
              if (data.success) {
                const statusRes = await fetch('/api/github/status');
                const statusData = await statusRes.json();
                if (statusData.success) setGithubStatus(statusData);
                setShowGitHubModal(false);
                window.location.reload();
              } else {
                alert('Failed to clone: ' + data.error);
              }
            } catch (error) {
              alert('Failed to clone repository');
            }
          }}
          onCreate={async (repoName) => {
            try {
              const res = await fetch('/api/github/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoName })
              });
              const data = await res.json();
              if (data.success) {
                const statusRes = await fetch('/api/github/status');
                const statusData = await statusRes.json();
                if (statusData.success) setGithubStatus(statusData);
                setShowGitHubModal(false);
                alert(`Repository "${repoName}" created!`);
              } else {
                alert('Failed to create: ' + data.error);
              }
            } catch (error) {
              alert('Failed to create repository');
            }
          }}
        />
      )}

      {conflict && (
        <ConflictDialog
          file={conflict.file}
          local={conflict.local}
          remote={conflict.remote}
          onKeepLocal={async () => {
            try {
              const res = await fetch('/api/github/resolve/local', { method: 'POST' });
              const data = await res.json();
              if (data.success) {
                alert(data.message);
                setConflict(null);
              } else {
                alert('Failed to resolve: ' + data.error);
              }
            } catch (error) {
              alert('Failed to resolve conflict');
            }
          }}
          onKeepRemote={async () => {
            try {
              const res = await fetch('/api/github/resolve/remote', { method: 'POST' });
              const data = await res.json();
              if (data.success) {
                alert(data.message);
                setConflict(null);
                window.location.reload();
              } else {
                alert('Failed to resolve: ' + data.error);
              }
            } catch (error) {
              alert('Failed to resolve conflict');
            }
          }}
          onClose={() => setConflict(null)}
        />
      )}
    </div>
  );
}
