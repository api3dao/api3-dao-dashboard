import { ReactNode, useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { images } from '../../utils';
import styles from './dropdown.module.scss';
import { triggerOnEnter } from '../modal';

interface DropdownProps {
  children: ReactNode;
  menu: ReactNode;
  icon?: ReactNode;
  alignIcon?: 'start' | 'center' | 'end';
  className?: string;
  openClassName?: string;
}

interface DropdownMenuProps {
  children: ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
}

interface DropdownMenuItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DropdownMenu = ({ children, position = 'bottom', className }: DropdownMenuProps) => (
  <div
    className={classNames(styles.dropdownMenu, className, {
      [styles.top]: position === 'top',
      [styles.bottom]: position === 'bottom',
    })}
  >
    {children}
  </div>
);

export const DropdownMenuItem = ({ children, className, onClick }: DropdownMenuItemProps) => (
  <div
    onClick={onClick}
    tabIndex={onClick && 0}
    onKeyPress={onClick && triggerOnEnter(onClick)}
    className={classNames(styles.dropdownMenuItem, className, { [styles.clickable]: onClick })}
  >
    {children}
  </div>
);

const Dropdown = ({ children, menu, icon, alignIcon = 'center', className, openClassName }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleOpen = () => setOpen(!open);

  const handleOutsideEvent = (event: MouseEvent | KeyboardEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('mousedown', handleOutsideEvent);
    // NOTE: Hacky way to make sure only one dropdown is open at a time using keyboard navigation, because blur event
    // doesn't work. This might possibly hide the dropdown in some unwanted cases in the future, but works for us so
    // far.
    window.addEventListener('keypress', handleOutsideEvent);
    return () => {
      window.removeEventListener('mousedown', handleOutsideEvent);
      window.removeEventListener('keypress', handleOutsideEvent);
    };
  }, []);

  return (
    <div className={classNames(styles.dropdown, open && openClassName, className)} ref={dropdownRef}>
      <div
        className={classNames(styles.dropdownButton, {
          [styles.alignStart]: alignIcon === 'start',
          [styles.alignCenter]: alignIcon === 'center',
          [styles.alignEnd]: alignIcon === 'end',
        })}
        onClick={toggleOpen}
        tabIndex={0}
        onKeyPress={triggerOnEnter(toggleOpen)}
      >
        {children}
        <div className={classNames(styles.dropdownIcon, { [styles.open]: open })}>
          {icon || <img src={images.arrowDropdown} alt="dropdown icon" />}
        </div>
      </div>
      {open && menu}
    </div>
  );
};

export default Dropdown;
