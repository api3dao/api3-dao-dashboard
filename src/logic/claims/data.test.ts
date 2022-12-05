import { calculateDeadline } from './data';
import { addDays, addSeconds } from 'date-fns';

describe('calculateDeadline', () => {
  it('returns a deadline of 3 days for "ClaimCreated" status', () => {
    const statusUpdatedAt = addSeconds(new Date(), -42);
    const deadline = calculateDeadline({
      status: 'ClaimCreated',
      statusUpdatedAt,
      dispute: null,
    });

    expect(deadline).toEqual(addDays(statusUpdatedAt, 3));
  });

  it('returns a deadline of 3 days for "SettlementProposed" status', () => {
    const statusUpdatedAt = addSeconds(new Date(), -42);
    const deadline = calculateDeadline({
      status: 'SettlementProposed',
      statusUpdatedAt,
      dispute: null,
    });

    expect(deadline).toEqual(addDays(statusUpdatedAt, 3));
  });

  describe('when the dispute is in its "Evidence" period', () => {
    it('returns the vote period end date', () => {
      const periodChangedAt = addSeconds(new Date(), -42);
      const evidencePeriod = 3.25 * 24 * 60 * 60;
      const votePeriod = 6.75 * 24 * 60 * 60;
      const deadline = calculateDeadline({
        status: 'DisputeCreated',
        statusUpdatedAt: addDays(new Date(), -14),
        dispute: {
          id: '1',
          status: 'Waiting',
          ruling: 'DoNotPay',
          period: 'Evidence',
          periodChangedAt,
          periodTimes: {
            evidence: evidencePeriod,
            vote: votePeriod,
            appeal: 4.5 * 24 * 60 * 60,
          },
          appealedBy: null,
        },
      });

      expect(deadline).toEqual(addSeconds(periodChangedAt, evidencePeriod + votePeriod));
    });
  });

  describe('when the dispute is in its "Vote" period', () => {
    it('returns the vote period end date', () => {
      const periodChangedAt = addSeconds(new Date(), -42);
      const votePeriod = 6.75 * 24 * 60 * 60;
      const deadline = calculateDeadline({
        status: 'DisputeCreated',
        statusUpdatedAt: addDays(new Date(), -14),
        dispute: {
          id: '1',
          status: 'Waiting',
          ruling: 'DoNotPay',
          period: 'Vote',
          periodChangedAt,
          periodTimes: {
            evidence: 3.25 * 24 * 60 * 60,
            vote: votePeriod,
            appeal: 4.5 * 24 * 60 * 60,
          },
          appealedBy: null,
        },
      });

      expect(deadline).toEqual(addSeconds(periodChangedAt, votePeriod));
    });
  });

  describe('when the dispute is in its "Appeal" period', () => {
    it('returns the appeal period end date', () => {
      const periodChangedAt = addSeconds(new Date(), -42);
      const appealPeriod = 4.5 * 24 * 60 * 60;
      const deadline = calculateDeadline({
        status: 'DisputeCreated',
        statusUpdatedAt: addDays(new Date(), -14),
        dispute: {
          id: '1',
          status: 'Appealable',
          ruling: 'DoNotPay',
          period: 'Appeal',
          periodChangedAt,
          periodTimes: {
            evidence: 3.25 * 24 * 60 * 60,
            vote: 6.75 * 24 * 60 * 60,
            appeal: appealPeriod,
          },
          appealedBy: null,
        },
      });

      expect(deadline).toEqual(addSeconds(periodChangedAt, appealPeriod));
    });
  });

  describe('when the dispute is in its "Execution" period', () => {
    it('returns nothing', () => {
      const deadline = calculateDeadline({
        status: 'DisputeCreated',
        statusUpdatedAt: addDays(new Date(), -14),
        dispute: {
          id: '1',
          status: 'Solved',
          ruling: 'DoNotPay',
          period: 'Execution',
          periodChangedAt: new Date(),
          periodTimes: {
            evidence: 3.25 * 24 * 60 * 60,
            vote: 6.75 * 24 * 60 * 60,
            appeal: 4.5 * 24 * 60 * 60,
          },
          appealedBy: null,
        },
      });

      expect(deadline).toEqual(null);
    });
  });
});
