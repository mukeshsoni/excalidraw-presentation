import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type Position = 'top' | 'bottom' | 'left' | 'right';

type DropdownProps = {
  position?: Position;
  options: React.ReactNode[];
  trigger?: React.ReactNode;
};

const Dropdown: React.FC<DropdownProps> = ({ position, options, trigger }) => {
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

  const calculateOptimalPosition = (
    triggerRect: DOMRect,
    menuWidth: number,
    menuHeight: number,
  ): Position => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const spaceRight = viewportWidth - triggerRect.right;
    const spaceLeft = triggerRect.left;

    if (spaceBelow >= menuHeight) return 'bottom';
    if (spaceAbove >= menuHeight) return 'top';
    if (spaceRight >= menuWidth) return 'right';
    if (spaceLeft >= menuWidth) return 'left';

    return 'bottom'; // Default to bottom if no other option fits
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);

      if (triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const menuWidth = dropdownRef.current
          ? dropdownRef.current.offsetWidth
          : 0;
        const menuHeight = dropdownRef.current
          ? dropdownRef.current.offsetHeight
          : 0;

        // Determine the position to use
        const calculatedPosition =
          position ||
          calculateOptimalPosition(triggerRect, menuWidth, menuHeight);

        // Set menu styles based on the calculated position
        let top = 0;
        let left = 0;
        let transform = '';

        switch (calculatedPosition) {
          case 'top':
            top = triggerRect.top;
            left = triggerRect.left;
            transform = 'translateY(-100%)';
            break;
          case 'bottom':
            top = triggerRect.bottom;
            left = triggerRect.left;
            break;
          case 'left':
            top = triggerRect.top;
            left = triggerRect.left;
            transform = 'translateX(-100%)';
            break;
          case 'right':
            top = triggerRect.top;
            left = triggerRect.right;
            break;
          default:
            break;
        }

        // Ensure menu stays within viewport horizontally
        if (left + menuWidth > window.innerWidth) {
          left = window.innerWidth - menuWidth - 10; // add small padding from viewport edge
        }
        left = Math.max(left, 10); // prevent clipping on the left

        // Ensure menu stays within viewport vertically
        if (top + menuHeight > window.innerHeight) {
          top = window.innerHeight - menuHeight - 10; // add small padding from viewport edge
        }
        top = Math.max(top, 10); // prevent clipping at the top

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
        <div key={index} style={{ padding: '4px 8px', cursor: 'pointer' }}>
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
