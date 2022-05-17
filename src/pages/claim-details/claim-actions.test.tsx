import { render, screen } from '@testing-library/react';
import ClaimActions from './claim-actions';
import { Claim } from '../../chain-data';
import { BigNumber } from 'ethers';
import { addDays } from 'date-fns';

let claim: Claim;

describe('<ClaimActions />', () => {
  beforeEach(() => {
    claim = {
      claimId: '42',
      policyId: '101',
      claimant: '0x-some-account',
      beneficiary: '0x-some-account',
      claimedAmount: BigNumber.from(700000000),
      counterOfferAmount: null,
      resolvedAmount: null,
      timestamp: addDays(new Date(), -2),
      open: true,
      status: 'Submitted',
      statusUpdatedAt: new Date(),
      evidence: 'evidence-001',
      transactionHash: null,
      deadline: null,
    };
  });

  describe('"Submitted" status', () => {
    it('shows that the claim is in progress', () => {
      claim.status = 'Submitted';
      render(<ClaimActions currentAccount="0x-some-account" claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig Processing/i)).toBeInTheDocument();
      expect(screen.getByText(/In progress/i)).toBeInTheDocument();
    });
  });

  describe('"MediationOffered" status', () => {
    it('enables Accept and Appeal actions', () => {
      claim.status = 'MediationOffered';
      claim.counterOfferAmount = BigNumber.from(600000000000000);
      render(<ClaimActions currentAccount="0x-some-account" claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
      expect(screen.getByText(/Countered with 0.0006 API3/i)).toBeInTheDocument();
      const acceptButton = screen.getByRole('button', { name: /Accept Counter/i });
      const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(acceptButton).not.toBeDisabled();
      expect(appealButton).not.toBeDisabled();
    });

    it('disables the buttons when viewing a claim that is not your own', () => {
      claim.status = 'MediationOffered';
      claim.counterOfferAmount = BigNumber.from(600000000000000);
      claim.claimant = '0x-some-other-account';
      render(<ClaimActions currentAccount="0x-some-account" claim={claim} />);

      const acceptButton = screen.getByRole('button', { name: /Accept Counter/i });
      const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(acceptButton).toBeDisabled();
      expect(appealButton).toBeDisabled();
    });
  });

  describe('"Accepted" status', () => {
    it('shows claimant has accepted the counter', () => {
      claim.status = 'Accepted';
      claim.counterOfferAmount = BigNumber.from(600000000000000);
      render(<ClaimActions currentAccount="0x-some-other-account" claim={claim} />);

      expect(screen.getByText(/0x-some-account/i)).toBeInTheDocument();
      expect(screen.getByText(/Accepted counter of 0.0006 API3/i)).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });
  });

  describe('"Appealed" status', () => {
    it('shows claimant has appealed to Kleros', () => {
      claim.status = 'Appealed';
      claim.counterOfferAmount = BigNumber.from(600000000000000);
      render(<ClaimActions currentAccount="0x-some-other-account" claim={claim} />);

      expect(screen.getByText(/0x-some-account/i)).toBeInTheDocument();
      expect(screen.getByText(/Appealed to Kleros/i)).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });
  });

  describe('"Rejected" status', () => {
    it('enables the Appeal action', () => {
      claim.status = 'Rejected';
      render(<ClaimActions currentAccount="0x-some-account" claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
      expect(screen.getByText(/Rejected/i)).toBeInTheDocument();
      const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(appealButton).not.toBeDisabled();
    });

    it('disables the Appeal button when viewing a claim that is not your own', () => {
      claim.status = 'Rejected';
      claim.claimant = '0x-some-other-account';
      render(<ClaimActions currentAccount="0x-some-account" claim={claim} />);

      const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(appealButton).toBeDisabled();
    });
  });

  describe('"Resolved" status', () => {
    it('shows the claim has been approved', () => {
      claim.status = 'Resolved';
      claim.resolvedAmount = BigNumber.from(600000000000000);
      render(<ClaimActions currentAccount="0x-some-account" claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
      expect(screen.getByText(/Approved/i)).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });

    it('provides an Appeal action when Kleros is involved', () => {
      claim.status = 'Resolved';
      claim.counterOfferAmount = BigNumber.from(600000000000000);
      claim.resolvedAmount = BigNumber.from(600000000000000);
      render(<ClaimActions currentAccount="0x-some-account" claim={claim} />);

      expect(screen.getByText(/Kleros/i)).toBeInTheDocument();
      expect(screen.getByText(/Approved/i)).toBeInTheDocument();
      const appealButton = screen.getByRole('button', { name: /Appeal/i });
      expect(appealButton).not.toBeDisabled();
    });

    it('disables the Appeal button when viewing a claim that is not your own', () => {
      claim.status = 'Resolved';
      claim.claimant = '0x-some-other-account';
      claim.counterOfferAmount = BigNumber.from(600000000000000);
      claim.resolvedAmount = BigNumber.from(600000000000000);
      render(<ClaimActions currentAccount="0x-some-account" claim={claim} />);

      const appealButton = screen.getByRole('button', { name: /Appeal/i });
      expect(appealButton).toBeDisabled();
    });
  });
});
