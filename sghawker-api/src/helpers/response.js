import { Logger, Constants } from 'common';

export default {
  handle(handler, req, res, debugEnv, errorMessage = '') {
    handler(req)
      .then(result => {
        this.success(res, result);
      })
      .catch(err => {
        if (errorMessage) err.message = errorMessage;
        this.error(res, err, debugEnv);
      });
  },
  error(res, err, debugEnv) {
    Logger.error(err.stack, debugEnv);
    res.status(err.statusCode || Constants.STATUS_BAD_REQUEST);
    if (process.env.NODE_ENV !== 'development') {
      delete err.stack;
    }
    res.send({
      // Message is hidden by default in Error object
      message: err.message,
      ...err
    });
  },
  success(res, data) {
    if (data !== null && data !== undefined) {
      res.setHeader('path', res.req.path);
    }
    // Disable storing of webpages on browser cache
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '-1');

    res.status(Constants.STATUS_SUCCESS);
    res.send(data);
  }
};
