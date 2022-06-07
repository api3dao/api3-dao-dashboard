import { render, screen } from '@testing-library/react';
import ClaimActions from './claim-actions';
import { Claim } from '../../chain-data';
import { BigNumber } from 'ethers';
import { addDays, addMinutes } from 'date-fns';

let claim: Claim;

describe('<ClaimActions />', () => {
  beforeEach(() => {
    claim = {
      claimId: '42',
      policyId: '101',
      claimant: '0x153EF0B488148k0aB0FED112334',
      beneficiary: '0x153EF0B488148k0aB0FED112334',
      claimAmount: BigNumber.from('70000000000000000000'),
      counterOfferAmount: null,
      timestamp: addDays(new Date(), -2),
      status: 'ClaimCreated',
      statusUpdatedAt: addDays(new Date(), -1),
      evidence: 'evidence-001',
      transactionHash: null,
      deadline: null,
      arbitratorDisputeId: null,
    };
  });

  describe('"ClaimCreated" status', () => {
    it('shows that the claim is in progress', () => {
      claim.status = 'ClaimCreated';

      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    describe('when the claim has been ignored by API3', () => {
      it('shows that the claim has been rejected and enables the Escalate action', () => {
        claim.status = 'ClaimCreated';
        claim.deadline = addMinutes(new Date(), -1);

        render(<ClaimActions claim={claim} />);

        expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
        expect(screen.getByText(/Rejected/i)).toBeInTheDocument();
        const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
        expect(appealButton).not.toBeDisabled();
      });

      it('disables the Escalate button when the new deadline has passed', () => {
        claim.status = 'ClaimCreated';
        claim.deadline = addDays(addMinutes(new Date(), -1), -3);

        render(<ClaimActions claim={claim} />);

        const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
        expect(appealButton).toBeDisabled();
      });
    });
  });

  describe('"SettlementProposed" status', () => {
    it('enables Accept and Escalate actions', () => {
      claim.status = 'SettlementProposed';
      claim.counterOfferAmount = BigNumber.from('60000000000000000000');
      claim.deadline = addMinutes(new Date(), 1);

      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
      expect(screen.getByText(/Countered with 60.0 API3/i)).toBeInTheDocument();
      const acceptButton = screen.getByRole('button', { name: /Accept Counter/i });
      const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(acceptButton).not.toBeDisabled();
      expect(appealButton).not.toBeDisabled();
    });

    it('disables the buttons when the deadline has passed', () => {
      claim.status = 'SettlementProposed';
      claim.counterOfferAmount = BigNumber.from('60000000000000000000');
      claim.deadline = addMinutes(new Date(), -1);

      render(<ClaimActions claim={claim} />);

      const acceptButton = screen.getByRole('button', { name: /Accept Counter/i });
      const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(acceptButton).toBeDisabled();
      expect(appealButton).toBeDisabled();
    });
  });

  describe('"SettlementAccepted" status', () => {
    it('shows claimant has accepted the counter', () => {
      claim.status = 'SettlementAccepted';
      claim.counterOfferAmount = BigNumber.from('60000000000000000000');

      render(<ClaimActions claim={claim} />);

      expect(screen.getByText('0x153EF0B...2334')).toBeInTheDocument();
      expect(screen.getByText(/Accepted counter of 60.0 API3/i)).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });
  });

  describe('"DisputeCreated" status', () => {
    it('shows claimant has appealed to Kleros', () => {
      claim.status = 'DisputeCreated';

      render(<ClaimActions claim={claim} />);

      expect(screen.getByText('0x153EF0B...2334')).toBeInTheDocument();
      expect(screen.getByText(/Appealed to Kleros/i)).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });

    it('shows counter offer amount when present', () => {
      claim.status = 'DisputeCreated';
      claim.counterOfferAmount = BigNumber.from('60000000000000000000');

      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/Appealed counter of 60.0 API3 to Kleros/i)).toBeInTheDocument();
    });

    describe('when the claim has been ignored by Kleros', () => {
      it('shows that the claim has been rejected', () => {
        claim.status = 'DisputeCreated';
        claim.deadline = addMinutes(new Date(), -1);

        render(<ClaimActions claim={claim} />);

        expect(screen.getByText(/Kleros/i)).toBeInTheDocument();
        expect(screen.getByText(/Rejected/i)).toBeInTheDocument();
        expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
      });
    });
  });

  describe('"DisputeResolvedWithoutPayout" status', () => {
    it('enables the Appeal action', () => {
      claim.status = 'DisputeResolvedWithoutPayout';
      claim.deadline = addMinutes(new Date(), 1);

      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/Kleros/i)).toBeInTheDocument();
      expect(screen.getByText(/Rejected/i)).toBeInTheDocument();
      const appealButton = screen.getByRole('button', { name: /Appeal/i });
      expect(appealButton).not.toBeDisabled();
    });

    it('disables the Appeal button when the deadline has passed', () => {
      claim.status = 'DisputeResolvedWithoutPayout';
      claim.deadline = addMinutes(new Date(), -1);

      render(<ClaimActions claim={claim} />);

      const appealButton = screen.getByRole('button', { name: /Appeal/i });
      expect(appealButton).toBeDisabled();
    });
  });

  describe('"ClaimAccepted" status', () => {
    it('shows the claim has been approved', () => {
      claim.status = 'ClaimAccepted';

      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
      expect(screen.getByText(/Approved/i)).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });
  });

  describe('"DisputeResolvedWithClaimPayout" status', () => {
    it('shows the claim has been approved', () => {
      claim.status = 'DisputeResolvedWithClaimPayout';

      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/Kleros/i)).toBeInTheDocument();
      expect(screen.getByTestId('status-message')).toHaveTextContent(/Approved full amount/i);
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });
  });

  describe('"DisputeResolvedWithSettlementPayout" status', () => {
    it('provides an Appeal action', () => {
      claim.status = 'DisputeResolvedWithSettlementPayout';
      claim.counterOfferAmount = BigNumber.from('65000000000000000000');
      claim.deadline = addMinutes(new Date(), 1);

      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/Kleros/i)).toBeInTheDocument();
      expect(screen.getByTestId('status-message')).toHaveTextContent(/Approved counter of 65.0 API3/i);
      const appealButton = screen.getByRole('button', { name: /Appeal/i });
      expect(appealButton).not.toBeDisabled();
    });

    it('disables the Appeal button when the deadline has passed', () => {
      claim.status = 'DisputeResolvedWithSettlementPayout';
      claim.counterOfferAmount = BigNumber.from('65000000000000000000');
      claim.deadline = addMinutes(new Date(), -1);

      render(<ClaimActions claim={claim} />);

      const appealButton = screen.getByRole('button', { name: /Appeal/i });
      expect(appealButton).toBeDisabled();
    });
  });
});
