import React, { MouseEvent, KeyboardEvent } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import classNames from 'classnames';
import './slider.scss';

const sliderData = [
  'Tips explaining staking size of box small as possible while fitting all info',
  'Tips explaining staking size of box small as possible while fitting all info',
  'Tips explaining staking size of box small as possible while fitting all info',
];

const dot = (onClick: (e: MouseEvent | KeyboardEvent) => void, isSelected: boolean) => (
  <span className={classNames('slider-dot', { [`_active`]: isSelected })} onClick={() => onClick} />
);

const arrow = (direction: 'prev' | 'next', onClick: () => void) => (
  <img
    className={classNames('arrow', { [`_left`]: direction === 'prev', [`_right`]: direction === 'next' })}
    src={`/triangle-bracket-${direction === 'prev' ? 'left' : 'right'}.svg`}
    onClick={onClick}
    alt="arrow"
  />
);

const Slider = () => {
  return (
    <div className="slider-wrapper">
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
            <div className="slider-content">
              <div className="slider-number-wrap">
                <img src="/triangles.svg" alt="triangles" />
                <h2 className="slider-number">{index + 1}</h2>
              </div>
              <p className="text-large">{slideItem}</p>
            </div>
          </div>
        ))}
      />
    </div>
  );
};

export default Slider;
