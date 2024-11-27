import classNames from 'classnames';
import Dropdown, { DropdownMenu, DropdownMenuItem } from '../../../components/dropdown';
import { FormattedTreasury, useTreasuries } from './hooks';
import styles from './treasury.module.scss';
import { images } from '../../../utils';
import { getEtherscanAddressUrl, useApi3AgentAddresses } from '../../../contracts';
import { TreasuryType, useChainData } from '../../../chain-data';
import { Tooltip } from '../../../components/tooltip';
import ExternalLink from '../../../components/external-link';

interface TreasuryDropdownProps {
  data: FormattedTreasury[];
  type: TreasuryType;
}

const TreasuryDropdown = (props: TreasuryDropdownProps) => {
  const { data, type } = props;
  const { chainId } = useChainData();
  const agentAddresses = useApi3AgentAddresses();
  const etherscanExplainer = `Etherscan link for the ${type} DAO agent`;
  const agentAddress = agentAddresses?.[type];
  const etherscanAddressUrl = agentAddress && getEtherscanAddressUrl(chainId, agentAddress);

  return (
    <Dropdown
      menu={
        <DropdownMenu>
          {data.map(({ name, amountAndSymbol }) => (
            <DropdownMenuItem className={styles.treasuryMenuItem} key={`${type}${name}`}>
              <p className={styles.menuItemLabel}>{name}</p>
              <p className={styles.menuItemValue}>{amountAndSymbol}</p>
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      }
    >
      <div className={styles.treasuryButton}>
        <p className={styles.label}>{type}</p>
        {etherscanAddressUrl && (
          <span className={styles.etherScanLink}>
            <Tooltip overlay={etherscanExplainer}>
              <ExternalLink href={etherscanAddressUrl} className={styles.dropdownLink}>
                <img
                  src={images.externalLink}
                  alt={etherscanExplainer}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the dropdown from expanding
                  }}
                />
              </ExternalLink>
            </Tooltip>
          </span>
        )}
      </div>
    </Dropdown>
  );
};

interface TreasuryProps {
  className?: string;
}

const Treasury = (props: TreasuryProps) => {
  const { className } = props;
  const { primary, secondary } = useTreasuries();

  return (
    <div className={classNames(styles.treasury, className)}>
      <p className={styles.treasuryTitle}>
        Treasury
        <Tooltip overlay="The DAO treasury is divided between the primary and secondary agent contracts. To move funds from a particular agent, you need to use the respective proposal type (primary proposal to use primary agent funds, and vice versa).">
          <img src={images.helpOutline} alt="treasury help" />
        </Tooltip>
      </p>
      <TreasuryDropdown data={primary} type="primary" />
      <TreasuryDropdown data={secondary} type="secondary" />
    </div>
  );
};

export default Treasury;
