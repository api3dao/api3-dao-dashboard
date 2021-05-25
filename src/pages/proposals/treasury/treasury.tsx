import Dropdown, { DropdownMenu, DropdownMenuItem } from '../../../components/dropdown/dropdown';
import './treasury.scss';

const data = [
  {
    item1: 'API3',
    item2: '27,511,157 API3',
  },
  {
    item1: 'USD COIN',
    item2: '23,169,880.733974 USDC',
  },
  {
    item1: 'Pinakion',
    item2: '27,511,157 PNK',
  },
  {
    item1: 'PRIA',
    item2: '0.98978359 PRIA',
  },
  {
    item1: 'Santa Token',
    item2: '55 SANTA',
  },
];

const Treasury = () => {
  return (
    <div className="treasury">
      <p className="secondary-color text-small uppercase text-right">Treasury</p>
      <Dropdown
        menu={
          <DropdownMenu>
            {data.map((item, index) => (
              <DropdownMenuItem className="treasury-menu-item" key={index}>
                <p className="text-small medium">{item.item1}</p>
                <p className="secondary-color text-small medium">{item.item2}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        }
      >
        <div className="treasury-button">
          <p className="secondary-color text-small medium">Primary</p>
          <p className="text-xsmall medium underline">5</p>
        </div>
      </Dropdown>
      <Dropdown
        menu={
          <DropdownMenu>
            {data.map((item, index) => (
              <DropdownMenuItem className="treasury-menu-item" key={index}>
                <p className="text-small medium">{item.item1}</p>
                <p className="secondary-color text-small medium">{item.item2}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        }
      >
        <div className="treasury-button">
          <p className="secondary-color text-small medium">Secondary</p>
          <p className="text-xsmall medium underline">2</p>
        </div>
      </Dropdown>
    </div>
  );
};

export default Treasury;
