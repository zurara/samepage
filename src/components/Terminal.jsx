import React, { useState, useRef, useEffect } from 'react';

export default function Terminal({ onClose }) {
  const [history, setHistory] = useState([
    { type: 'info', text: 'Samepage Terminal — run commands in your workspace' },
    { type: 'info', text: 'Type a command and press Enter. Type "clear" to clear.' }
  ]);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function runCommand(cmd) {
    if (!cmd.trim()) return;

    // Add to command history
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Handle clear
    if (cmd.trim() === 'clear') {
      setHistory([]);
      return;
    }

    // Show command in output
    setHistory(prev => [...prev, { type: 'cmd', text: cmd }]);
    setRunning(true);

    try {
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();

      if (data.stdout) {
        setHistory(prev => [...prev, { type: 'stdout', text: data.stdout }]);
      }
      if (data.stderr) {
        setHistory(prev => [...prev, { type: 'stderr', text: data.stderr }]);
      }
      if (data.error) {
        setHistory(prev => [...prev, { type: 'error', text: data.error }]);
      }
    } catch (err) {
      setHistory(prev => [...prev, { type: 'error', text: 'Failed to execute command' }]);
    }

    setRunning(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !running) {
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= cmdHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(cmdHistory[newIndex]);
        }
      }
    }
  }

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>
        <button className="terminal-close" onClick={onClose}>×</button>
      </div>
      <div className="terminal-output" ref={scrollRef} onClick={() => inputRef.current?.focus()}>
        {history.map((entry, i) => (
          <div key={i} className={`terminal-line terminal-${entry.type}`}>
            {entry.type === 'cmd' && <span className="terminal-prompt">$ </span>}
            {entry.text}
          </div>
        ))}
        <div className="terminal-input-line">
          <span className="terminal-prompt">$ </span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={running}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
