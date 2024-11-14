import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type DropdownProps = {
  position?: 'top' | 'bottom';
  options: React.ReactNode[];
  trigger?: React.ReactNode;
};

const Dropdown: React.FC<DropdownProps> = ({
  position = 'bottom',
  options,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyles, setMenuStyles] = useState({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      triggerRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);

      if (triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const menuWidth = dropdownRef.current
          ? dropdownRef.current.offsetWidth
          : 0;
        const viewportWidth = window.innerWidth;

        // Adjust the horizontal position to prevent clipping
        let left = triggerRect.left;
        if (left + menuWidth > viewportWidth) {
          left = viewportWidth - menuWidth - 10; // add small padding from viewport edge
        }
        left = Math.max(left, 10); // ensure it doesn’t go off the left side of the screen

        // Calculate vertical position based on the `position` prop
        const top = position === 'top' ? triggerRect.top : triggerRect.bottom;
        const transform =
          position === 'top' ? 'translateY(-100%)' : 'translateY(0)';

        setMenuStyles({
          top,
          left,
          transform,
        });
      }
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, position]);

  const dropdownMenu = (
    <div
      ref={dropdownRef}
      style={{
        ...menuStyles,
        position: 'absolute',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '8px',
        zIndex: 1000,
        display: isOpen ? 'block' : 'none',
      }}
    >
      {options.map((option, index) => (
        <div key={index} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          {option}
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      ref={triggerRef}
    >
      <div
        onClick={toggleDropdown}
        style={{ cursor: 'pointer', display: 'inline-block' }}
      >
        {trigger || <button>Open Menu</button>}
      </div>
      {createPortal(dropdownMenu, document.body)}
    </div>
  );
};

export default Dropdown;
