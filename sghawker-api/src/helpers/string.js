import { Constants } from 'common';
import sanitizeHtml from 'sanitize-html';

const passwordChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#&()–[{}]:;\',?/*~$^+=<>';
const alphaNumericChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const alphaChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const allUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const allLowercase = 'abcdefghijklmnopqrstuvwxyz';
const allNumbers = '0123456789';
const allSpecialChars = "_!@#&()–[{}]:;\',?/*~$^+=<>";
const numOfHardCoded = 4;

export default {
  isAlphaNumericWithDash(str) {
    const alphaNumRegex = /^[a-zA-Z0-9-_]+$/;
    return alphaNumRegex.test(str);
  },

  isAlphaNumeric(str) {
    const alphaNumRegex = /^[a-zA-Z0-9]+$/;
    return alphaNumRegex.test(str);
  },

  isNumeric(str) {
    const numRegex = /^[0-9]+$/;
    return numRegex.test(str);
  },

  randomPassword(numChars = 15) {
    if (numChars < numOfHardCoded) {
      return Array(...Array(numChars))
        .map(() => passwordChars.charAt(Math.floor(Math.random() * passwordChars.length)))
        .join('');
    }

    const randomUppercase = allUppercase.charAt(Math.floor(Math.random() * allUppercase.length));
    const randomLowercase = allLowercase.charAt(Math.floor(Math.random() * allLowercase.length));
    const randomNumber = allNumbers.charAt(Math.floor(Math.random() * allNumbers.length));
    const randomSpecialChar = allSpecialChars.charAt(Math.floor(Math.random() * allSpecialChars.length));

    const randomPw = Array(...Array(numChars - numOfHardCoded))
      .map(() => passwordChars.charAt(Math.floor(Math.random() * passwordChars.length)))
      .join('');

    const res = randomUppercase + randomLowercase + randomPw + randomSpecialChar + randomNumber;
    return res;
  },

  randomToken(numChars = 6) {
    return Array(...Array(numChars))
      .map(() => alphaNumericChars.charAt(Math.floor(Math.random() * alphaNumericChars.length)))
      .join('');
  },

  randomAlphabets(numChars = 6) {
    return Array(...Array(numChars))
      .map(() => alphaChars.charAt(Math.floor(Math.random() * alphaChars.length)))
      .join('');
  },

  validateSecureLink(inputLink) {
    return inputLink.startsWith(Constants.SECURE_HTTPS_SOURCE);
  },

  validateImgLinkFileType(imgLink) {
    return (imgLink.endsWith('.jpg')
      || imgLink.endsWith('.jpeg')
      || imgLink.endsWith('.png')
      || imgLink.endsWith('.gif')
    );
  },

  isJSON(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  },

  sanitiseInput(inputStr) {
    if (inputStr && typeof inputStr === 'string') {
      inputStr = sanitizeHtml(inputStr);
    }
    return inputStr;
  },

  sanitiseInputs(obj, fieldsArr) {
    for (const fieldName of fieldsArr) {
      if (obj[fieldName] && typeof obj[fieldName] === 'string') {
        obj[fieldName] = sanitizeHtml(obj[fieldName]);
      }
    }
  }
};
