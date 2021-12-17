import Promise from "bluebird";
import bcrypt from "bcryptjs";
import _ from "lodash";
import moment from "moment";
import { ClientError, Constants } from "common";
import { ResponseHelper, SendgridHelper, Logger } from "helpers";
import { User, Outlet } from "models";
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

const DEBUG_ENV = "UserController";

const UserController = {
  request: {}
};

/**
 * File upload
 */

function createFolderForAccount(email) {
  let fileLocation = `public/static/upload/account/${email}`;
  try {
    if (!fs.existsSync(fileLocation)) {
      fs.mkdirSync(fileLocation);
    }
  } catch (err) {
    Logger.error('Error: Unable to create user folder');
  }
}

/**
 * Delete all files marked with 'profile-'
 * Each account can only have one profile picture
 * @param {*} folderDir
 */
function removeExistingProfilePicture(folderDir) {
  var uploadDir = fs.readdirSync(folderDir);
  for (let i = 0; i < uploadDir.length; i++) {
    if (uploadDir[i].includes('profile')) {
      fs.unlinkSync(`${folderDir}/${uploadDir[i]}`);
    }
  }
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const { userEmail } = req.params;
    let fileLocation = `public/static/upload/account/${userEmail}`;
    try {
      if (!fs.existsSync(fileLocation)) {
        fs.mkdirSync(fileLocation);
      }
    } catch (err) {
      Logger.error('Error: Unable to create user folder');
    }
    cb(null, fileLocation);
  },
  filename(req, file, cb) {
    const { userEmail } = req.params;
    let folder = `public/static/upload/account/${userEmail}`;

    let filePrepend = '';
    if (req.url.includes('uploadProfileImage')) {
      filePrepend = 'profile';
      removeExistingProfilePicture(folder);
    } else if (req.url.includes('uploadHawkerDocumentForDeluxe')) {
      filePrepend = 'doc-deluxe';
    } else if (req.url.includes('uploadHawkerDocuments')) {
      filePrepend = 'doc';
    }
    cb(null, `${filePrepend}-${file.originalname}`);
  }
});


const upload = multer({
  storage
}).single('file');

UserController.request.uploadHawkerDocumentForDeluxe = function (req, res) {
  upload(req, res, err => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json({ message: err });
    }
    return res.status(200).send(req.file);
  });
};

UserController.request.uploadHawkerDocuments = function (req, res) {
  upload(req, res, err => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json({ message: err });
    }
    return res.status(200).send(req.file);
  });
};

UserController.request.uploadProfileImage = function (req, res) {
  upload(req, res, err => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json({ message: err });
    }
    const { userEmail } = req.params;
    return User.findOneByEmail(userEmail)
      .then(user => User.updateUserProfileDetails(user._id, {
        profileImgSrc: req.file.path
      }))
      .then(
        user => {
          user._hashedPassword = undefined;
          return ResponseHelper.success(res, user);
        },
        error => ResponseHelper.error(res, error, DEBUG_ENV)
      );
  });
};

/**
 * SHARED
 */
function removeSessionFromStore(req) {
  return Promise
    .resolve()
    .then(() => {
      req.session.destroy(req.sessionId);
    });
}

UserController.request.downloadProfileImage = function (req, res) {
  const { userEmail } = req.params;

  var uploadDir = fs.readdirSync(`public/static/upload/account/${userEmail}`);
  let profileImageName;
  for (let i = 0; i < uploadDir.length; i++) {
    if (uploadDir[i].includes('profile')) {
      profileImageName = uploadDir[i];
      break;
    }
  }

  if (!profileImageName) {
    return res.status(500).json({ message: Constants.ERROR_USER_PROFILE_IMAGE_NOT_FOUND });
  }

  res.setHeader('Content-Disposition', `attachment: filename="${profileImageName}"`);
  res.status(200).sendFile(path.join(__dirname, `../../public/static/upload/account/${userEmail}/${profileImageName}`));
};

/**
 * HAWKER
 */

/**
 * check email address before creating
 * @returns create hawker and folder named after hawker email
 */
UserController.request.createNewHawker = function (req, res) {
  const reqError = User.validate(req.body, {
    name: true,
    email: true,
    password: true,
    accountTier: true
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  User.checkExists(req.body.email)
    .then(
      existingUser => new Promise((resolve, reject) => {
        if (existingUser) {
          reject(new ClientError(Constants.ERROR_USER_EMAIL_IN_USE));
        } else {
          resolve(req.body);
        }
      })
    )
    .then(hawkerData => User.createHawker(hawkerData))
    .then(createdHawker => {
      createdHawker._hashedPassword = undefined;
      createFolderForAccount(createdHawker.email);
      ResponseHelper.success(res, createdHawker);
    }, error => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    });
};

UserController.request.hawkerLogin = function (req, res) {
  const { email, password } = req.body;
  const reqError = User.validate(req.body, {
    email: true,
    password: true
  });

  if (reqError) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ERROR_USER_EMAIL_INVALID),
      DEBUG_ENV
    );
  }

  return User
    .findOneByEmail(email)
    .then(user => new Promise((resolve, reject) => {
      if (user.accountType === Constants.HAWKER) {
        switch (user.accountStatus) {
          case Constants.APPROVED:
            reject(new ClientError(Constants.ERROR_HAWKER_ACCOUNT_APPROVED));
            break;
          case Constants.SUSPENDED:
            reject(new ClientError(Constants.ERROR_HAWKER_ACCOUNT_SUSPENDED));
            break;
          case Constants.PENDING:
            reject(new ClientError(Constants.ERROR_HAWKER_ACCOUNT_PENDING));
            break;
          case Constants.DELETED:
            reject(new ClientError(Constants.ERROR_HAWKER_ACCOUNT_DELETED));
            break;
          case Constants.REJECTED:
            reject(new ClientError(Constants.ERROR_HAWKER_ACCOUNT_REJECTED));
            break;
          default:
            resolve(user);
            break;
        }
      } else {
        reject(new ClientError(Constants.ERROR_USER_LOGIN_INCORRECT));
      }
    }))
    .then(
      user => new Promise((resolve, reject) => {
        bcrypt.compare(password, user._hashedPassword, (err, result) => {
          if (err) {
            reject(err);
          } else if (!result) {
            reject(new ClientError(Constants.ERROR_USER_LOGIN_INCORRECT));
          } else {
            resolve(user);
          }
        });
      })
    )
    .then(user => new Promise((resolve, reject) => {
      if (user.currentlyLoggedIn && user.accountTier === Constants.FREE) {
        reject(new ClientError(Constants.ERROR_MULTIPLE_LOGIN));
      } else {
        resolve(user);
      }
    }))
    .then(user => User.updateCurrentlyLoggedIn(user._id, true))
    .then(user => {
      // omit hashedPassword from result
      user._hashedPassword = undefined;
      return user;
    })
    .then(
      user =>
        Outlet
          .findOutletsByHawkerId(user._id)
          .then(outlets => {
            user.outlets = outlets;
            User.updateAccountStatus(user._id, Constants.ACTIVE);
            User.updateLastLoggedIn(user._id);
            req.session.hawker = user;
            ResponseHelper.success(res, user);
          }),
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    )
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

UserController.request.hawkerLogout = function (req, res) {
  const { hawkerId } = req.params;
  return User
    .updateCurrentlyLoggedIn(hawkerId, false)
    .then(
      r => {
        removeSessionFromStore(req);
        return ResponseHelper.success(res, r);
      },
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

/**
 * CUSTOMER
 */

/**
 * @returns create customer and folder named after customer email
 */
UserController.request.createNewCustomer = function (req, res) {
  const reqError = User.validate(req.body, {
    name: true,
    email: true,
    password: true,
    accountType: true,
    accountTier: true
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  User.checkExists(req.body.email)
    .then(
      existingUser => new Promise((resolve, reject) => {
        if (existingUser) {
          reject(new ClientError(Constants.ERROR_USER_EMAIL_IN_USE));
        } else {
          resolve(req.body);
        }
      })
    )
    .then(customerData => User.createCustomer(customerData))
    .then(
      createdCustomer => {
        createFolderForAccount(createdCustomer.email);
        createdCustomer._hashedPassword = undefined;
        ResponseHelper.success(res, createdCustomer);
      },
      error => {
        ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
      }
    );
};

UserController.request.customerLogout = function (req, res) {
  const { customerId } = req.params;
  return User
    .updateCurrentlyLoggedIn(customerId, false)
    .then(
      updatedCustomer => {
        removeSessionFromStore(req);
        return ResponseHelper.success(res, updatedCustomer);
      },
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

UserController.request.customerLogin = function (req, res) {
  const { email, password } = req.body;
  const reqError = User.validate(req.body, {
    email: true,
    password: true
  });

  if (reqError) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ERROR_USER_EMAIL_INVALID),
      DEBUG_ENV
    );
  }

  return User
    .findOneByEmail(email)
    .then(user => new Promise((resolve, reject) => {
      if (user.accountType === Constants.CUSTOMER) {
        resolve(user);
      } else {
        reject(new ClientError(Constants.ERROR_USER_LOGIN_INCORRECT));
      }
    }))
    .then(
      user => new Promise((resolve, reject) => {
        bcrypt.compare(password, user._hashedPassword, (err, result) => {
          if (err) {
            reject(err);
          } else if (!result) {
            reject(new ClientError(Constants.ERROR_USER_LOGIN_INCORRECT));
          } else {
            resolve(user);
          }
        });
      })
    )
    .then(user => User.updateCurrentlyLoggedIn(user._id, true))
    .then(user => {
      // omit hashedPassword from result
      user._hashedPassword = undefined;
      return user;
    })
    .then(
      user => {
        User.updateLastLoggedIn(user._id);
        req.session.customer = user;
        ResponseHelper.success(res, user);
      },
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    )
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

UserController.request.updateAccountDetails = function (req, res) {
  const { id } = req.params;

  const detailsToUpdate = req.body;
  const reqError = User.validate(detailsToUpdate, detailsToUpdate);

  if (reqError) {
    return ResponseHelper.error(res, reqError, DEBUG_ENV);
  }

  return User.updateUserProfileDetails(id, detailsToUpdate).then(
    user => {
      user._hashedPassword = undefined;
      return ResponseHelper.success(res, user);
    },
    error => {
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey' && error.keyPattern.email) {
        return ResponseHelper.error(res, new ClientError(Constants.ERROR_USER_EMAIL_IN_USE), DEBUG_ENV);
      }
      return ResponseHelper.error(res, error, DEBUG_ENV);
    }
  );
};

UserController.request.addCard = function (req, res) {
  const { id } = req.params;

  const detailsToUpdate = req.body;

  return User.addUserCard(id, detailsToUpdate).then(
    user => {
      return ResponseHelper.success(res, user);
    },
    error => {
      return ResponseHelper.error(res, error, DEBUG_ENV);
    }
  );
};

UserController.request.editCard = function (req, res) {
  const { id } = req.params;

  const detailsToUpdate = req.body;

  return User.editUserCard(id, detailsToUpdate).then(
    user => {
      return ResponseHelper.success(res, user);
    },
    error => {
      return ResponseHelper.error(res, error, DEBUG_ENV);
    }
  );
};

UserController.request.removeCard = function (req, res) {
  const { id } = req.params;

  const detailsToUpdate = req.body;

  return User.removeUserCard(id, detailsToUpdate).then(
    user => {
      return ResponseHelper.success(res, user);
    },
    error => {
      return ResponseHelper.error(res, error, DEBUG_ENV);
    }
  );
};

UserController.request.addFavouriteCentre = function (req, res) {
  const { id } = req.params;

  const detailsToUpdate = req.body;

  return User.addUserFavouriteCentre(id, detailsToUpdate).then(
    user => {
      user._hashedPassword = undefined;
      return ResponseHelper.success(res, user);
    },
    error => {
      return ResponseHelper.error(res, error, DEBUG_ENV);
    }
  );
};

UserController.request.removeFavouriteCentre = function (req, res) {
  const { id } = req.params;

  const detailsToUpdate = req.body;

  return User.removeUserFavouriteCentre(id, detailsToUpdate).then(
    user => {
      user._hashedPassword = undefined;
      return ResponseHelper.success(res, user);
    },
    error => {
      return ResponseHelper.error(res, error, DEBUG_ENV);
    }
  );
};

UserController.request.addFavouriteStore = function (req, res) {
  const { id } = req.params;

  const detailsToUpdate = req.body;

  return User.addUserFavouriteStore(id, detailsToUpdate).then(
    user => {
      user._hashedPassword = undefined;
      return ResponseHelper.success(res, user);
    },
    error => {
      return ResponseHelper.error(res, error, DEBUG_ENV);
    }
  );
};

UserController.request.removeFavouriteStore = function (req, res) {
  const { id } = req.params;

  const detailsToUpdate = req.body;

  return User.removeUserFavouriteStore(id, detailsToUpdate).then(
    user => {
      user._hashedPassword = undefined;
      return ResponseHelper.success(res, user);
    },
    error => {
      return ResponseHelper.error(res, error, DEBUG_ENV);
    }
  );
};

/**
 * ADMIN
 */

UserController.request.adminLogin = function (req, res) {
  const { email, password } = req.body;
  const reqError = User.validate(req.body, {
    email: true,
    password: true
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(Constants.ERROR_USER_EMAIL_INVALID), DEBUG_ENV);
  }

  return User
    .findOneByEmail(email)
    .then(user => new Promise((resolve, reject) => {
      if (user == null) {
        reject(new ClientError(Constants.ERROR_USER_EMAIL_NOT_FOUND));
      }
      if (user.accountType === Constants.ADMIN) {
        resolve(user);
      } else {
        reject(new ClientError(Constants.ERROR_USER_LOGIN_INCORRECT));
      }
    }))
    .then(
      user => new Promise((resolve, reject) => {
        bcrypt.compare(password, user._hashedPassword, (err, result) => {
          if (err) {
            reject(err);
          } else if (!result) {
            reject(new ClientError(Constants.ERROR_USER_LOGIN_INCORRECT));
          } else {
            resolve(user);
          }
        });
      })
    )
    .then(user => User.updateCurrentlyLoggedIn(user._id, true))
    .then(user => {
      // omit hashedPassword from result
      user._hashedPassword = undefined;
      return user;
    })
    .then(
      user => {
        User.updateLastLoggedIn(user._id);
        req.session.admin = user;
        ResponseHelper.success(res, user);
      },
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    )
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

UserController.request.adminLogout = function (req, res) {
  return removeSessionFromStore(req)
    .then(ResponseHelper.success(res))
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

UserController.request.findAllPendingHawkerAccounts = function (req, res) {
  return User
    .findAllHawkerAccounts()
    .then(allHawkers => Promise.resolve(allHawkers.filter(x => x.toObject().hasOwnProperty('accountStatus') && x.accountStatus === Constants.PENDING)))
    .then(allHawkerAccounts => {
      if (allHawkerAccounts) {
        return ResponseHelper.success(res, allHawkerAccounts);
      } else {
        return ResponseHelper.error(res, new ClientError(Constants.ERROR_USER_EMAIL_NOT_FOUND));
      }
    });
};

UserController.request.findAllApprovedHawkerAccounts = function (req, res) {
  return User.findAllHawkerAccounts()
    .then(allHawkers => Promise.resolve(
      allHawkers.filter(
        x => x.toObject().hasOwnProperty("accountStatus")
          && x.accountStatus !== Constants.PENDING
      )
    ))
    .then(allHawkerAccounts => {
      if (allHawkerAccounts) {
        return ResponseHelper.success(res, allHawkerAccounts);
      } else {
        return ResponseHelper.success(res, {});
      }
    });
};

UserController.request.approveHawker = function (req, res) {
  const { hawkerId } = req.params;
  return User.updateAccountStatus(hawkerId, Constants.APPROVED).then(
    hawker => SendgridHelper
      .sendHawkerAccountApplicationOutcome(hawker.name, hawker.email, Constants.APPROVED, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"))
      .then(success => {
        ResponseHelper.success(res, success);
      }, error => {
        ResponseHelper.error(res, new ClientError(error));
      }),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

UserController.request.rejectHawker = function (req, res) {
  const { hawkerId } = req.params;
  const { writtenInstruction } = req.body;

  if (!writtenInstruction) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.NO_WRITTEN_INSTRUCTIONS_FOUND)
    );
  }

  return User.updateAccountStatus(hawkerId, Constants.REJECTED).then(
    hawker => SendgridHelper
      .sendHawkerAccountApplicationOutcome(hawker.name, hawker.email, Constants.REJECTED, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), writtenInstruction)
      .then(success => {
        ResponseHelper.success(res, success);
      }, error => {
        ResponseHelper.error(res, new ClientError(error));
      }),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

UserController.request.findSubscriptionFees = function (req, res) {
  return User
    .findOneByEmail("admin@admin.com")
    .then(
      admin => ResponseHelper.success(res, admin.subscriptionFees),
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

UserController.request.updateSubscriptionFees = function (req, res) {
  const subscriptionFees = req.body;

  if (!subscriptionFees) {
    return ResponseHelper.error(res, new ClientError(Constants.ERROR_USER_SUBSCRIPTION_FEES_NOT_FOUND), DEBUG_ENV);
  }

  return User
    .updateSubscriptionFees(subscriptionFees)
    .then(
      admin => ResponseHelper.success(res, admin),
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

UserController.request.findAllCustomerAccounts = function (req, res) {
  return User.findAllCustomerAccounts().then(
    users => {
      return ResponseHelper.success(res, users);
    },
    error => {
      return ResponseHelper.error(res, error, DEBUG_ENV);
    }
  )
}

UserController.request.suspendCustomerAccount = function (req, res) {
  const { customerId } = req.params;
  const writtenInstruction = req.body.reason;

  if (!writtenInstruction) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.NO_WRITTEN_INSTRUCTIONS_FOUND)
    );
  }

  return User.updateCustomerAccountStatus(customerId, Constants.SUSPENDED).then(
    customer => SendgridHelper
      .sendCustomerAccountRegardingSuspension(customer.name, customer.email, Constants.SUSPENDED, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), writtenInstruction)
      .then(success => {
        ResponseHelper.success(res, success);
      }, error => {
        ResponseHelper.error(res, new ClientError(error));
      }),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
}

UserController.request.activateCustomerAccount = function (req, res) {
  const { customerId } = req.params;

  return User.updateAccountStatus(customerId, Constants.ACTIVE).then(
    customer => ResponseHelper.success(res, customer),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
}

UserController.request.updateCustomerAccount = function (req, res) {
  const { customerId } = req.params;
  const reqError = User.validate(req.body, {
    _id: true,
    name: true,
    phone: true,
    email: true,
    accountStatus: true
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(Constants.ERROR_CUSTOMER_ACCOUNT_ID_NOT_FOUND), DEBUG_ENV);
  }

  return User
    .updateCustomerAccount(customerId, req.body)
    .then(
      customer => ResponseHelper.success(res, customer),
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
}

UserController.request.updateAccountTier = function (req, res) {
  const { hawkerId } = req.params;
  const { accountTier, masterOutlet } = req.body;

  if (!accountTier) {
    return ResponseHelper.error(res, new ClientError(Constants.ERROR_USER_ACCOUNT_TIER_NOT_FOUND), DEBUG_ENV);
  }

  let masterOutletId = masterOutlet;
  let accountTierStatus;
  switch (accountTier) {
    case Constants.FREE:
    case Constants.PREMIUM:
      accountTierStatus = Constants.APPROVED;
      masterOutletId = null;
      break;
    case Constants.DELUXE:
      accountTierStatus = Constants.PENDING;
      masterOutletId = masterOutlet._id;
      break;
    default:
      break;
  }
  return User
    .updateAccountTier(hawkerId, accountTierStatus, accountTier, masterOutletId)
    .then(
      hawker => ResponseHelper.success(res, hawker),
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

UserController.request.approveAccountTier = function (req, res) {
  const { hawkerId } = req.params;
  const { newAccountTier, masterOutletId } = req.body;

  return User.updateAccountTier(hawkerId, Constants.APPROVED, newAccountTier, masterOutletId).then(
    hawker =>
      SendgridHelper
        .sendHawkerAccountTierApplicationOutcome(hawker.name, hawker.email, Constants.APPROVED, newAccountTier, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"))
        .then(success => {
          ResponseHelper.success(res, success);
        }, error => {
          ResponseHelper.error(res, new ClientError(error));
        }),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

// use this for downgrade/reject account tier; immediately sets to approved account tier
// set masteroutlet if there is a masteroutlet in the account, else set as null
UserController.request.rejectAccountTier = function (req, res) {
  const { hawkerId } = req.params;
  const { writtenInstruction, newAccountTier, masterOutlet } = req.body;

  if (!writtenInstruction) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.NO_WRITTEN_INSTRUCTIONS_FOUND)
    );
  }

  let masterOutletId;
  // account currently does not have master outlet
  if (masterOutlet === null) {
    masterOutletId = null;
    // account has master outlet
  } else {
    masterOutletId = masterOutlet._id;
  }

  return User.updateAccountTier(hawkerId, Constants.APPROVED, newAccountTier, masterOutletId).then(
    hawker =>
      SendgridHelper
        .sendHawkerAccountTierApplicationOutcome(hawker.name, hawker.email, Constants.REJECTED, newAccountTier, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), writtenInstruction)
        .then(success => {
          ResponseHelper.success(res, success);
        }, error => {
          ResponseHelper.error(res, new ClientError(error));
        }),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

UserController.request.findAllPendingUpgradeHawkerAccounts = function (req, res) {
  return User.findAllHawkerAccounts()
    .then(allHawkers => Promise.resolve(
      allHawkers.filter(
        x => x.toObject().hasOwnProperty("accountUpgradeStatus")
          && x.accountUpgradeStatus === Constants.PENDING
      )
    ))
    .then(allHawkerAccounts => {
      if (allHawkerAccounts) {
        return ResponseHelper.success(res, allHawkerAccounts);
      } else {
        return ResponseHelper.success(res, {});
      }
    });
};

UserController.request.findAllApprovedUpgradeHawkerAccounts = function (req, res) {
  return User.findAllHawkerAccounts()
    .then(allHawkers => Promise.resolve(
      allHawkers.filter(
        x => x.toObject().hasOwnProperty("accountUpgradeStatus")
          && x.accountUpgradeStatus === Constants.APPROVED
          && x.accountTier === Constants.DELUXE
      )
    ))
    .then(allHawkerAccounts => {
      if (allHawkerAccounts) {
        return ResponseHelper.success(res, allHawkerAccounts);
      } else {
        return ResponseHelper.success(res, {});
      }
    });
};

UserController.request.findHawkerAccount = function (req, res) {
  const { id } = req.params;

  return User
    .findHawkerAccount(id)
    .then(hawker => Promise.resolve(hawker))
    .then(hawker => {
      if (hawker) {
        return ResponseHelper.success(res, hawker);
      } else {
        return ResponseHelper.error(res, new ClientError(Constants.ERROR_HAWKER_ACCOUNT_ID_NOT_FOUND), DEBUG_ENV);
      }
    });
};

UserController.request.updateHawkerAccount = function (req, res) {
  const { id } = req.params;
  const reqError = User.validate(req.body, {
    _id: true,
    name: true,
    phone: true,
    email: true,
    accountTier: true,
    accountStatus: true
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(Constants.ERROR_HAWKER_ACCOUNT_ID_NOT_FOUND), DEBUG_ENV);
  }

  return User
    .updateHawkerAccount(id, req.body)
    .then(
      hawker => ResponseHelper.success(res, hawker),
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

UserController.request.downloadHawkerDocumentsAsZip = function (req, res) {
  const { hawkerEmail } = req.params;
  const zip = new AdmZip();
  var uploadDir = fs.readdirSync(`public/static/upload/account/${hawkerEmail}`);
  for (let i = 0; i < uploadDir.length; i++) {
    if (uploadDir[i].includes('doc')) {
      zip.addLocalFile(`public/static/upload/account/${hawkerEmail}/${uploadDir[i]}`);
    }
  }
  const downloadName = `${Date.now()}.zip`;
  const data = zip.toBuffer();
  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', `attachment; filename=${downloadName}`);
  res.set('Content-Length', data.length);
  res.send(data);
};

UserController.request.findNumOfFavouritesForAllHawkers = function (req, res) {
  return User.findNumOfFavouritesForAllHawkers().then(
    retrievedNumOfFavourites => ResponseHelper.success(res, retrievedNumOfFavourites),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
}

UserController.request.findNumOfFavouritesForAllHawkerCentres = function (req, res) {
  return User.findNumOfFavouritesForAllHawkerCentres().then(
    retrievedNumOfFavourites => ResponseHelper.success(res, retrievedNumOfFavourites),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
}

UserController.request.downloadAccountUpgradeDocumentsAsZip = function (req, res) {
  const { hawkerEmail } = req.params;
  const zip = new AdmZip();
  var uploadDir = fs.readdirSync(`public/static/upload/account/${hawkerEmail}`);
  for (let i = 0; i < uploadDir.length; i++) {
    if (uploadDir[i].includes('doc-deluxe')) {
      zip.addLocalFile(`public/static/upload/account/${hawkerEmail}/${uploadDir[i]}`);
    }
  }
  const downloadName = `${Date.now()}.zip`;
  const data = zip.toBuffer();
  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', `attachment; filename=${downloadName}`);
  res.set('Content-Length', data.length);
  res.send(data);
};

export default UserController;
