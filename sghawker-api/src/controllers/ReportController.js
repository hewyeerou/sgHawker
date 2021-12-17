import _ from "lodash";
import { ClientError, Constants } from "common";
import { ResponseHelper, SendgridHelper, StringHelper } from "helpers";
import multer from 'multer';
import Report from "../models/Report";

const DEBUG_ENV = "ReportController";

const ReportController = {
    request: {},
};

const storage = multer.diskStorage({
    destination(req, file, cb) {
        let fileLocation = `public/static/upload/complaint`;
        cb(null, fileLocation);
    },
    filename(req, file, cb) {
        cb(null, `${StringHelper.randomAlphabets()}-${file.originalname}`);
    }
});

const upload = multer({
    storage
}).single('file');

ReportController.request.createNewFeedback = function (req, res) {
    const reqError = Report.validate(req.body, {
        reportType: true,
        reportDescription: true
    });

    if (reqError) {
        return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
    }

    return Report
        .createNewReport(req.body)
        .then(
            createdReport => ResponseHelper.success(res, createdReport),
            error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
        );
};

ReportController.request.createNewComplaint = function (req, res) {
    upload(req, res, err => {

        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json({ message: err });
        }

        if (req.body.order) {
            req.body.order = JSON.parse(req.body.order);
        }
        if (req.body.user) {
            req.body.user = JSON.parse(req.body.user);
        }
        if (req.body.outlet) {
            req.body.outlet = JSON.parse(req.body.outlet);
        }

        const report = req.body;
        if (req.file) {
            report.reportImage = req.file.path;
        }

        const reqError = Report.validate(report, {
            reportType: true,
            reportDescription: true
        });

        if (reqError) {
            return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
        }

        return Report
            .createNewReport(report)
            .then(
                createdReport => ResponseHelper.success(res, createdReport),
                error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
            );
    });
};

ReportController.request.findAllReports = function (req, res) {
    return Report
        .findAllReports()
        .then(
            allReports => ResponseHelper.success(res, allReports),
            error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
        );
};

ReportController.request.findAllFeedbacks = function (req, res) {
    return Report
        .findAllFeedbacks()
        .then(
            feedbacks => ResponseHelper.success(res, feedbacks),
            error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
        );
};

ReportController.request.findAllPendingComplaints = function (req, res) {
    return Report
        .findAllPendingComplaints()
        .then(
            pendingReports => ResponseHelper.success(res, pendingReports),
            error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
        );
};

ReportController.request.findAllCompletedComplaints = function (req, res) {
    return Report
        .findAllCompletedComplaints()
        .then(
            completedReports => ResponseHelper.success(res, completedReports),
            error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
        );
};

ReportController.request.findReportsByCustomerId = function (req, res) {
    const { customerId } = req.params;

    return Report
        .findReportsByCustomerId(customerId)
        .then(
            customerReports => ResponseHelper.success(res, customerReports),
            error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
        );
};

ReportController.request.findReportsByOutletId = function (req, res) {
    const { outletId } = req.params;

    return Report
        .findReportsByOutletId(outletId)
        .then(
            outletReports => ResponseHelper.success(res, outletReports),
            error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
        );
};

ReportController.request.findComplaintsByCustomerId = function (req, res) {
    const { customerId } = req.params;

    return Report
        .findComplaintsByCustomerId(customerId)
        .then(
            customerReports => ResponseHelper.success(res, customerReports),
            error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
        );
};

ReportController.request.findComplaintsByOutletId = function (req, res) {
    const { outletId } = req.params;

    return Report
        .findComplaintsByOutletId(outletId)
        .then(
            outletReports => ResponseHelper.success(res, outletReports),
            error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
        );
};

ReportController.request.updateReportDetailsById = function (req, res) {
    const { reportId } = req.params;
    const { report, emails } = req.body;

    if (report.reportStatus === Constants.NEW) {
        return ResponseHelper.error(res, new ClientError(Constants.ERROR_INVALID_REPORT_STATUS), DEBUG_ENV)
    }

    return Report
        .updateReportDetailsById(report, reportId)
        .then(updatedReport => {
            if (emails) {
                for (let email of emails) {
                    if (report.reportType === Constants.FEEDBACK) {
                        SendgridHelper.sendFeedbackReply(email, updatedReport);
                    } else {
                        SendgridHelper.sendComplaintReply(email, updatedReport);
                    }
                }
            }
            return ResponseHelper.success(res, updatedReport);
        })
        .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV))
};

ReportController.request.deleteReportById = function (req, res) {
    const { reportId } = req.params;

    return Report
        .findById(reportId)
        .then(report => {
            if (report.reportType === Constants.COMPLAINT && report.reportStatus !== Constants.NEW) {
                return ResponseHelper.error(res, new ClientError(ERROR_REPORT_UNABLE_TO_DELETE), DEBUG_ENV)
            }
            return Report.deleteReportById(reportId)
        })
        .then(
            deletedReport => ResponseHelper.success(res),
            error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
        );
};

export default ReportController;
