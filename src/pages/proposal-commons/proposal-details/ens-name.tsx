import { Address, useEnsName } from 'wagmi';

export function EnsName(props: { address: Address }) {
  const { address } = props;
  const { data } = useEnsName({ address });

  return <>{data || address}</>;
}
