import { useWeb3Modal } from '@web3modal/react';
import Button, { Props } from '../button';

export default function ConnectButton(props: Props) {
  const { onClick, children, ...rest } = props;

  const { open } = useWeb3Modal();
  const handleClick = async () => {
    onClick?.();
    await open();
  };

  return (
    <Button {...rest} onClick={handleClick}>
      {children}
    </Button>
  );
}
