import { calculateDeadline } from './data';
import { addDays, addSeconds } from 'date-fns';

describe('calculateDeadline', () => {
  it('returns a deadline of 3 days for "ClaimCreated"', () => {
    const statusUpdatedAt = addSeconds(new Date(), -42);
    const deadline = calculateDeadline({
      status: 'ClaimCreated',
      statusUpdatedAt,
      dispute: null,
    });

    expect(deadline).toEqual(addDays(statusUpdatedAt, 3));
  });

  it('returns a deadline of 3 days for "SettlementProposed"', () => {
    const statusUpdatedAt = addSeconds(new Date(), -42);
    const deadline = calculateDeadline({
      status: 'SettlementProposed',
      statusUpdatedAt,
      dispute: null,
    });

    expect(deadline).toEqual(addDays(statusUpdatedAt, 3));
  });

  describe('when the dispute is in its "Evidence" period', () => {
    it('returns the period end date with the "Vote" period added on', () => {
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
          timesPerPeriod: [
            evidencePeriod,
            1000, // Commit
            votePeriod,
            4.5 * 24 * 60 * 60, // Appeal
          ],
          appealedBy: null,
        },
      });

      expect(deadline).toEqual(addSeconds(periodChangedAt, evidencePeriod + votePeriod));
    });
  });

  describe('when the dispute is in its "Vote" period', () => {
    it('returns the period end date', () => {
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
          timesPerPeriod: [
            3.25 * 24 * 60 * 60, // Evidence
            1000, // Commit
            votePeriod,
            4.5 * 24 * 60 * 60, // Appeal
          ],
          appealedBy: null,
        },
      });

      expect(deadline).toEqual(addSeconds(periodChangedAt, votePeriod));
    });
  });

  describe('when the dispute is in its "Appeal" period', () => {
    it('returns the period end date', () => {
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
          timesPerPeriod: [
            3.25 * 24 * 60 * 60, // Evidence
            1000, // Commit
            6.75 * 24 * 60 * 60, // Vote
            appealPeriod,
          ],
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
          timesPerPeriod: [
            3.25 * 24 * 60 * 60, // Evidence
            1000, // Commit
            6.75 * 24 * 60 * 60, // Vote
            4.5 * 24 * 60 * 60, // Appeal
          ],
          appealedBy: null,
        },
      });

      expect(deadline).toEqual(null);
    });
  });
});
