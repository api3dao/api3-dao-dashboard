import Dropdown, { DropdownMenu, DropdownMenuItem } from '../../../components/dropdown/dropdown';
import { FormattedTreasury, useTreasuries } from './hooks';
import globalStyles from '../../../styles/global-styles.module.scss';
import styles from './treasury.module.scss';

interface TreasuryDropdownProps {
  data: FormattedTreasury[];
  type: 'Primary' | 'Secondary';
}

const TreasuryDropdown = (props: TreasuryDropdownProps) => {
  const { data, type } = props;

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
        <p className={`${globalStyles.secondaryColor} ${globalStyles.textSmall} ${globalStyles.medium}`}>{type}</p>
        <p className={`${globalStyles.textXSmall} ${globalStyles.medium} ${globalStyles.underline}`}>{data.length}</p>
      </div>
    </Dropdown>
  );
};

const Treasury = () => {
  const { primary, secondary } = useTreasuries();

  return (
    <div className={styles.treasury}>
      <p
        className={`${globalStyles.secondaryColor} ${globalStyles.textSmall} ${globalStyles.uppercase} ${globalStyles.textRight}`}
      >
        Treasury
      </p>
      <TreasuryDropdown data={primary} type="Primary" />
      <TreasuryDropdown data={secondary} type="Secondary" />
    </div>
  );
};

export default Treasury;
