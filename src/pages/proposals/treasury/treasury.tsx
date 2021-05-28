import Dropdown, { DropdownMenu, DropdownMenuItem } from '../../../components/dropdown/dropdown';
import { FormattedTreasury, useTreasuries } from './hooks';
import './treasury.scss';

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
            <DropdownMenuItem className="treasury-menu-item" key={`${type}${name}`}>
              <p className="text-small medium">{name}</p>
              <p className="secondary-color text-small medium">{amountAndSymbol}</p>
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      }
    >
      <div className="treasury-button">
        <p className="secondary-color text-small medium">{type}</p>
        <p className="text-xsmall medium underline">{data.length}</p>
      </div>
    </Dropdown>
  );
};

const Treasury = () => {
  const { primary, secondary } = useTreasuries();

  return (
    <div className="treasury">
      <p className="secondary-color text-small uppercase text-right">Treasury</p>
      <TreasuryDropdown data={primary} type="Primary" />
      <TreasuryDropdown data={secondary} type="Secondary" />
    </div>
  );
};

export default Treasury;
