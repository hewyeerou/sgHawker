import session from 'express-session';
import { Logger } from 'common';
import settings from './settings';

const DEBUG_ENV = 'MONGODB-SESSION';

const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore(
  {
    uri: settings.DATABASE_URL,
    collection: 'sessions'
  }
);

store.on('error', function (error) {
  Logger.error('Error: Unable to set up session: ' + error, DEBUG_ENV);
});

export default app => {
  app.use(session({
    // TODO: generate random hash secret key
    secret: 'sgHawkers',
    resave: false,
    saveUninitialized: false,
    store: store
  }));
};
