import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plate, PlateContent, PlateElement, PlateLeaf, usePlateEditor } from 'platejs/react';
import { MarkdownPlugin } from '@platejs/markdown';
import {
  BasicBlocksPlugin,
  BasicMarksPlugin,
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  CodePlugin,
  UnderlinePlugin,
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  HorizontalRulePlugin,
} from '@platejs/basic-nodes/react';
import { CodeBlockPlugin, CodeLinePlugin, CodeSyntaxPlugin } from '@platejs/code-block/react';
import { LinkPlugin } from '@platejs/link/react';
import { ListPlugin } from '@platejs/list/react';
import { IndentPlugin } from '@platejs/indent/react';

// Floating toolbar component
function FloatingToolbar({ editor }) {
  const [position, setPosition] = useState(null);
  const [visible, setVisible] = useState(false);
  const toolbarRef = useRef(null);

  useEffect(() => {
    function handleSelectionChange() {
      const domSelection = window.getSelection();
      if (!domSelection || domSelection.isCollapsed || !domSelection.rangeCount) {
        setVisible(false);
        return;
      }
      const text = domSelection.toString().trim();
      if (!text) {
        setVisible(false);
        return;
      }
      const range = domSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0) {
        setVisible(false);
        return;
      }
      setPosition({
        top: rect.top - 48,
        left: rect.left + rect.width / 2,
      });
      setVisible(true);
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  function toggleMark(type) {
    if (!editor) return;
    editor.tf.toggle.mark({ key: type });
  }

  function isMarkActive(type) {
    if (!editor) return false;
    try {
      const marks = editor.getMarks();
      return marks ? !!marks[type] : false;
    } catch {
      return false;
    }
  }

  if (!visible || !position) return null;

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        className={`toolbar-btn ${isMarkActive('bold') ? 'active' : ''}`}
        onClick={() => toggleMark('bold')}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        className={`toolbar-btn ${isMarkActive('italic') ? 'active' : ''}`}
        onClick={() => toggleMark('italic')}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        className={`toolbar-btn ${isMarkActive('underline') ? 'active' : ''}`}
        onClick={() => toggleMark('underline')}
        title="Underline (Ctrl+U)"
      >
        <span style={{ textDecoration: 'underline' }}>U</span>
      </button>
      <button
        className={`toolbar-btn ${isMarkActive('strikethrough') ? 'active' : ''}`}
        onClick={() => toggleMark('strikethrough')}
        title="Strikethrough"
      >
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </button>
      <button
        className={`toolbar-btn ${isMarkActive('code') ? 'active' : ''}`}
        onClick={() => toggleMark('code')}
        title="Code"
      >
        <code>&lt;/&gt;</code>
      </button>
    </div>
  );
}

// Slash command menu
function SlashMenu({ editor, position, onClose }) {
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);

  const commands = [
    { label: 'Heading 1', description: 'Large section heading', icon: 'H1', action: () => { editor.tf.toggle.block({ type: 'h1' }); } },
    { label: 'Heading 2', description: 'Medium section heading', icon: 'H2', action: () => { editor.tf.toggle.block({ type: 'h2' }); } },
    { label: 'Heading 3', description: 'Small section heading', icon: 'H3', action: () => { editor.tf.toggle.block({ type: 'h3' }); } },
    { label: 'Bulleted List', description: 'Create a bulleted list', icon: '•', action: () => { editor.tf.toggle.block({ type: 'ul' }); } },
    { label: 'Numbered List', description: 'Create a numbered list', icon: '1.', action: () => { editor.tf.toggle.block({ type: 'ol' }); } },
    { label: 'Quote', description: 'Capture a quote', icon: '"', action: () => { editor.tf.toggle.block({ type: 'blockquote' }); } },
    { label: 'Code Block', description: 'Insert a code block', icon: '{ }', action: () => { editor.tf.toggle.block({ type: 'code_block' }); } },
    { label: 'Divider', description: 'Insert a horizontal line', icon: '—', action: () => { editor.tf.toggle.block({ type: 'hr' }); } },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        executeCommand(filtered[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Backspace' && filter === '') {
        onClose();
      } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        setFilter(f => f + e.key);
      } else if (e.key === 'Backspace') {
        setFilter(f => f.slice(0, -1));
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [filter, selectedIndex, filtered]);

  function executeCommand(cmd) {
    // Delete the slash character
    try {
      editor.deleteBackward('character');
      // Delete filter chars
      for (let i = 0; i < filter.length; i++) {
        editor.deleteBackward('character');
      }
    } catch (e) {
      // ignore
    }
    cmd.action();
    onClose();
  }

  if (!position) return null;

  return (
    <div className="slash-menu" ref={menuRef}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onMouseDown={e => e.preventDefault()}
    >
      <div className="slash-menu-header">Commands</div>
      {filtered.length === 0 && (
        <div className="slash-menu-empty">No results</div>
      )}
      {filtered.map((cmd, i) => (
        <div
          key={cmd.label}
          className={`slash-menu-item ${i === selectedIndex ? 'selected' : ''}`}
          onClick={() => executeCommand(cmd)}
          onMouseEnter={() => setSelectedIndex(i)}
        >
          <span className="slash-menu-icon">{cmd.icon}</span>
          <div className="slash-menu-text">
            <span className="slash-menu-label">{cmd.label}</span>
            <span className="slash-menu-desc">{cmd.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Editor({ file, onSave }) {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(true);
  const [editorKey, setEditorKey] = useState(0);

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
        setMarkdown(data.content || '');
        setSaved(true);
        setEditorKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
    setLoading(false);
  }

  // Extract title from file path
  function getTitle(filePath) {
    if (!filePath) return '';
    const parts = filePath.split('/');
    const name = parts[parts.length - 1];
    return name.replace(/\.md$/, '').replace(/-/g, ' ').replace(/_/g, ' ');
  }

  // Extract breadcrumb from file path
  function getBreadcrumb(filePath) {
    if (!filePath) return [];
    const parts = filePath.split('/').filter(Boolean);
    return parts.slice(0, -1);
  }

  if (!file) {
    return (
      <div className="editor-empty">
        <div className="editor-empty-content">
          <div className="editor-empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M12 6h16l8 8v28a2 2 0 01-2 2H12a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#d4d4d4" strokeWidth="2" fill="none"/>
              <path d="M28 6v8h8" stroke="#d4d4d4" strokeWidth="2"/>
              <path d="M16 22h16M16 28h12M16 34h8" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2>Select a page to start editing</h2>
          <p>Choose a markdown file from the sidebar, or create a new page</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="editor-empty">
        <div className="editor-empty-content">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PlateEditor
      key={editorKey}
      file={file}
      initialMarkdown={markdown}
      saved={saved}
      setSaved={setSaved}
      onSave={onSave}
      getTitle={getTitle}
      getBreadcrumb={getBreadcrumb}
    />
  );
}

function PlateEditor({ file, initialMarkdown, saved, setSaved, onSave, getTitle, getBreadcrumb }) {
  const [slashMenu, setSlashMenu] = useState(null);

  const editor = usePlateEditor({
    plugins: [
      BasicBlocksPlugin,
      BasicMarksPlugin,
      CodeBlockPlugin,
      LinkPlugin,
      ListPlugin,
      IndentPlugin.configure({
        inject: {
          targetPlugins: [
            'p', 'h1', 'h2', 'h3', 'blockquote', 'code_block',
          ],
        },
      }),
      MarkdownPlugin,
    ],
    value: (editor) => {
      try {
        return editor.getApi(MarkdownPlugin).markdown.deserialize(initialMarkdown || '');
      } catch (e) {
        console.warn('Markdown deserialize failed:', e);
        return [{ type: 'p', children: [{ text: initialMarkdown || '' }] }];
      }
    },
  });

  const saveFile = useCallback(async () => {
    if (!file || !editor) return;
    try {
      const markdownContent = editor.getApi(MarkdownPlugin).markdown.serialize();
      const res = await fetch('/api/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file, content: markdownContent })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        if (onSave) onSave();
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }, [file, editor, setSaved, onSave]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveFile]);

  // Handle slash command trigger
  function handleKeyDown(e) {
    if (e.key === '/' && !slashMenu) {
      // Show slash menu after a brief delay so the "/" is inserted first
      setTimeout(() => {
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSlashMenu({
            top: rect.bottom + 4,
            left: rect.left,
          });
        }
      }, 10);
    }
  }

  const breadcrumb = getBreadcrumb(file);

  return (
    <div className="editor-container">
      {/* Top bar with breadcrumb and save status */}
      <div className="editor-topbar">
        <div className="editor-breadcrumb">
          {breadcrumb.map((part, i) => (
            <React.Fragment key={i}>
              <span className="breadcrumb-item">{part}</span>
              <span className="breadcrumb-sep">/</span>
            </React.Fragment>
          ))}
          <span className="breadcrumb-current">{getTitle(file)}</span>
        </div>
        <div className="editor-status">
          <span className={`save-indicator ${saved ? 'saved' : 'unsaved'}`}>
            {saved ? 'Saved' : 'Editing'}
          </span>
          {!saved && (
            <button onClick={saveFile} className="save-btn">
              Save
            </button>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="editor-scroll">
        <div className="editor-page">
          <Plate
            editor={editor}
            onChange={() => setSaved(false)}
          >
            <FloatingToolbar editor={editor} />
            <PlateContent
              className="plate-editor"
              placeholder="Type '/' for commands..."
              onKeyDown={handleKeyDown}
            />
          </Plate>
        </div>
      </div>

      {slashMenu && (
        <SlashMenu
          editor={editor}
          position={slashMenu}
          onClose={() => setSlashMenu(null)}
        />
      )}
    </div>
  );
}
