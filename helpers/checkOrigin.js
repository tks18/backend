module.exports = (origin) => {
  let allowedOrigins = process.env.FRONT.split(',');
  if (origin && allowedOrigins.indexOf(origin) > -1) {
    return true;
  } else {
    return false;
  }
};
