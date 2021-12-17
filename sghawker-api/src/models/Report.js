import mongoose, { Schema } from "mongoose";
import { Constants } from "common";
import * as _ from "lodash";
const Outlet = require("./Outlet");
const User = require("./User");

const Report = new Schema({
  reportDate: {
    type: Date,
    required: true
  },
  reportType: {
    type: String,
    required: true,
    enum: [
      Constants.FEEDBACK,
      Constants.COMPLAINT
    ],
  },
  complaintCategory: {
    type: String,
    enum: [
      Constants.POOR_ARRIVED_FOOD_CONDITION,
      Constants.INCORRECT_FOOD_PREPARATION,
      Constants.MISSING_ORDER_ITEM,
      Constants.WRONG_ORDER,
      Constants.MISSING_ORDER,
      Constants.SAFETY,
      Constants.LONG_DELIVERY,
      Constants.MISSING_DELIVERY,
      Constants.INCORRECT_OUTLET_INFO,
      Constants.POOR_SERVICE,
      Constants.INCORRECT_PAYMENT,
      Constants.INCORRECT_CASHBACK,
      Constants.OTHERS
    ],
  },
  reportStatus: {
    type: String,
    required: true,
    enum: [
      Constants.IN_PROGRESS,
      Constants.RESOLVED,
      Constants.REFUNDED,
      Constants.OVERDUE,
      Constants.EMAIL,
      Constants.NEW
    ],
  },
  emailAttached: {
    type: Boolean,
    default: false
  },
  reportImage: {
    type: String
  },
  reportDescription: {
    type: String,
    required: true
  },
  reportReply: {
    type: String,
  },
  reportReplyDate: {
    type: Date
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  outlet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Outlet",
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  }
});

Report.statics.validate = function (report, fields) {
  if (fields.reportType) {
    if (!report.reportType) {
      return Constants.ERROR_REPORT_TYPE_REQUIRED;
    }
  }
  if (fields.reportDescription) {
    if (!report.reportDescription) {
      return Constants.ERROR_REPORT_DESCRIPTION_REQUIRED;
    }
  }
  if (fields.reportStatus) {
    if (!report.reportStatus) {
      return Constants.ERROR_REPORT_STATUS_REQUIRED;
    }
  }
  return null;
};

Report.statics.createNewReport = function (report) {
  const newReport = {
    ...report,
    reportDate: Date.now(),
    reportStatus: Constants.NEW
  };

  if (newReport.user) {
    newReport.user = mongoose.Types.ObjectId(report.user._id);
  } else {
    newReport.outlet = mongoose.Types.ObjectId(report.outlet._id);
  }

  if (newReport.order) {
    newReport.order = mongoose.Types.ObjectId(report.order._id);
  }

  return this
    .create(newReport)
    .then(createdReport => {

      const update = {
        $push: {
          reports: mongoose.Types.ObjectId(createdReport._id)
        }
      }

      const options = {
        new: true
      }

      if (createdReport.user) {
        User
          .findByIdAndUpdate(report.user._id, update, options)
          .exec();
      } else {
        Outlet
          .findByIdAndUpdate(report.outlet._id, update, options)
          .exec()
      }

      return createdReport;
    });
};

Report.statics.findAllReports = function () {
  return this
    .find()
    .populate("user")
    .populate("outlet")
    .populate("outlet.hawkerAccount")
    .populate("order")
    .exec()
};

Report.statics.findAllFeedbacks = function () {
  const filter = {
    reportType: Constants.FEEDBACK
  };

  return this
    .find(filter)
    .populate("user")
    .populate("outlet")
    .populate("outlet.hawkerAccount")
    .populate("order")
    .exec()
};

Report.statics.findAllPendingComplaints = function () {
  const filter = {
    reportType: Constants.COMPLAINT,
    reportStatus: {
      $in: [Constants.NEW, Constants.OVERDUE, Constants.IN_PROGRESS],
    },
  };

  return this
    .find(filter)
    .populate("user")
    .populate("outlet")
    .populate("outlet.hawkerAccount")
    .populate("order")
    .exec();
};

Report.statics.findAllCompletedComplaints = function () {
  const filter = {
    reportType: Constants.COMPLAINT,
    reportStatus: {
      $in: [Constants.RESOLVED, Constants.REFUNDED, Constants.EMAIL],
    },
  };

  return this
    .find(filter)
    .populate("user")
    .populate("outlet")
    .populate("outlet.hawkerAccount")
    .populate("order")
    .exec();
};

Report.statics.findReportsByCustomerId = function (customerId) {
  const filter = {
    user: mongoose.Types.ObjectId(customerId)
  }

  return this
    .find(filter)
    .populate("user")
    .populate("outlet")
    .populate("outlet.hawkerAccount")
    .populate("order")
    .exec();
};

Report.statics.findReportsByOutletId = function (outletId) {
  const filter = {
    outlet: mongoose.Types.ObjectId(outletId)
  }

  return this
    .find(filter)
    .populate("user")
    .populate("outlet")
    .populate("outlet.hawkerAccount")
    .populate("order")
    .exec();
};

Report.statics.findComplaintsByCustomerId = function (customerId) {
  const filter = {
    user: mongoose.Types.ObjectId(customerId),
    reportType: Constants.COMPLAINT
  }

  return this
    .find(filter)
    .populate("user")
    .populate("outlet")
    .populate("outlet.hawkerAccount")
    .populate("order")
    .exec();
};

Report.statics.findComplaintsByOutletId = function (outletId) {
  const filter = {
    outlet: mongoose.Types.ObjectId(outletId),
    reportType: Constants.COMPLAINT
  }

  return this
    .find(filter)
    .populate("user")
    .populate("outlet")
    .populate("outlet.hawkerAccount")
    .populate("order")
    .exec();
};

Report.statics.updateReportDetailsById = function (reportToUpdate, reportId) {
  if (reportToUpdate.reportStatus === Constants.RESOLVED
    || reportToUpdate.reportStatus === Constants.REFUNDED
    || reportToUpdate.reportStatus === Constants.EMAIL
    || reportToUpdate.reportReply
  ) {
    reportToUpdate.reportReplyDate = Date.now();
  }

  const update = {
    $set: {
      ...reportToUpdate
    }
  };

  const options = {
    new: true
  }

  return this
    .findByIdAndUpdate(reportId, update, options)
    .populate("user")
    .populate("outlet")
    .populate("outlet.hawkerAccount")
    .populate("order")
    .exec();
};

Report.statics.deleteReportById = function (reportId) {
  return this
    .findOneAndDelete(reportId)
    .then(deletedReport => {
      const update = {
        $pull: {
          reports: deletedReport._id
        }
      };

      const options = {
        new: true
      };

      if (deletedReport.user) {
        User
          .findByIdAndUpdate(deletedReport.user.toString(), update, options)
          .exec();
      } else {
        Outlet
          .findByIdAndUpdate(deletedReport.outlet.toString(), update, options)
          .exec()
      }

      return deletedReport;
    })
}

export default mongoose.model("Report", Report, "Report");