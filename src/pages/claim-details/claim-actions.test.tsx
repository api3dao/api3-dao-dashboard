import { render, screen } from '@testing-library/react';
import ClaimActions from './claim-actions';
import { Claim } from '../../chain-data';
import { addDays, addMinutes } from 'date-fns';
import { parseApi3, parseUsd } from '../../utils';

let claim: Claim;
const periodTimes = { evidence: 280800, vote: 583200, appeal: 388800 };

describe('<ClaimActions />', () => {
  beforeEach(() => {
    claim = {
      claimId: '42',
      policy: { id: '101', metadata: 'ETH/BTC' },
      claimant: '0x153EF0B488148k0aB0FED112334',
      claimAmountInUsd: parseUsd('1000'),
      settlementAmountInUsd: null,
      timestamp: addDays(new Date(), -2),
      status: 'ClaimCreated',
      statusUpdatedAt: addDays(new Date(), -1),
      evidence: 'evidence-001',
      transactionHash: null,
      deadline: null,
      dispute: null,
    };
  });

  describe('"ClaimCreated" status', () => {
    it('shows that the claim is in progress', () => {
      claim.status = 'ClaimCreated';
      claim.deadline = addMinutes(new Date(), 1);

      render(<ClaimActions claim={claim} payout={null} />);

      expect(screen.getByTestId('status-prefix')).toHaveTextContent('API3 Mediators');
      expect(screen.getByTestId('status')).toHaveTextContent('Evaluating');
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });

    describe('when the claim has been ignored by API3', () => {
      it('shows that the claim has been rejected and enables the Escalate action', () => {
        claim.status = 'ClaimCreated';
        claim.deadline = addMinutes(new Date(), -1);

        render(<ClaimActions claim={claim} payout={null} />);

        expect(screen.getByTestId('status-prefix')).toHaveTextContent('API3 Mediators');
        expect(screen.getByTestId('status')).toHaveTextContent('Rejected');
        const escalateButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
        expect(escalateButton).not.toBeDisabled();
      });

      it('removes the Escalate button when the new deadline has passed', () => {
        claim.status = 'ClaimCreated';
        claim.deadline = addDays(addMinutes(new Date(), -1), -3);

        render(<ClaimActions claim={claim} payout={null} />);

        expect(screen.getByTestId('status-prefix')).toHaveTextContent('API3 Mediators');
        expect(screen.getByTestId('status')).toHaveTextContent('Rejected');
        expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
      });
    });
  });

  describe('"SettlementProposed" status', () => {
    it('enables Accept and Escalate actions', () => {
      claim.status = 'SettlementProposed';
      claim.settlementAmountInUsd = parseUsd('500');
      claim.deadline = addMinutes(new Date(), 1);

      render(<ClaimActions claim={claim} payout={null} />);

      expect(screen.getByTestId('status-prefix')).toHaveTextContent('API3 Mediators');
      expect(screen.getByTestId('status')).toHaveTextContent('Offered Settlement');
      expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^500.0 USD/);
      const acceptButton = screen.getByRole('button', { name: /Accept Settlement/i });
      const escalateButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(acceptButton).not.toBeDisabled();
      expect(escalateButton).not.toBeDisabled();
    });

    it('shows that proposed settlement has timed out', () => {
      claim.status = 'SettlementProposed';
      claim.settlementAmountInUsd = parseUsd('500');
      claim.deadline = addMinutes(new Date(), -1);

      render(<ClaimActions claim={claim} payout={null} />);

      expect(screen.getByTestId('status')).toHaveTextContent('Timed Out');
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });
  });

  describe('"SettlementAccepted" status', () => {
    it('shows the claim has been settled', () => {
      claim.status = 'SettlementAccepted';
      claim.settlementAmountInUsd = parseUsd('500');
      const payout = {
        amountInUsd: parseUsd('500'),
        amountInApi3: parseApi3('250'),
        transactionHash: '0xfc83f22fb8167f9cdfb982dd4aeccc84d70df1494bca8271b3428d74df73807a',
      };

      render(<ClaimActions claim={claim} payout={payout} />);

      expect(screen.getByTestId('status-prefix')).toHaveTextContent('API3 Mediators');
      expect(screen.getByTestId('status')).toHaveTextContent('Settled');
      expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^500.0 USD/);
      expect(screen.getByRole('button', { name: /View payout info/i })).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(1); // There should be no other actions available
    });

    it('informs the user when the payout amount has been clipped', () => {
      claim.status = 'SettlementAccepted';
      claim.settlementAmountInUsd = parseUsd('500');
      const payout = {
        amountInUsd: parseUsd('400'),
        amountInApi3: parseApi3('200'),
        transactionHash: '0xfc83f22fb8167f9cdfb982dd4aeccc84d70df1494bca8271b3428d74df73807a',
      };

      render(<ClaimActions claim={claim} payout={payout} />);

      expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^400.0 USD/);
      expect(screen.getByTestId('notifications')).toHaveTextContent(
        'The full settlement (500.0 USD) exceeded the remaining coverage'
      );
    });
  });

  describe('"DisputeCreated" status', () => {
    beforeEach(() => {
      claim.status = 'DisputeCreated';
    });

    it('shows claimant has escalated to Kleros', () => {
      claim.deadline = addDays(new Date(), 10);
      claim.dispute = {
        id: '1',
        status: 'Waiting',
        ruling: 'DoNotPay',
        period: 'Evidence',
        periodChangedAt: new Date(),
        periodTimes,
        appealedBy: null,
      };

      render(<ClaimActions claim={claim} payout={null} />);

      expect(screen.getByTestId('status-prefix')).toHaveTextContent('Kleros');
      expect(screen.getByTestId('status')).toHaveTextContent('Evaluating');
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });

    describe('with "PayClaim" arbitrator ruling', () => {
      it('shows the claim has been accepted', () => {
        claim.deadline = addDays(new Date(), 2);
        claim.dispute = {
          id: '1',
          status: 'Appealable',
          ruling: 'PayClaim',
          period: 'Appeal',
          periodChangedAt: addDays(new Date(), -2),
          periodTimes,
          appealedBy: null,
        };

        render(<ClaimActions claim={claim} payout={null} />);

        expect(screen.getByTestId('status-prefix')).toHaveTextContent('Kleros');
        expect(screen.getByTestId('status')).toHaveTextContent(/^Accepted$/);
        expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^1,000.0 USD/);
        expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
      });

      it('provides an Execute Payout action when in the "Execution" period', () => {
        claim.dispute = {
          id: '1',
          status: 'Solved',
          ruling: 'PayClaim',
          period: 'Execution',
          periodChangedAt: new Date(),
          periodTimes,
          appealedBy: null,
        };

        render(<ClaimActions claim={claim} payout={null} />);

        const payoutButton = screen.getByRole('button', { name: /Execute Payout/i });
        expect(payoutButton).not.toBeDisabled();
        expect(screen.queryAllByRole('button')).toHaveLength(1); // There should only be the one action
      });
    });

    describe('with "PaySettlement" arbitrator ruling', () => {
      beforeEach(() => {
        claim.settlementAmountInUsd = parseUsd('500');
      });

      it('provides an Appeal action when in the "Appeal" period', () => {
        claim.deadline = addMinutes(new Date(), 1);
        claim.dispute = {
          id: '1',
          status: 'Appealable',
          ruling: 'PaySettlement',
          period: 'Appeal',
          periodChangedAt: addDays(new Date(), -4),
          periodTimes,
          appealedBy: null,
        };

        render(<ClaimActions claim={claim} payout={null} />);

        expect(screen.getByTestId('status-prefix')).toHaveTextContent('Kleros');
        expect(screen.getByTestId('status')).toHaveTextContent('Accepted Settlement');
        expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^500.0 USD/);
        const appealButton = screen.getByRole('button', { name: /Appeal/i });
        expect(appealButton).not.toBeDisabled();
        expect(screen.queryAllByRole('button')).toHaveLength(1); // There should only be the one action
      });

      it('disables the Appeal button when the deadline has passed', () => {
        claim.deadline = addMinutes(new Date(), -1);
        claim.dispute = {
          id: '1',
          status: 'Appealable',
          ruling: 'PaySettlement',
          period: 'Appeal',
          periodChangedAt: addDays(new Date(), -4),
          periodTimes,
          appealedBy: null,
        };

        render(<ClaimActions claim={claim} payout={null} />);

        const appealButton = screen.getByRole('button', { name: /Appeal/i });
        expect(appealButton).toBeDisabled();
      });

      it('provides an Execute Payout action when in the "Execution" period', () => {
        claim.dispute = {
          id: '1',
          status: 'Solved',
          ruling: 'PaySettlement',
          period: 'Execution',
          periodChangedAt: new Date(),
          periodTimes,
          appealedBy: null,
        };

        render(<ClaimActions claim={claim} payout={null} />);

        const payoutButton = screen.getByRole('button', { name: /Execute Payout/i });
        expect(payoutButton).not.toBeDisabled();
        expect(screen.queryAllByRole('button')).toHaveLength(1); // There should only be the one action
      });
    });

    describe('with "DoNotPay" arbitrator ruling', () => {
      it('provides an Appeal action when in the "Appeal" period', () => {
        claim.deadline = addMinutes(new Date(), 1);
        claim.dispute = {
          id: '1',
          status: 'Appealable',
          ruling: 'DoNotPay',
          period: 'Appeal',
          periodChangedAt: addDays(new Date(), -4),
          periodTimes,
          appealedBy: null,
        };

        render(<ClaimActions claim={claim} payout={null} />);

        expect(screen.getByTestId('status-prefix')).toHaveTextContent('Kleros');
        expect(screen.getByTestId('status')).toHaveTextContent('Rejected');
        const appealButton = screen.getByRole('button', { name: /Appeal/i });
        expect(appealButton).not.toBeDisabled();
        expect(screen.queryAllByRole('button')).toHaveLength(1); // There should only be the one action
      });

      it('disables the Appeal button when the deadline has passed', () => {
        claim.deadline = addMinutes(new Date(), -1);
        claim.dispute = {
          id: '1',
          status: 'Appealable',
          ruling: 'DoNotPay',
          period: 'Appeal',
          periodChangedAt: addDays(new Date(), -4),
          periodTimes,
          appealedBy: null,
        };

        render(<ClaimActions claim={claim} payout={null} />);

        const appealButton = screen.getByRole('button', { name: /Appeal/i });
        expect(appealButton).toBeDisabled();
      });

      it('provides no action when in the "Execution" period', () => {
        claim.dispute = {
          id: '1',
          status: 'Solved',
          ruling: 'DoNotPay',
          period: 'Execution',
          periodChangedAt: new Date(),
          periodTimes,
          appealedBy: null,
        };

        render(<ClaimActions claim={claim} payout={null} />);

        expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
      });
    });

    describe('when the ruling has been appealed', () => {
      it('shows that it has been appealed to Kleros', () => {
        claim.deadline = addDays(new Date(), 10);
        claim.dispute = {
          id: '1',
          status: 'Waiting',
          ruling: 'PaySettlement',
          period: 'Evidence',
          periodChangedAt: new Date(),
          periodTimes,
          appealedBy: '0x153EF0B488148k0aB0FED112334',
        };

        render(<ClaimActions claim={claim} payout={null} />);

        expect(screen.getByTestId('status-prefix')).toHaveTextContent('Kleros');
        expect(screen.getByTestId('status')).toHaveTextContent('Evaluating');
        expect(screen.getByTestId('notifications')).toHaveTextContent('You appealed Kleros’s ruling');
        expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
      });

      it('shows that API3 has appealed when it is not the claimant', () => {
        claim.deadline = addDays(new Date(), 2);
        claim.dispute = {
          id: '1',
          status: 'Waiting',
          ruling: 'PayClaim',
          period: 'Vote',
          periodChangedAt: addDays(new Date(), -4),
          periodTimes,
          appealedBy: '0xD6b040736e948621c5b6E0a4944',
        };

        render(<ClaimActions claim={claim} payout={null} />);

        expect(screen.getByTestId('status-prefix')).toHaveTextContent('Kleros');
        expect(screen.getByTestId('status')).toHaveTextContent('Evaluating');
        expect(screen.getByTestId('notifications')).toHaveTextContent('The API3 Mediators appealed Kleros’s ruling');
        expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
      });
    });
  });

  describe('"DisputeResolvedWithoutPayout" status', () => {
    it('shows the claim has been rejected by Kleros', () => {
      claim.status = 'DisputeResolvedWithoutPayout';
      claim.deadline = addMinutes(new Date(), 1);

      render(<ClaimActions claim={claim} payout={null} />);

      expect(screen.getByTestId('status-prefix')).toHaveTextContent('Kleros');
      expect(screen.getByTestId('status')).toHaveTextContent('Rejected');
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });
  });

  describe('"ClaimAccepted" status', () => {
    it('shows the claim has been accepted', () => {
      claim.status = 'ClaimAccepted';
      const payout = {
        amountInUsd: claim.claimAmountInUsd,
        amountInApi3: parseApi3('500'),
        transactionHash: '0xfc83f22fb8167f9cdfb982dd4aeccc84d70df1494bca8271b3428d74df73807a',
      };

      render(<ClaimActions claim={claim} payout={payout} />);

      expect(screen.getByTestId('status-prefix')).toHaveTextContent('API3 Mediators');
      expect(screen.getByTestId('status')).toHaveTextContent(/^Accepted$/);
      expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^1,000.0 USD/);
      expect(screen.getByRole('button', { name: /View payout info/i })).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(1); // There should be no other actions available
    });

    it('informs the user when the payout amount has been clipped', () => {
      claim.status = 'ClaimAccepted';
      const payout = {
        amountInUsd: parseUsd('800'),
        amountInApi3: parseApi3('400'),
        transactionHash: '0xfc83f22fb8167f9cdfb982dd4aeccc84d70df1494bca8271b3428d74df73807a',
      };

      render(<ClaimActions claim={claim} payout={payout} />);

      expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^800.0 USD/);
      expect(screen.getByTestId('notifications')).toHaveTextContent(
        'The full payout (1,000.0 USD) exceeded the remaining coverage'
      );
    });
  });

  describe('"DisputeResolvedWithClaimPayout" status', () => {
    it('shows the claim has been accepted', () => {
      claim.status = 'DisputeResolvedWithClaimPayout';
      const payout = {
        amountInUsd: claim.claimAmountInUsd,
        amountInApi3: parseApi3('500'),
        transactionHash: '0xfc83f22fb8167f9cdfb982dd4aeccc84d70df1494bca8271b3428d74df73807a',
      };

      render(<ClaimActions claim={claim} payout={payout} />);

      expect(screen.getByTestId('status-prefix')).toHaveTextContent('Kleros');
      expect(screen.getByTestId('status')).toHaveTextContent(/^Accepted$/);
      expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^1,000.0 USD/);
      expect(screen.getByRole('button', { name: /View payout info/i })).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(1); // There should be no other actions available
    });

    it('informs the user when the payout amount has been clipped', () => {
      claim.status = 'DisputeResolvedWithClaimPayout';
      const payout = {
        amountInUsd: parseUsd('800'),
        amountInApi3: parseApi3('400'),
        transactionHash: '0xfc83f22fb8167f9cdfb982dd4aeccc84d70df1494bca8271b3428d74df73807a',
      };

      render(<ClaimActions claim={claim} payout={payout} />);

      expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^800.0 USD/);
      expect(screen.getByTestId('notifications')).toHaveTextContent(
        'The full payout (1,000.0 USD) exceeded the remaining coverage'
      );
    });
  });

  describe('"DisputeResolvedWithSettlementPayout" status', () => {
    it('shows the claim has been settled', () => {
      claim.status = 'DisputeResolvedWithSettlementPayout';
      claim.settlementAmountInUsd = parseUsd('500');
      const payout = {
        amountInUsd: parseUsd('500'),
        amountInApi3: parseApi3('250'),
        transactionHash: '0xfc83f22fb8167f9cdfb982dd4aeccc84d70df1494bca8271b3428d74df73807a',
      };

      render(<ClaimActions claim={claim} payout={payout} />);

      expect(screen.getByTestId('status-prefix')).toHaveTextContent('Kleros');
      expect(screen.getByTestId('status')).toHaveTextContent('Settled');
      expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^500.0 USD/);
      expect(screen.getByRole('button', { name: /View payout info/i })).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(1); // There should be no other actions available
    });

    it('informs the user when the payout amount has been clipped', () => {
      claim.status = 'DisputeResolvedWithSettlementPayout';
      claim.settlementAmountInUsd = parseUsd('500');
      const payout = {
        amountInUsd: parseUsd('400'),
        amountInApi3: parseApi3('200'),
        transactionHash: '0xfc83f22fb8167f9cdfb982dd4aeccc84d70df1494bca8271b3428d74df73807a',
      };

      render(<ClaimActions claim={claim} payout={payout} />);

      expect(screen.getByTestId('usd-amount')).toHaveTextContent(/^400.0 USD/);
      expect(screen.getByTestId('notifications')).toHaveTextContent(
        'The full settlement (500.0 USD) exceeded the remaining coverage'
      );
    });
  });
});
