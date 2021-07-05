import classNames from 'classnames';
import Dropdown, { DropdownMenu, DropdownMenuItem } from '../../../components/dropdown/dropdown';
import { FormattedTreasury, useTreasuries } from './hooks';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './treasury.module.scss';
import { images } from '../../../utils';
import { getEtherscanAddressUrl, useApi3AgentAddresses } from '../../../contracts';
import { TreasuryType, useChainData } from '../../../chain-data';
import Tooltip from '../../../components/tooltip/tooltip';

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

  return (
    <Dropdown
      menu={
        <DropdownMenu>
          {data.map(({ name, amountAndSymbol }) => (
            <DropdownMenuItem className={styles.treasuryMenuItem} key={`${type}${name}`}>
              <p className={`${globalStyles.textSmall} ${globalStyles.medium}`}>{name}</p>
              <p className={`${globalStyles.secondaryColor} ${globalStyles.textSmall} ${globalStyles.medium}`}>
                {amountAndSymbol}
              </p>
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      }
    >
      <div className={styles.treasuryButton}>
        <p
          className={`${globalStyles.secondaryColor} ${globalStyles.textSmall} ${globalStyles.medium} ${styles.label}`}
        >
          {type}
        </p>
        {agentAddress && (
          <span className={classNames(styles.copy, globalStyles.textSmall)}>
            <Tooltip overlay={etherscanExplainer}>
              <a href={getEtherscanAddressUrl(chainId, agentAddress)} target="_blank" rel="noopener noreferrer">
                <img
                  src={images.externalLink}
                  alt={etherscanExplainer}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the dropdown from expanding
                  }}
                />
              </a>
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
      <p
        className={`${styles.label} ${globalStyles.secondaryColor} ${globalStyles.textSmall} ${globalStyles.uppercase} ${globalStyles.textRight}`}
      >
        Treasury
        <Tooltip overlay="The DAO treasury is divided between the primary and secondary agent contracts. To move funds from a particular agent, you need to use the respective proposal type (primary proposal to use primary agent funds, and vice versa).">
          <img src={images.help} alt="treasury help" className={globalStyles.helpIcon} />
        </Tooltip>
      </p>
      <TreasuryDropdown data={primary} type="primary" />
      <TreasuryDropdown data={secondary} type="secondary" />
    </div>
  );
};

export default Treasury;
