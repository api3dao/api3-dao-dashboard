import { useMemo } from 'react';
import { utils } from 'ethers';
import { Address } from 'wagmi';
import { EvmScriptCall, useChainData } from '../../../chain-data';
import ExternalLink from '../../../components/external-link';
import { getEtherscanAddressUrl } from '../../../contracts';
import { EnsName } from './ens-name';
import styles from './proposal-calls.module.scss';

// Names of the DAO contracts, keyed as in the contract deployment files. Any other address is shown as is.
const CONTRACT_NAMES: { [key: string]: string } = {
  api3Token: 'API3 token',
  timelockManager: 'Timelock manager',
  api3Pool: 'API3 pool',
  convenience: 'Convenience',
  dao: 'Kernel',
  acl: 'ACL',
  votingAppPrimary: 'Primary voting app',
  votingAppSecondary: 'Secondary voting app',
  agentAppPrimary: 'Primary agent',
  agentAppSecondary: 'Secondary agent',
};

type ContractNames = { [address: string]: string };

interface Props {
  calls: EvmScriptCall[];
}

/**
 * The calls of a proposal created outside of the DAO dashboard, one row per call. The calldata is shown as is, because
 * the ABI of the target is not known, so the reader decodes it with the tools of their choice.
 */
const ProposalCalls = (props: Props) => {
  const { calls } = props;
  const { chainId, contracts } = useChainData();

  const contractNames = useMemo(() => {
    const names: ContractNames = {};
    Object.entries(contracts ?? {}).forEach(([key, address]) => {
      if (CONTRACT_NAMES[key]) names[address.toLowerCase()] = CONTRACT_NAMES[key]!;
    });
    return names;
  }, [contracts]);
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
                <ContractAddress address={call.targetAddress} chainId={chainId} contractNames={contractNames} />
              </td>
              <td>
                {call.viaAgents.length === 0
                  ? 'Direct'
                  : call.viaAgents.map((agent) => (
                      <ContractAddress key={agent} address={agent} chainId={chainId} contractNames={contractNames} />
                    ))}
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

interface ContractAddressProps {
  address: string;
  chainId: number | undefined;
  contractNames: ContractNames;
}

function ContractAddress(props: ContractAddressProps) {
  const { address, chainId, contractNames } = props;
  const name = contractNames[address.toLowerCase()];
  const url = getEtherscanAddressUrl(chainId, address);

  return (
    <>
      {name && <div className={styles.contractName}>{name}</div>}
      <div>
        {url ? (
          <ExternalLink className={styles.link} href={url}>
            <EnsName address={address as Address} />
          </ExternalLink>
        ) : (
          address
        )}
      </div>
    </>
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
