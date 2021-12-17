import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import helmet from 'helmet';
import { Logger } from 'common';
import express from 'express';
import path from 'path';
export default app => {
  app.use('/public', express.static(path.join(__dirname, '../../public')));
  app.use(cors());
  app.use(morgan('tiny', { stream: Logger.stream }));
  app.set('trust proxy', 1);
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.text());
  app.use(cookieParser());
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'unsafe-eval'", "'unsafe-inline'"]
      }
    })
  );
  app.use(methodOverride());
  app.use(compression());
};
