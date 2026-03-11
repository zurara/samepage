import React, { useState, useEffect } from 'react';
import ContextMenu from './ContextMenu';
import ConfirmDialog from './ConfirmDialog';

export default function FileBrowser({ onFileSelect, currentFile }) {
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

  function renderName(item) {
    if (renaming && renaming.path === item.path) {
      return (
        <input
          className="rename-input"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') setRenaming(null);
          }}
          onBlur={handleRename}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    return <span className="tree-item-name">{item.name}</span>;
  }

  function renderTree(items, depth = 0) {
    if (!items) return null;

    return items.map(item => (
      <div key={item.path}>
        {item.type === 'directory' ? (
          <div
            className={`tree-item tree-item-dir ${dropTarget === item.path ? 'drop-target' : ''}`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() => !renaming && toggleExpand(item.path)}
            onContextMenu={(e) => handleContextMenu(e, item)}
            onDoubleClick={() => { setRenaming(item); setRenameValue(item.name); }}
            draggable={!renaming}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleDragOver(e, item)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item)}
            onDragEnd={handleDragEnd}
          >
            <span className="tree-chevron">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ transform: expanded[item.path] ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </span>
            {renderName(item)}
          </div>
        ) : (
          <div
            className={`tree-item tree-item-file ${currentFile === item.path ? 'active' : ''}`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() => !renaming && onFileSelect(item.path)}
            onContextMenu={(e) => handleContextMenu(e, item)}
            onDoubleClick={() => { setRenaming(item); setRenameValue(item.name); }}
            draggable={!renaming}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
          >
            <span className="tree-file-icon">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 1h5.5L13 4.5V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1" fill="none"/>
                <path d="M9.5 1v3.5H13" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </span>
            {renderName(item)}
          </div>
        )}
        {expanded[item.path] && item.children ? renderTree(item.children, depth + 1) : null}
      </div>
    ));
  }

  return (
    <div className="file-browser">
      <div className="browser-section-label">
        <span>Pages</span>
        <div className="browser-quick-actions">
          <button className="icon-btn" onClick={createNewDoc} title="New page">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="icon-btn" onClick={createNewFolder} title="New folder">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h4l2 2h6v7H2V4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
              <path d="M8 7.5V11.5M6 9.5H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="tree">
        {renderTree(tree)}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title={'Delete ' + (deleteConfirm.type === 'directory' ? 'Folder' : 'File')}
          message={
            deleteConfirm.type === 'directory'
              ? `Are you sure you want to delete "${deleteConfirm.name}" and all its contents?`
              : `Are you sure you want to delete "${deleteConfirm.name}"?`
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
