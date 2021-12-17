import _ from 'lodash';
import axios from 'axios';

import { Constants, ClientError } from 'common';

const errorFields = ['name', 'message', 'stack'];

export default {
  async post(url = '', body = {}, additionalHeaders = {}) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...additionalHeaders
        }
      };
      const response = await axios.post(url, body, config);
      const { data } = response;
      return data;
    } catch (error) {
      return _.pick(error, errorFields);
    }
  },

  async get(url = '', body = {}, params = {}, additionalHeaders = {}) {
    try {
      const request = {
        url,
        method: 'get',
        params,
        data: body,
        headers: {
          'Content-Type': 'application/json',
          ...additionalHeaders
        }
      };
      const response = await axios(request);
      const { data } = response;
      return data;
    } catch (error) {
      return _.pick(error, errorFields);
    }
  },

//   async poll({ fn, validate, interval, maxAttempts }) {
//     let attempts = 0;

//     const executePoll = async (resolve, reject) => {
//       const result = await fn();
//       attempts += 1;

//       if (validate(result)) {
//         return resolve(result);
//       } else if (maxAttempts && attempts === maxAttempts) {
//         return reject(new ClientError(Constants.ERROR_POLL_EXCEEDED_MAX_ATTEMPTS));
//       } else {
//         return setTimeout(executePoll, interval, resolve, reject);
//       }
//     };

//     return new Promise(executePoll);
//   }
};
