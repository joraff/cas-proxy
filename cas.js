module.exports = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    req.nextUrl = req.originalUrl;
    return res.redirect('/login?nextUrl=' + req.nextUrl);
  }
};
