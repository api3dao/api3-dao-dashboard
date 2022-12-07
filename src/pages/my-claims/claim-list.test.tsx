import { render as baseRender, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReactElement } from 'react';
import ClaimList from './claim-list';
import { Claim } from '../../chain-data';
import { addDays, addMinutes } from 'date-fns';
import { parseUsd } from '../../utils';

function render(element: ReactElement) {
  baseRender(<MemoryRouter>{element}</MemoryRouter>);
}

let claim: Claim;
const periodTimes = { evidence: 280800, vote: 583200, appeal: 388800 };

describe('<ClaimList />', () => {
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

      render(<ClaimList claims={[claim]} />);

      expect(screen.getByTestId('claim-status')).toHaveTextContent('API3 Mediators (evaluating)');
      const container = screen.getByTestId('claim-action-info');
      expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
    });

    describe('when the claim has been ignored by API3', () => {
      it('shows that the claim has been rejected with an Escalate action', () => {
        claim.status = 'ClaimCreated';
        claim.deadline = addMinutes(new Date(), -1);

        render(<ClaimList claims={[claim]} />);

        expect(screen.getByTestId('claim-status')).toHaveTextContent('API3 Mediators (rejected)');
        const container = screen.getByTestId('claim-action-info');
        const actions = within(container).queryAllByTestId('action');
        expect(actions).toHaveLength(1);
        expect(actions[0]).toHaveTextContent('Escalate to Kleros');
      });

      it('removes the Escalate action when the new deadline has passed', () => {
        claim.status = 'ClaimCreated';
        claim.deadline = addDays(addMinutes(new Date(), -1), -3);

        render(<ClaimList claims={[claim]} />);

        expect(screen.getByTestId('claim-status')).toHaveTextContent('API3 Mediators (rejected)');
        const container = screen.getByTestId('claim-action-info');
        expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
      });
    });
  });

  describe('"SettlementProposed" status', () => {
    it('shows the Accept and Escalate actions', () => {
      claim.status = 'SettlementProposed';
      claim.settlementAmountInUsd = parseUsd('500');
      claim.deadline = addMinutes(new Date(), 1);

      render(<ClaimList claims={[claim]} />);

      expect(screen.getByTestId('claim-status')).toHaveTextContent('API3 Mediators (settlement)');
      const container = screen.getByTestId('claim-action-info');
      const actions = within(container).queryAllByTestId('action');
      expect(actions).toHaveLength(2);
      expect(actions[0]).toHaveTextContent('Escalate to Kleros');
      expect(actions[1]).toHaveTextContent('Accept Settlement');
    });

    it('shows that proposed settlement has timed out', () => {
      claim.status = 'SettlementProposed';
      claim.settlementAmountInUsd = parseUsd('500');
      claim.deadline = addMinutes(new Date(), -1);

      render(<ClaimList claims={[claim]} />);

      expect(screen.getByTestId('claim-status')).toHaveTextContent('Timed Out');
      const container = screen.getByTestId('claim-action-info');
      expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
    });
  });

  describe('"SettlementAccepted" status', () => {
    it('shows the claim has been settled', () => {
      claim.status = 'SettlementAccepted';
      claim.settlementAmountInUsd = parseUsd('500');

      render(<ClaimList claims={[claim]} />);

      expect(screen.getByTestId('claim-status')).toHaveTextContent('API3 Mediators (settled)');
      const container = screen.getByTestId('claim-action-info');
      expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
    });
  });

  describe('"DisputeCreated" status', () => {
    beforeEach(() => {
      claim.status = 'DisputeCreated';
    });

    it('shows that Kleros is evaluating', () => {
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

      render(<ClaimList claims={[claim]} />);

      expect(screen.getByTestId('claim-status')).toHaveTextContent('Kleros (evaluating)');
      const container = screen.getByTestId('claim-action-info');
      expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
    });

    describe('with "PayClaim" arbitrator ruling', () => {
      it('shows the claim has been approved', () => {
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

        render(<ClaimList claims={[claim]} />);

        expect(screen.getByTestId('claim-status')).toHaveTextContent('Kleros (accepted - appeal period)');
        const container = screen.getByTestId('claim-action-info');
        expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
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

        render(<ClaimList claims={[claim]} />);

        expect(screen.getByTestId('claim-status')).toHaveTextContent('Kleros (accepted)');
        const container = screen.getByTestId('claim-action-info');
        const actions = within(container).queryAllByTestId('action');
        expect(actions).toHaveLength(1);
        expect(actions[0]).toHaveTextContent('Execute Payout');
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

        render(<ClaimList claims={[claim]} />);

        expect(screen.getByTestId('claim-status')).toHaveTextContent('Kleros (settlement - appeal period)');
        const container = screen.getByTestId('claim-action-info');
        const actions = within(container).queryAllByTestId('action');
        expect(actions).toHaveLength(1);
        expect(actions[0]).toHaveTextContent('Appeal');
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

        render(<ClaimList claims={[claim]} />);

        expect(screen.getByTestId('claim-status')).toHaveTextContent('Kleros (settlement)');
        const container = screen.getByTestId('claim-action-info');
        const actions = within(container).queryAllByTestId('action');
        expect(actions).toHaveLength(1);
        expect(actions[0]).toHaveTextContent('Execute Payout');
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

        render(<ClaimList claims={[claim]} />);

        expect(screen.getByTestId('claim-status')).toHaveTextContent('Kleros (rejected - appeal period)');
        const container = screen.getByTestId('claim-action-info');
        const actions = within(container).queryAllByTestId('action');
        expect(actions).toHaveLength(1);
        expect(actions[0]).toHaveTextContent('Appeal');
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

        render(<ClaimList claims={[claim]} />);

        expect(screen.getByTestId('claim-status')).toHaveTextContent('Kleros (rejected)');
        const container = screen.getByTestId('claim-action-info');
        expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
      });
    });
  });

  describe('"DisputeResolvedWithoutPayout" status', () => {
    it('shows the claim has been rejected by Kleros', () => {
      claim.status = 'DisputeResolvedWithoutPayout';
      claim.deadline = addMinutes(new Date(), 1);

      render(<ClaimList claims={[claim]} />);

      expect(screen.getByTestId('claim-status')).toHaveTextContent('Kleros (rejected)');
      const container = screen.getByTestId('claim-action-info');
      expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
    });
  });

  describe('"ClaimAccepted" status', () => {
    it('shows the claim has been accepted', () => {
      claim.status = 'ClaimAccepted';

      render(<ClaimList claims={[claim]} />);

      expect(screen.getByTestId('claim-status')).toHaveTextContent('API3 Mediators (accepted)');
      const container = screen.getByTestId('claim-action-info');
      expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
    });
  });

  describe('"DisputeResolvedWithClaimPayout" status', () => {
    it('shows the claim has been accepted', () => {
      claim.status = 'DisputeResolvedWithClaimPayout';

      render(<ClaimList claims={[claim]} />);

      expect(screen.getByTestId('claim-status')).toHaveTextContent('Kleros (accepted)');
      const container = screen.getByTestId('claim-action-info');
      expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
    });
  });

  describe('"DisputeResolvedWithSettlementPayout" status', () => {
    it('shows the claim has been settled', () => {
      claim.status = 'DisputeResolvedWithSettlementPayout';
      claim.settlementAmountInUsd = parseUsd('500');

      render(<ClaimList claims={[claim]} />);

      expect(screen.getByTestId('claim-status')).toHaveTextContent('Kleros (settled)');
      const container = screen.getByTestId('claim-action-info');
      expect(within(container).queryAllByTestId('action')).toHaveLength(0); // There should be no actions available;
    });
  });
});
