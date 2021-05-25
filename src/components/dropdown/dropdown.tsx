import { ReactNode, useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import './dropdown.scss';

interface DrowdownProps {
  children: ReactNode;
  menu: ReactNode;
}

interface DropdownMenuProps {
  children: ReactNode;
}

interface DropdownMenuItemProps {
  children: ReactNode;
  className?: string;
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => <div className="dropdown-menu">{children}</div>;

export const DropdownMenuItem = ({ children, className }: DropdownMenuItemProps) => (
  <div className={classNames('dropdown-menu-item', className)}>{children}</div>
);

const Dropdown = ({ children, menu }: DrowdownProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div className="dropdown-button" onClick={() => setOpen(!open)}>
        {children}
        <img src="/dropdown.svg" className={classNames('dropdown-icon', { [`_open`]: open })} alt="dropdown icon" />
      </div>
      {open && menu}
    </div>
  );
};

export default Dropdown;
