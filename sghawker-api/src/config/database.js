import Promise from 'bluebird';
import mongoose from 'mongoose';

import { ClientError, Logger } from 'common';
import { User } from 'models';
import { Wallet } from 'models';
import settings from './settings';

const DEBUG_ENV = 'mongodb';

export function connectDb() {
  const options = {
    useNewUrlParser: true,
    // replicaSet: 'atlas-ky02xp-shard-0'
    // useUnifiedTopology: true,
    // useCreateIndex: true
  };

  return new Promise((resolve, reject) => {
    mongoose.Promise = Promise;
    mongoose.connect(settings.DATABASE_URL, options, err => {
      const { host, port } = mongoose.connection;
      if (err) {
        reject(new ClientError(`Unable to connect to database: ${host}:${port}\n${err}`));
      } else {
        Logger.info(`Connected database: ${host}:${port}`, DEBUG_ENV);
        resolve();
      }
    });
  });
}

export default function () {
  return connectDb()
    .then(
      () => User
        .findOneByEmail(settings.ADMIN_EMAIL)
        .then(admin => {
          if (!admin) {
            return new Promise.resolve(
              User.createAdmin()
              //have not tested the creation of admin wallet
              .then((admin) => {
                Wallet.createNewWallet(admin._id, null, false);
              }));
          }
        })
    );
}
