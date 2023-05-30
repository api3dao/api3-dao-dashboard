import { useWeb3Modal } from '@web3modal/react';
import Button, { Props } from '../button';
import { MouseEventHandler } from 'react';

export default function ConnectButton(props: Props) {
  const { onClick, children, ...rest } = props;

  const { open } = useWeb3Modal();
  const handleClick: MouseEventHandler<HTMLButtonElement> = async (ev) => {
    onClick?.(ev);
    await open();
  };

  return (
    <Button {...rest} onClick={handleClick}>
      {children}
    </Button>
  );
}
