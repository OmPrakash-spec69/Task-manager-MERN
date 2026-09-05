// Wraps an async route/controller function and forwards any rejected
// promise to Express's next() so the central error handler catches it.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
