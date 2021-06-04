import { MouseEvent, KeyboardEvent } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import classNames from 'classnames';
import globalStyles from '../../styles/global-styles.module.scss';
import styles from './slider.module.scss';

const sliderData = [
  'Tips explaining staking size of box small as possible while fitting all info',
  'Tips explaining staking size of box small as possible while fitting all info',
  'Tips explaining staking size of box small as possible while fitting all info',
];

const dot = (onClick: (e: MouseEvent | KeyboardEvent) => void, isSelected: boolean) => (
  <span className={classNames(styles.sliderDot, { [styles.active]: isSelected })} onClick={() => onClick} />
);

const arrow = (direction: 'prev' | 'next', onClick: () => void) => (
  <img
    className={classNames(styles.arrow, { [styles.left]: direction === 'prev', [styles.right]: direction === 'next' })}
    src={`/triangle-bracket-${direction === 'prev' ? 'left' : 'right'}.svg`}
    onClick={onClick}
    alt="arrow"
  />
);

const Slider = () => {
  return (
    <div className={styles.sliderWrapper}>
      <Carousel
        autoPlay
        infiniteLoop
        interval={5000}
        showStatus={false}
        showThumbs={false}
        renderArrowPrev={(onClick) => arrow('prev', onClick)}
        renderArrowNext={(onClick) => arrow('next', onClick)}
        renderIndicator={dot}
        children={sliderData.map((slideItem, index) => (
          <div key={index}>
            <div className={styles.sliderContent}>
              <div className={styles.sliderNumberWrap}>
                <img src="/triangles.svg" alt="triangles" />
                <h2 className={styles.sliderNumber}>{index + 1}</h2>
              </div>
              <p className={globalStyles.textLarge}>{slideItem}</p>
            </div>
          </div>
        ))}
      />
    </div>
  );
};

export default Slider;
