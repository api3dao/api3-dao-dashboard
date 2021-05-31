import { ReactNode, useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import './dropdown.scss';

interface DropwdownProps {
  children: ReactNode;
  menu: ReactNode;
  icon?: ReactNode;
  alignIcon?: 'start' | 'center' | 'end';
}

interface DropdownMenuProps {
  children: ReactNode;
}

interface DropdownMenuItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => <div className="dropdown-menu">{children}</div>;

export const DropdownMenuItem = ({ children, className, onClick }: DropdownMenuItemProps) => (
  <div onClick={onClick} className={classNames('dropdown-menu-item', className, { [`_clickable`]: onClick })}>
    {children}
  </div>
);

const Dropdown = ({ children, menu, icon, alignIcon = 'center' }: DropwdownProps) => {
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
      <div className={classNames('dropdown-button', alignIcon)} onClick={() => setOpen(!open)}>
        {children}
        <div className={classNames('dropdown-icon', { [`_open`]: open })}>
          {icon || <img src="/dropdown.svg" alt="dropdown icon" />}
        </div>
      </div>
      {open && menu}
    </div>
  );
};

export default Dropdown;
