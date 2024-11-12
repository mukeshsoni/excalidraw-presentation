import React, { useState, useRef, useEffect } from 'react';
import './dropdownmenu.css'; // Import styles
import EmptyButton from '../empty-button';

export type Option = {
  label: string;
  value: string;
};
type Props = {
  options: Array<Option>;
  onOptionSelect: (option: Option) => void;
};
const DropdownMenu = ({ options, onOptionSelect }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Toggles the dropdown visibility
  const toggleDropdown = () => setIsOpen((prevState) => !prevState);

  // Close the menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // @ts-expect-error
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
      ref={menuRef}
    >
      <EmptyButton style={{ fontSize: 20 }} onClick={toggleDropdown}>
        &#x22EE; {/* Triple dot icon */}
      </EmptyButton>
      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: '30px',
            right: '0',
            minWidth: '160px',
            fontSize: '12px',
            backgroundColor: 'white',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            padding: '0',
            listStyle: 'none',
            margin: '0',
            zIndex: '1000',
          }}
          className="dropdown-menu"
        >
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => {
                onOptionSelect(option);
                setIsOpen(false); // Close the menu after selecting
              }}
              style={{ padding: '10px 15px', cursor: 'pointer' }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
