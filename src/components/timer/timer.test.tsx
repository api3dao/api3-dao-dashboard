import { render, screen } from '@testing-library/react';
import { addSeconds } from 'date-fns';
import Timer from './timer';

describe('<Timer />', () => {
  it('shows that it has ended when in the past', () => {
    const deadline = addSeconds(new Date(), -1);

    render(<Timer deadline={deadline} />);

    expect(screen.getByTestId('timer')).toHaveTextContent('Ended');
    expect(screen.getByTestId('timer')).toHaveTextContent('00D:00HR:00MIN');
  });

  it('indicates the number of minutes remaining', () => {
    const deadline = addSeconds(new Date(), 65); // Add the 5 seconds as a buffer

    render(<Timer deadline={deadline} />);

    expect(screen.getByTestId('timer')).toHaveTextContent('Remaining');
    expect(screen.getByTestId('timer')).toHaveTextContent('00D:00HR:01MIN');
  });

  it('indicates the number of hours remaining', () => {
    const deadline = addSeconds(new Date(), ONE_HOUR + 5);

    render(<Timer deadline={deadline} />);

    expect(screen.getByTestId('timer')).toHaveTextContent('Remaining');
    expect(screen.getByTestId('timer')).toHaveTextContent('00D:01HR:00MIN');
  });

  it('indicates the number of days remaining', () => {
    const deadline = addSeconds(new Date(), 24 * ONE_HOUR + 5);

    render(<Timer deadline={deadline} />);

    expect(screen.getByTestId('timer')).toHaveTextContent('Remaining');
    expect(screen.getByTestId('timer')).toHaveTextContent('01D:00HR:00MIN');
  });
});

const ONE_HOUR = 3600;
