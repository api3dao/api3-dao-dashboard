import { utils } from 'ethers';
import { EvmScriptCall, ProposalType, useChainData } from '../../../chain-data';
import ExternalLink from '../../../components/external-link';
import { getEtherscanAddressUrl } from '../../../contracts';
import styles from './proposal-calls.module.scss';

interface Props {
  calls: EvmScriptCall[];
  type: ProposalType;
}

/**
 * The calls of a metadata version 3 proposal, the DAO migration proposal, one row per call. Addresses and calldata are
 * shown as they are, no ENS name in place of an address, because the ABIs of the targets are not known and the reader
 * checks every address against the proposal's own list with the tools of their choice.
 */
const ProposalCalls = (props: Props) => {
  const { calls, type } = props;
  const { chainId, contracts } = useChainData();
  // The voting app of the proposal executes its script, so it calls every target an agent does not
  const votingApp = type === 'primary' ? contracts?.votingAppPrimary : contracts?.votingAppSecondary;
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
              <td className={styles.index}>{index + 1}</td>
              <td className={styles.address}>
                <AddressLink address={call.targetAddress} chainId={chainId} />
                <Caller call={call} votingApp={votingApp} chainId={chainId} />
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
          {address}
        </ExternalLink>
      ) : (
        address
      )}
    </span>
  );
}

/**
 * The address the target sees as the caller: the agent that forwards the call through its "execute" function, or the
 * voting app for a call it makes itself. An agent can be reached through another one, which only relays the call and is
 * left out.
 */
function Caller(props: { call: EvmScriptCall; votingApp: string | undefined; chainId: number | undefined }) {
  const { call, votingApp, chainId } = props;
  const caller = call.viaAgents.at(-1) ?? votingApp;
  if (!caller) return null;

  return (
    <div className={styles.caller}>
      called by <AddressLink address={caller} chainId={chainId} />
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
        <code>
          {selector}
          {length > 4 && '...'}
        </code>
      </summary>
      <code className={styles.rawData}>{data}</code>
    </details>
  );
}
