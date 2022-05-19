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
      claimant: '0x153EF0B488148k0aB0FED112334',
      beneficiary: '0x153EF0B488148k0aB0FED112334',
      claimedAmount: BigNumber.from('70000000000000000000'),
      counterOfferAmount: null,
      resolvedAmount: null,
      timestamp: addDays(new Date(), -2),
      open: true,
      status: 'Submitted',
      statusUpdatedAt: new Date(),
      statusUpdatedBy: 'claimant',
      evidence: 'evidence-001',
      transactionHash: null,
      deadline: null,
    };
  });

  describe('"Submitted" status', () => {
    it('shows that the claim is in progress', () => {
      claim.status = 'Submitted';
      claim.statusUpdatedBy = 'claimant';
      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    });
  });

  describe('"MediationOffered" status', () => {
    it('enables Accept and Escalate actions', () => {
      claim.status = 'MediationOffered';
      claim.statusUpdatedBy = 'mediator';
      claim.counterOfferAmount = BigNumber.from('60000000000000000000');
      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
      expect(screen.getByText(/Countered with 60.0 API3/i)).toBeInTheDocument();
      const acceptButton = screen.getByRole('button', { name: /Accept Counter/i });
      const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(acceptButton).not.toBeDisabled();
      expect(appealButton).not.toBeDisabled();
    });

    it('disables the buttons when the claim is inactive', () => {
      claim.status = 'MediationOffered';
      claim.statusUpdatedBy = 'mediator';
      claim.counterOfferAmount = BigNumber.from('60000000000000000000');
      claim.open = false;
      render(<ClaimActions claim={claim} />);

      const acceptButton = screen.getByRole('button', { name: /Accept Counter/i });
      const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(acceptButton).toBeDisabled();
      expect(appealButton).toBeDisabled();
    });
  });

  describe('"Accepted" status', () => {
    it('shows claimant has accepted the counter', () => {
      claim.status = 'Accepted';
      claim.statusUpdatedBy = 'claimant';
      claim.counterOfferAmount = BigNumber.from('60000000000000000000');
      render(<ClaimActions claim={claim} />);

      expect(screen.getByText('0x153EF0B...2334')).toBeInTheDocument();
      expect(screen.getByText(/Accepted counter of 60.0 API3/i)).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });
  });

  describe('"Appealed" status', () => {
    it('shows claimant has appealed to Kleros', () => {
      claim.status = 'Appealed';
      claim.statusUpdatedBy = 'claimant';
      render(<ClaimActions claim={claim} />);

      expect(screen.getByText('0x153EF0B...2334')).toBeInTheDocument();
      expect(screen.getByText(/Appealed to Kleros/i)).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });

    it('shows counter offer amount when present', () => {
      claim.status = 'Appealed';
      claim.statusUpdatedBy = 'claimant';
      claim.counterOfferAmount = BigNumber.from('60000000000000000000');
      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/Appealed counter of 60.0 API3 to Kleros/i)).toBeInTheDocument();
    });
  });

  describe('"Rejected" status', () => {
    it('enables the Escalate action', () => {
      claim.status = 'Rejected';
      claim.statusUpdatedBy = 'mediator';
      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
      expect(screen.getByText(/Rejected/i)).toBeInTheDocument();
      const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(appealButton).not.toBeDisabled();
    });

    it('disables the Escalate button when the claim is inactive', () => {
      claim.status = 'Rejected';
      claim.statusUpdatedBy = 'mediator';
      claim.open = false;
      render(<ClaimActions claim={claim} />);

      const appealButton = screen.getByRole('button', { name: /Escalate to Kleros/i });
      expect(appealButton).toBeDisabled();
    });

    it('provides an Appeal action when Kleros is involved', () => {
      claim.status = 'Rejected';
      claim.statusUpdatedBy = 'arbitrator';
      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/Kleros/i)).toBeInTheDocument();
      expect(screen.getByText(/Rejected/i)).toBeInTheDocument();
      const appealButton = screen.getByRole('button', { name: /Appeal/i });
      expect(appealButton).not.toBeDisabled();
    });

    it('disables the Appeal button when the claim is inactive', () => {
      claim.status = 'Rejected';
      claim.statusUpdatedBy = 'arbitrator';
      claim.open = false;
      render(<ClaimActions claim={claim} />);

      const appealButton = screen.getByRole('button', { name: /Appeal/i });
      expect(appealButton).toBeDisabled();
    });
  });

  describe('"Resolved" status', () => {
    it('shows the claim has been approved', () => {
      claim.status = 'Resolved';
      claim.statusUpdatedBy = 'mediator';
      claim.resolvedAmount = BigNumber.from('60000000000000000000');
      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/API3 Multi-sig/i)).toBeInTheDocument();
      expect(screen.getByText(/Approved/i)).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0); // There should be no actions available
    });

    it('provides an Appeal action when Kleros is involved', () => {
      claim.status = 'Resolved';
      claim.statusUpdatedBy = 'arbitrator';
      claim.counterOfferAmount = BigNumber.from('60000000000000000000');
      claim.resolvedAmount = BigNumber.from('65000000000000000000');
      render(<ClaimActions claim={claim} />);

      expect(screen.getByText(/Kleros/i)).toBeInTheDocument();
      expect(screen.getByText(/Approved counter of 65.0 API3/i)).toBeInTheDocument();
      const appealButton = screen.getByRole('button', { name: /Appeal/i });
      expect(appealButton).not.toBeDisabled();
    });

    it('disables the Appeal button when the claim is inactive', () => {
      claim.status = 'Resolved';
      claim.statusUpdatedBy = 'arbitrator';
      claim.counterOfferAmount = BigNumber.from('60000000000000000000');
      claim.resolvedAmount = BigNumber.from('65000000000000000000');
      claim.open = false;
      render(<ClaimActions claim={claim} />);

      const appealButton = screen.getByRole('button', { name: /Appeal/i });
      expect(appealButton).toBeDisabled();
    });
  });
});
