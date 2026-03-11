import React, { useEffect } from 'react';

export default function ContextMenu({ x, y, item, onClose, onAction }) {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  const menuItems = item.type === 'directory'
    ? ['Rename', 'New Folder', 'Delete']
    : ['Rename', 'Delete'];

  return (
    <div className="context-menu" style={{ left: x, top: y }}>
      {menuItems.map(action => (
        <div
          key={action}
          className="context-menu-item"
          onClick={(e) => {
            e.stopPropagation();
            onAction(action, item);
            onClose();
          }}
        >
          {action}
        </div>
      ))}
    </div>
  );
}
