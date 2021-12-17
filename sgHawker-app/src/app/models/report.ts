/* eslint-disable no-underscore-dangle */
import { ComplaintCategoryEnum } from './enums/complaint-category-enum';
import { ReportStatusEnum } from './enums/report-status-enum';
import { ReportTypeEnum } from './enums/report-type-enum';
import { Order } from './order';
import { Outlet } from './outlet';
import { User } from './user';

export class Report {
  _id: string | undefined;
  reportDate: Date | undefined;
  reportType: ReportTypeEnum | undefined;
  complaintCategory: ComplaintCategoryEnum | undefined;
  reportStatus: ReportStatusEnum | undefined;
  reportImage: string | undefined;
  reportDescription: string | undefined;
  reportReply: string | undefined;
  reportReplyDate: Date | undefined;
  user: User | undefined;
  outlet: Outlet | undefined;
  order: Order | undefined;
  emailAttached: boolean | undefined;

  constructor(
    _id?: string,
    reportDate?: Date,
    reportType?: any,
    complaintCategory?: any,
    reportStatus?: any,
    reportImage?: string,
    reportDescription?: string,
    reportReply?: string,
    reportReplyDate?: Date,
    user?: User,
    outlet?: Outlet,
    order?: Order,
    emailAttached?: boolean,
  ) {
    this._id = _id;
    this.reportDate = reportDate;
    this.reportType = reportType;
    this.complaintCategory = complaintCategory;
    this.reportStatus = reportStatus;
    this.reportImage = reportImage;
    this.reportDescription = reportDescription;
    this.reportReply = reportReply;
    this.reportReplyDate = reportReplyDate;
    this.user = user;
    this.outlet = outlet;
    this.order = order;
    this.emailAttached = emailAttached;
  }
}
