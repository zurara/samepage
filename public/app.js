import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Plate, usePlateEditor } from 'platejs/react';
import { createPlateEditor } from 'platejs';
import { MarkdownPlugin } from '@platejs/markdown';
import remarkGfm from 'remark-gfm';

// Plate plugins configuration
const editorPlugins = [
  MarkdownPlugin.configure({
    options: {
      remarkPlugins: [remarkGfm]
    }
  })
];

// Confirm Dialog Component
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return React.createElement('div', { className: 'dialog-overlay' },
    React.createElement('div', { className: 'dialog' }, [
      React.createElement('h3', { key: 'title', className: 'dialog-title' }, title),
      React.createElement('p', { key: 'message', className: 'dialog-message' }, message),
      React.createElement('div', { key: 'actions', className: 'dialog-actions' }, [
        React.createElement('button', {
          key: 'cancel',
          className: 'dialog-btn dialog-btn-cancel',
          onClick: onCancel
        }, 'Cancel'),
        React.createElement('button', {
          key: 'confirm',
          className: 'dialog-btn dialog-btn-danger',
          onClick: onConfirm
        }, 'Delete')
      ])
    ])
  );
}

// Conflict Dialog Component
function ConflictDialog({ file, local, remote, onKeepLocal, onKeepRemote, onClose }) {
  return React.createElement('div', { className: 'dialog-overlay' },
    React.createElement('div', { className: 'dialog conflict-dialog' }, [
      React.createElement('button', {
        key: 'close',
        className: 'modal-close-btn',
        onClick: onClose
      }, '×'),
      React.createElement('h3', { key: 'title', className: 'dialog-title' }, 'Sync Conflict'),
      React.createElement('p', { key: 'file', className: 'conflict-file' }, `File: ${file}`),
      React.createElement('div', { key: 'diff', className: 'conflict-diff' }, [
        React.createElement('div', { key: 'local', className: 'conflict-side' }, [
          React.createElement('h4', { key: 'label' }, 'Local Version'),
          React.createElement('pre', { key: 'content', className: 'conflict-content' }, local || '(empty)')
        ]),
        React.createElement('div', { key: 'remote', className: 'conflict-side' }, [
          React.createElement('h4', { key: 'label' }, 'Remote Version'),
          React.createElement('pre', { key: 'content', className: 'conflict-content' }, remote || '(empty)')
        ])
      ]),
      React.createElement('div', { key: 'actions', className: 'dialog-actions' }, [
        React.createElement('button', {
          key: 'local',
          className: 'dialog-btn dialog-btn-primary',
          onClick: onKeepLocal
        }, 'Keep Local'),
        React.createElement('button', {
          key: 'remote',
          className: 'dialog-btn dialog-btn-primary',
          onClick: onKeepRemote
        }, 'Keep Remote')
      ])
    ])
  );
}

// GitHub Modal Component
function GitHubModal({ onClose, githubStatus, onConnect, onCreate }) {
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

  return React.createElement('div', {
    className: 'dialog-overlay',
    onClick: (e) => { if (e.target === e.currentTarget) onClose(); }
  },
    React.createElement('div', { className: 'dialog github-modal' }, [
      React.createElement('button', {
        key: 'close',
        className: 'modal-close-btn',
        onClick: onClose
      }, '×'),
      React.createElement('h3', { key: 'title', className: 'dialog-title' },
        isConnected ? 'GitHub Connected' : 'Connect to GitHub'
      ),
      React.createElement('p', { key: 'desc', className: 'dialog-message' },
        isConnected
          ? `Connected as ${username}`
          : 'Connect your workspace to a GitHub repository to sync your files.'
      ),
      hasRepo && !changingRepo && React.createElement('div', { key: 'repo-info', className: 'repo-connected-section' }, [
        React.createElement('p', { key: 'repo-name', className: 'repo-connected' },
          `Repository: ${repoName}`
        ),
        React.createElement('button', {
          key: 'change-repo',
          className: 'dialog-btn',
          onClick: () => setChangingRepo(true)
        }, 'Change Repository')
      ]),
      !isConnected && React.createElement('div', { key: 'actions', className: 'dialog-actions' }, [
        React.createElement('button', {
          key: 'authorize',
          className: 'dialog-btn dialog-btn-primary',
          onClick: handleAuthorize
        }, 'Authorize with GitHub')
      ]),
      isConnected && (!hasRepo || changingRepo) && React.createElement('div', { key: 'repo-section', className: 'repo-section' }, [
        React.createElement('div', { key: 'tabs', className: 'repo-tabs' }, [
          React.createElement('button', {
            key: 'connect-tab',
            className: `repo-tab ${mode === 'connect' ? 'active' : ''}`,
            onClick: () => setMode('connect')
          }, 'Connect Existing'),
          React.createElement('button', {
            key: 'create-tab',
            className: `repo-tab ${mode === 'create' ? 'active' : ''}`,
            onClick: () => setMode('create')
          }, 'Create New')
        ]),
        mode === 'connect' && React.createElement('div', { key: 'connect-form', className: 'repo-form' }, [
          React.createElement('label', { key: 'label', className: 'repo-label' }, 'Repository URL'),
          React.createElement('input', {
            key: 'input',
            type: 'text',
            className: 'repo-input',
            placeholder: 'https://github.com/user/repo',
            value: repoUrl,
            onChange: (e) => setRepoUrl(e.target.value)
          }),
          React.createElement('button', {
            key: 'connect',
            className: 'dialog-btn dialog-btn-primary',
            onClick: handleConnect,
            disabled: !repoUrl.trim()
          }, 'Connect Repository')
        ]),
        mode === 'create' && React.createElement('div', { key: 'create-form', className: 'repo-form' }, [
          React.createElement('label', { key: 'label', className: 'repo-label' }, 'Repository Name'),
          React.createElement('input', {
            key: 'input',
            type: 'text',
            className: 'repo-input',
            placeholder: 'my-project',
            value: newRepoName,
            onChange: (e) => setNewRepoName(e.target.value)
          }),
          React.createElement('button', {
            key: 'create',
            className: 'dialog-btn dialog-btn-primary',
            onClick: handleCreate,
            disabled: !newRepoName.trim()
          }, 'Create Repository')
        ])
      ])
    ])
  );
}

// Context Menu Component
function ContextMenu({ x, y, item, onClose, onAction }) {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  const menuItems = item.type === 'directory'
    ? ['Rename', 'New Folder', 'Delete']
    : ['Rename', 'Delete'];

  return React.createElement('div', {
    className: 'context-menu',
    style: { left: x, top: y }
  }, menuItems.map(action =>
    React.createElement('div', {
      key: action,
      className: 'context-menu-item',
      onClick: (e) => {
        e.stopPropagation();
        onAction(action, item);
        onClose();
      }
    }, action)
  ));
}

// File Browser Component
function FileBrowser({ onFileSelect, currentFile }) {
  const [tree, setTree] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  useEffect(() => {
    loadTree();
  }, []);

  async function loadTree() {
    const res = await fetch('/api/tree');
    const data = await res.json();
    if (data.success) {
      setTree(data.tree);
    }
  }

  async function createNewDoc() {
    try {
      const res = await fetch('/api/file/create', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadTree();
        onFileSelect(data.path);
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  }

  async function createNewFolder() {
    try {
      const res = await fetch('/api/folder/create', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadTree();
        setExpanded(prev => ({ ...prev, [data.path]: true }));
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  }

  function toggleExpand(path) {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  }

  function handleContextMenu(e, item) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  }

  async function handleContextAction(action, item) {
    if (action === 'New Folder') {
      try {
        const res = await fetch('/api/folder/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentDir: item.path })
        });
        const data = await res.json();
        if (data.success) {
          await loadTree();
          setExpanded(prev => ({ ...prev, [item.path]: true, [data.path]: true }));
        }
      } catch (error) {
        console.error('Failed to create subfolder:', error);
      }
    } else if (action === 'Delete') {
      setDeleteConfirm(item);
    } else if (action === 'Rename') {
      setRenaming(item);
      setRenameValue(item.name);
    }
  }

  async function handleRename() {
    if (!renaming || !renameValue.trim() || renameValue === renaming.name) {
      setRenaming(null);
      return;
    }
    try {
      const res = await fetch('/api/item/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPath: renaming.path, newName: renameValue.trim() })
      });
      const data = await res.json();
      if (data.success) {
        await loadTree();
        if (currentFile === renaming.path) {
          onFileSelect(data.newPath);
        }
      }
    } catch (error) {
      console.error('Failed to rename:', error);
    }
    setRenaming(null);
  }

  function handleDragStart(e, item) {
    setDragging(item);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, item) {
    e.preventDefault();
    if (item.type === 'directory' && dragging && dragging.path !== item.path) {
      setDropTarget(item.path);
    }
  }

  function handleDragLeave() {
    setDropTarget(null);
  }

  async function handleDrop(e, targetFolder) {
    e.preventDefault();
    setDropTarget(null);
    if (!dragging || dragging.path === targetFolder.path) {
      setDragging(null);
      return;
    }
    try {
      const res = await fetch('/api/item/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePath: dragging.path, targetDir: targetFolder.path })
      });
      const data = await res.json();
      if (data.success) {
        await loadTree();
        setExpanded(prev => ({ ...prev, [targetFolder.path]: true }));
        if (currentFile === dragging.path) {
          onFileSelect(data.newPath);
        }
      }
    } catch (error) {
      console.error('Failed to move item:', error);
    }
    setDragging(null);
  }

  function handleDragEnd() {
    setDragging(null);
    setDropTarget(null);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/item?path=${encodeURIComponent(deleteConfirm.path)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await loadTree();
        if (currentFile === deleteConfirm.path) {
          onFileSelect(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
    setDeleteConfirm(null);
  }

  function renderTree(items, depth = 0) {
    if (!items) return null;

    const renderName = (item) => {
      if (renaming && renaming.path === item.path) {
        return React.createElement('input', {
          key: 'rename-input',
          className: 'rename-input',
          value: renameValue,
          onChange: (e) => setRenameValue(e.target.value),
          onKeyDown: (e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') setRenaming(null);
          },
          onBlur: handleRename,
          autoFocus: true,
          onClick: (e) => e.stopPropagation()
        });
      }
      return React.createElement('span', { key: 'name' }, ` ${item.name}`);
    };

    return items.map(item => (
      React.createElement('div', {
        key: item.path,
        style: { paddingLeft: `${depth * 12}px` }
      }, [
        item.type === 'directory' ? (
          React.createElement('div', {
            key: 'dir',
            className: `tree-item directory ${dropTarget === item.path ? 'drop-target' : ''}`,
            onClick: () => !renaming && toggleExpand(item.path),
            onContextMenu: (e) => handleContextMenu(e, item),
            onDoubleClick: () => { setRenaming(item); setRenameValue(item.name); },
            draggable: !renaming,
            onDragStart: (e) => handleDragStart(e, item),
            onDragOver: (e) => handleDragOver(e, item),
            onDragLeave: handleDragLeave,
            onDrop: (e) => handleDrop(e, item),
            onDragEnd: handleDragEnd
          }, [
            React.createElement('span', { key: 'icon' }, expanded[item.path] ? '📂' : '📁'),
            renderName(item)
          ])
        ) : (
          React.createElement('div', {
            key: 'file',
            className: `tree-item file ${currentFile === item.path ? 'active' : ''}`,
            onClick: () => !renaming && onFileSelect(item.path),
            onContextMenu: (e) => handleContextMenu(e, item),
            onDoubleClick: () => { setRenaming(item); setRenameValue(item.name); },
            draggable: !renaming,
            onDragStart: (e) => handleDragStart(e, item),
            onDragEnd: handleDragEnd
          }, [
            React.createElement('span', { key: 'icon' }, '📄'),
            renderName(item)
          ])
        ),
        expanded[item.path] && item.children ?
          renderTree(item.children, depth + 1) : null
      ])
    ));
  }

  return React.createElement('div', { className: 'file-browser' }, [
    React.createElement('div', { key: 'header', className: 'browser-header' },
      React.createElement('h2', null, '📁 Files')
    ),
    React.createElement('div', { key: 'actions', className: 'browser-actions' }, [
      React.createElement('button', {
        key: 'new-doc',
        className: 'create-doc-btn',
        onClick: createNewDoc
      }, '+ New Document'),
      React.createElement('button', {
        key: 'new-folder',
        className: 'create-folder-btn',
        onClick: createNewFolder
      }, '+ New Folder')
    ]),
    React.createElement('div', { key: 'tree', className: 'tree' },
      renderTree(tree)
    ),
    contextMenu && React.createElement(ContextMenu, {
      key: 'context-menu',
      x: contextMenu.x,
      y: contextMenu.y,
      item: contextMenu.item,
      onClose: () => setContextMenu(null),
      onAction: handleContextAction
    }),
    deleteConfirm && React.createElement(ConfirmDialog, {
      key: 'delete-dialog',
      title: 'Delete ' + (deleteConfirm.type === 'directory' ? 'Folder' : 'File'),
      message: deleteConfirm.type === 'directory'
        ? `Are you sure you want to delete "${deleteConfirm.name}" and all its contents?`
        : `Are you sure you want to delete "${deleteConfirm.name}"?`,
      onConfirm: handleDelete,
      onCancel: () => setDeleteConfirm(null)
    })
  ]);
}

// Editor Component with Plate
function Editor({ file, onSave }) {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(true);
  const [editorKey, setEditorKey] = useState(0);

  const editor = usePlateEditor({
    plugins: editorPlugins,
    value: markdown ? (editor) => editor.api.markdown.deserialize(markdown) : undefined
  });

  useEffect(() => {
    if (file) {
      loadFile(file);
    }
  }, [file]);

  async function loadFile(path) {
    setLoading(true);
    try {
      const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.success) {
        setMarkdown(data.content);
        setSaved(true);
        setEditorKey(prev => prev + 1); // Force editor re-render with new content
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
    setLoading(false);
  }

  async function saveFile() {
    if (!file || !editor) return;
    
    try {
      // Serialize editor content to markdown
      const markdownContent = editor.api.markdown.serialize();
      
      const res = await fetch('/api/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: file,
          content: markdownContent
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setMarkdown(markdownContent);
        if (onSave) onSave();
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, editor]);

  // Track content changes
  useEffect(() => {
    if (!editor) return;
    
    const unsubscribe = editor.store.subscribe(() => {
      setSaved(false);
    });
    
    return () => unsubscribe();
  }, [editor]);

  if (!file) {
    return React.createElement('div', { className: 'editor-placeholder' },
      React.createElement('div', { className: 'placeholder-content' }, [
        React.createElement('h2', { key: 'title' }, '👈 Select a file to start editing'),
        React.createElement('p', { key: 'desc' }, 'Choose a markdown file from the sidebar')
      ])
    );
  }

  if (loading) {
    return React.createElement('div', { className: 'editor-placeholder' },
      React.createElement('div', { className: 'placeholder-content' },
        React.createElement('p', null, 'Loading...')
      )
    );
  }

  return React.createElement('div', { className: 'editor-container' }, [
    React.createElement('div', { key: 'toolbar', className: 'editor-toolbar' }, [
      React.createElement('div', { key: 'file', className: 'current-file' }, file),
      React.createElement('div', { key: 'actions', className: 'toolbar-actions' }, [
        React.createElement('span', { 
          key: 'status',
          className: 'save-status' 
        }, saved ? '✓ Saved' : 'Unsaved'),
        React.createElement('button', {
          key: 'save',
          onClick: saveFile,
          className: 'save-button',
          disabled: saved
        }, '💾 Save')
      ])
    ]),
    React.createElement(Plate, {
      key: `editor-${editorKey}`,
      editor: editor,
      className: 'plate-editor'
    })
  ]);
}

// Main App
function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [githubStatus, setGithubStatus] = useState(null);
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    // Check GitHub status on mount
    fetch('/api/github/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGithubStatus(data);
        }
      })
      .catch(() => {});

    // Check for OAuth callback in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('github') === 'success') {
      setShowGitHubModal(true);
      window.history.replaceState({}, '', window.location.pathname);
      fetch('/api/github/status')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setGithubStatus(data);
          }
        })
        .catch(() => {});
    }
  }, []);

  const hasRepo = githubStatus?.repo;

  return React.createElement('div', { className: 'app' }, [
    React.createElement('header', { key: 'header', className: 'app-header' }, [
      React.createElement('h1', { key: 'title' }, '📝 Samepage'),
      React.createElement('div', { key: 'header-actions', className: 'header-actions' }, [
        hasRepo && React.createElement('button', {
          key: 'pull-btn',
          className: 'github-pull-btn',
          onClick: async () => {
            try {
              const res = await fetch('/api/github/pull', { method: 'POST' });
              const data = await res.json();
              if (data.success) {
                alert(data.message);
                window.location.reload();
              } else if (data.conflict) {
                setConflict(data);
              } else {
                alert('Pull failed: ' + data.error);
              }
            } catch (error) {
              alert('Pull failed');
            }
          }
        }, '⬇️ Pull'),
        hasRepo && React.createElement('button', {
          key: 'push-btn',
          className: 'github-push-btn',
          onClick: async () => {
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
          }
        }, '⬆️ Push'),
        React.createElement('button', {
          key: 'github-btn',
          className: 'github-connect-btn',
          onClick: () => setShowGitHubModal(true)
        }, githubStatus?.connected ? 'GitHub Connected' : 'Connect GitHub')
      ])
    ]),
    React.createElement('div', { key: 'main', className: 'app-main' }, [
      React.createElement(FileBrowser, {
        key: 'browser',
        onFileSelect: setCurrentFile,
        currentFile: currentFile
      }),
      React.createElement(Editor, {
        key: 'editor',
        file: currentFile,
        onSave: () => console.log('Saved!')
      })
    ]),
    showGitHubModal && React.createElement(GitHubModal, {
      key: 'github-modal',
      onClose: () => setShowGitHubModal(false),
      githubStatus: githubStatus,
      onConnect: async (repoUrl) => {
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
            if (statusData.success) {
              setGithubStatus(statusData);
            }
            setShowGitHubModal(false);
            window.location.reload();
          } else {
            alert('Failed to clone: ' + data.error);
          }
        } catch (error) {
          alert('Failed to clone repository');
        }
      },
      onCreate: async (repoName) => {
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
            if (statusData.success) {
              setGithubStatus(statusData);
            }
            setShowGitHubModal(false);
            alert(`Repository "${repoName}" created! In production, this would push to GitHub.`);
          } else {
            alert('Failed to create: ' + data.error);
          }
        } catch (error) {
          alert('Failed to create repository');
        }
      }
    }),
    conflict && React.createElement(ConflictDialog, {
      key: 'conflict-dialog',
      file: conflict.file,
      local: conflict.local,
      remote: conflict.remote,
      onKeepLocal: async () => {
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
      },
      onKeepRemote: async () => {
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
      },
      onClose: () => setConflict(null)
    })
  ]);
}

// Render
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
