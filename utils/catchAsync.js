//Error handling middleware
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

//it catches error & send to appError middleware
