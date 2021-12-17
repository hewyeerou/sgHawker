import Promise from 'bluebird';
import fs from 'fs';
import { Constants } from 'common';
import SendgridClient from './send-grid-client';
import moment from 'moment';

export default {
  readHtmlFile(fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(`${__dirname}/${fileName}`, 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  },

  sendHawkerAccountApplicationOutcome(toName, emailAddress, applicationOutcome, periodDate, writtenInstruction) {
    let emailTemplate;

    if (applicationOutcome === Constants.APPROVED) {
      emailTemplate = "hawkerAccountApprovalNotification.html";
    } else if (applicationOutcome === Constants.REJECTED) {
      emailTemplate = "hawkerAccountRejectionNotification.html";
    }

    const subject = `${applicationOutcome} Hawker Account Registration`;

    return this.readHtmlFile(emailTemplate).then(htmlData => {
      const confirmEmail = new SendgridClient.Email({
        to: emailAddress,
        from: Constants.EMAIL_SENDER_ADDRESS,
        fromName: Constants.EMAIL_SENDER_NAME,
        subject: subject,
        html: htmlData
      });

      confirmEmail.setSubstitutions({
        '-applicationStatus-': [applicationOutcome.toLowerCase()],
        '-name-': [toName],
        '-periodDate-': [periodDate],
        '-writtenInstruction-': [writtenInstruction]
      });

      return new Promise((resolve, reject) => {
        SendgridClient.send(confirmEmail, (err, json) => {
          if (err) {
            return reject(err);
          }
          resolve(json);
          return null;
        });
      });
    });
  },

  sendHawkerAccountTierApplicationOutcome(toName, emailAddress, applicationOutcome, accountTier, periodDate, writtenInstruction) {
    let emailTemplate;

    if (applicationOutcome === Constants.APPROVED) {
      emailTemplate = "hawkerAccountTierApprovalNotification.html";
    } else if (applicationOutcome === Constants.REJECTED) {
      emailTemplate = "hawkerAccountTierRejectionNotification.html";
    }

    const subject = `${applicationOutcome} Hawker Account Tier Changed to ${accountTier}`;

    return this.readHtmlFile(emailTemplate).then(htmlData => {
      const confirmEmail = new SendgridClient.Email({
        to: emailAddress,
        from: Constants.EMAIL_SENDER_ADDRESS,
        fromName: Constants.EMAIL_SENDER_NAME,
        subject: subject,
        html: htmlData
      });

      confirmEmail.setSubstitutions({
        '-applicationStatus-': [applicationOutcome.toLowerCase()],
        '-name-': [toName],
        '-periodDate-': [periodDate],
        '-writtenInstruction-': [writtenInstruction],
        '-accountTier-': [accountTier]
      });

      return new Promise((resolve, reject) => {
        SendgridClient.send(confirmEmail, (err, json) => {
          if (err) {
            return reject(err);
          }
          resolve(json);
          return null;
        });
      });
    });
  },

  sendComplaintReply(emailAddress, report) {
    const emailTemplate = "complaintReply.html";
    const reportNumber = report._id.toString().substring(report._id.toString().length - 5);
    const subject = `Complaint Number ${reportNumber}`;

    return this.readHtmlFile(emailTemplate).then(htmlData => {
      const confirmEmail = new SendgridClient.Email({
        to: emailAddress,
        from: Constants.EMAIL_SENDER_ADDRESS,
        fromName: Constants.EMAIL_SENDER_NAME,
        subject: subject,
        html: htmlData
      });

      const complaintCategory = report.complaintCategory;
      const reportDate = moment(report.reportDate).format("YYYY-MM-DD HH:mm:ss");
      const reportBy = report.user ? report.user.name : report.outlet.outletName;
      const reportStatus = report.reportStatus;
      const orderNumber = report.order ? report.order._id.toString().substring(report.order._id.toString().length - 5) : '-';
      const reportDescription = report.reportDescription;
      const reportReply = report.reportReply;
      const reportReplyDate = moment(report.reportReplyDate).format("YYYY-MM-DD HH:mm:ss");

      confirmEmail.setSubstitutions({
        '-reportNumber-': [reportNumber],
        '-complaintCategory-': [complaintCategory],
        '-reportDate-': [reportDate],
        '-reportBy-': [reportBy],
        '-reportStatus-': [reportStatus],
        '-orderNumber-': [orderNumber],
        '-reportDescription-': [reportDescription],
        '-reportReply-': [reportReply],
        '-reportReplyDate-': [reportReplyDate],
      });

      return new Promise((resolve, reject) => {
        SendgridClient.send(confirmEmail, (err, json) => {
          if (err) {
            return reject(err);
          }
          resolve(json);
          return null;
        });
      });
    });
  },

  sendFeedbackReply(emailAddress, report) {

    const emailTemplate = "feedbackReply.html";
    const reportNumber = report._id.toString().substring(report._id.toString().length - 5);
    const subject = `Feedback Number ${reportNumber}`;

    return this.readHtmlFile(emailTemplate).then(htmlData => {
      const confirmEmail = new SendgridClient.Email({
        to: emailAddress,
        from: Constants.EMAIL_SENDER_ADDRESS,
        fromName: Constants.EMAIL_SENDER_NAME,
        subject: subject,
        html: htmlData
      });

      const reportDate = moment(report.reportDate).format("YYYY-MM-DD HH:mm:ss");
      const reportBy = report.user ? report.user.name : report.outlet.outletName;
      const reportStatus = report.reportStatus;
      const reportDescription = report.reportDescription;
      const reportReply = report.reportReply;
      const reportReplyDate = moment(report.reportReplyDate).format("YYYY-MM-DD HH:mm:ss");

      confirmEmail.setSubstitutions({
        '-reportNumber-': [reportNumber],
        '-reportDate-': [reportDate],
        '-reportBy-': [reportBy],
        '-reportStatus-': [reportStatus],
        '-reportDescription-': [reportDescription],
        '-reportReply-': [reportReply],
        '-reportReplyDate-': [reportReplyDate],
      });

      return new Promise((resolve, reject) => {
        SendgridClient.send(confirmEmail, (err, json) => {
          if (err) {
            return reject(err);
          }
          resolve(json);
          return null;
        });
      });
    });
  },
  sendCustomerAccountRegardingSuspension(toName, emailAddress, applicationOutcome, periodDate, writtenInstruction) {
    let emailTemplate = 'customerAccountSuspensionNotification.html';

    const subject = `${applicationOutcome} Customer Account`;

    return this.readHtmlFile(emailTemplate).then(htmlData => {
      const confirmEmail = new SendgridClient.Email({
        to: emailAddress,
        from: Constants.EMAIL_SENDER_ADDRESS,
        fromName: Constants.EMAIL_SENDER_NAME,
        subject: subject,
        html: htmlData
      });

      confirmEmail.setSubstitutions({
        '-applicationStatus-': [applicationOutcome.toLowerCase()],
        '-name-': [toName],
        '-periodDate-': [periodDate],
        '-writtenInstruction-': [writtenInstruction]
      });

      return new Promise((resolve, reject) => {
        SendgridClient.send(confirmEmail, (err, json) => {
          if (err) {
            return reject(err);
          }
          resolve(json);
          return null;
        });
      });
    });
  }

};
