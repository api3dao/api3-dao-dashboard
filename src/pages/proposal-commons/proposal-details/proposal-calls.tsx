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
 * The calls of a metadata version 3 proposal, the DAO migration proposal, one row per call. Addresses and calldata are
 * shown as they are, because the ABIs of the targets are not known, so the reader checks them with the tools of their
 * choice.
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
            <th>Target</th>
            {showValue && <th className={styles.value}>Value (Wei)</th>}
            <th>Calldata</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td className={styles.address}>
                <AddressLink address={call.targetAddress} chainId={chainId} />
                {/* The agents that forward the call, outermost first. A call without them is made by the voting app */}
                {call.viaAgents.map((agent) => (
                  <div key={agent} className={styles.via}>
                    via <AddressLink address={agent} chainId={chainId} />
                  </div>
                ))}
              </td>
              {showValue && <td className={styles.value}>{call.value.toString()}</td>}
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
    <span>
      {url ? (
        <ExternalLink className={styles.link} href={url}>
          <EnsName address={address as Address} />
        </ExternalLink>
      ) : (
        address
      )}
    </span>
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
        <code>
          {selector}
          {length > 4 && '...'}
        </code>
      </summary>
      <code className={styles.rawData}>{data}</code>
    </details>
  );
}
