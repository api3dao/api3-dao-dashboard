import { ReactNode, useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { images } from '../../utils';
import styles from './dropdown.module.scss';

interface DropdownProps {
  children: ReactNode;
  menu: ReactNode;
  icon?: ReactNode;
  alignIcon?: 'start' | 'center' | 'end';
}

interface DropdownMenuProps {
  children: ReactNode;
  position?: 'top' | 'bottom';
}

interface DropdownMenuItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DropdownMenu = ({ children, position = 'bottom' }: DropdownMenuProps) => (
  <div
    className={classNames(styles.dropdownMenu, {
      [styles.top]: position === 'top',
      [styles.bottom]: position === 'bottom',
    })}
  >
    {children}
  </div>
);

export const DropdownMenuItem = ({ children, className, onClick }: DropdownMenuItemProps) => (
  <div onClick={onClick} className={classNames(styles.dropdownMenuItem, className, { [styles.clickable]: onClick })}>
    {children}
  </div>
);

const Dropdown = ({ children, menu, icon, alignIcon = 'center' }: DropdownProps) => {
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
    <div className={styles.dropdown} ref={dropdownRef}>
      <div
        className={classNames(styles.dropdownButton, {
          [styles.alignStart]: alignIcon === 'start',
          [styles.alignCenter]: alignIcon === 'center',
          [styles.alignEnd]: alignIcon === 'end',
        })}
        onClick={() => setOpen(!open)}
      >
        {children}
        <div className={classNames(styles.dropdownIcon, { [styles.open]: open })}>
          {icon || <img src={images.dropdown} alt="dropdown icon" />}
        </div>
      </div>
      {open && menu}
    </div>
  );
};

export default Dropdown;
