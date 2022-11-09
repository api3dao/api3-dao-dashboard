import { ComponentPropsWithoutRef } from 'react';
import NumberFormat from 'react-number-format';
import styles from './usd-input.module.scss';

interface Props extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export default function UsdInput(props: Props) {
  return (
    <div className={styles.container}>
      <NumberFormat
        className={styles.input}
        allowNegative={false}
        decimalScale={2}
        fixedDecimalScale
        placeholder="0 USD"
        suffix=" USD"
        {...props}
        onValueChange={(update) => props.onValueChange?.(update.value)}
      />
    </div>
  );
}
