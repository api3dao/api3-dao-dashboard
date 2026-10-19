import { utils } from 'ethers';
import { Address } from 'wagmi';
import { EvmScriptCall, useChainData } from '../../../chain-data';
import ExternalLink from '../../../components/external-link';
import { getEtherscanAddressUrl } from '../../../contracts';
import { EnsName } from './ens-name';
import styles from './proposal-calls.module.scss';

interface Props {
  calls: EvmScriptCall[];
}

/**
 * The calls of a proposal created outside of the DAO dashboard, one row per call. Addresses and calldata are shown as
 * they are, because the ABIs of the targets are not known, so the reader checks them with the tools of their choice.
 */
const ProposalCalls = (props: Props) => {
  const { calls } = props;
  const { chainId } = useChainData();
  const showValue = calls.some((call) => call.value.gt(0));

  return (
    <div className={styles.callsWrapper}>
      <table className={styles.calls} data-cy="proposal-calls">
        <thead>
          <tr>
            <th className={styles.index}>#</th>
            <th className={styles.address}>Target</th>
            <th className={styles.address}>Via</th>
            {showValue && <th className={styles.value}>Value (Wei)</th>}
            <th>Calldata</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <AddressLink address={call.targetAddress} chainId={chainId} />
              </td>
              <td>
                {call.viaAgents.length === 0
                  ? 'Direct'
                  : call.viaAgents.map((agent) => <AddressLink key={agent} address={agent} chainId={chainId} />)}
              </td>
              {showValue && <td>{call.value.toString()}</td>}
              <td>
                <Calldata data={call.data} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProposalCalls;

function AddressLink(props: { address: string; chainId: number | undefined }) {
  const { address, chainId } = props;
  const url = getEtherscanAddressUrl(chainId, address);

  return (
    <div>
      {url ? (
        <ExternalLink className={styles.link} href={url}>
          <EnsName address={address as Address} />
        </ExternalLink>
      ) : (
        address
      )}
    </div>
  );
}

function Calldata(props: { data: string }) {
  const { data } = props;
  const length = utils.hexDataLength(data);
  if (length === 0) return <>None</>;

  const selector = utils.hexDataSlice(data, 0, Math.min(length, 4));
  return (
    <details className={styles.calldata}>
      <summary>
        <code>{selector}</code> and {Math.max(length - 4, 0)} more bytes
      </summary>
      <code className={styles.rawData}>{data}</code>
    </details>
  );
}
