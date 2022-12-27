module.exports = (willTakeAFunction) => (req, res, next) => {
  Promise.resolve(willTakeAFunction(req, res, next)).catch(next);
};
