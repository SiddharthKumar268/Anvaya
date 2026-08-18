// server/utils/accountLockout.js

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

const isAccountLocked = (user) => {
  if (!user.lockUntil) return false;
  return user.lockUntil > Date.now();
};

const registerFailedAttempt = async (user) => {
  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

  if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    user.lockUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000; // Lock for 15 minutes
  }

  await user.save();
};

const resetFailedAttempts = async (user) => {
  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }
};

const getLockRemainingMinutes = (user) => {
  if (!user.lockUntil || user.lockUntil <= Date.now()) return 0;
  return Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
};

module.exports = {
  isAccountLocked,
  registerFailedAttempt,
  resetFailedAttempts,
  getLockRemainingMinutes
};
