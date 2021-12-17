import { Component, OnInit } from '@angular/core';
import { Report } from 'src/app/models/report';
import { User } from 'src/app/models/user';
import { ReportService } from 'src/app/services/report.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-view-reports',
  templateUrl: './view-reports.page.html',
  styleUrls: ['./view-reports.page.scss'],
})
export class ViewReportsPage implements OnInit {

  user: User;
  allReports: Report[];

  constructor(
    private sessionService: SessionService,
    private reportService: ReportService,
  ) { }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    this.reportService.findComplaintsByCustomerId(this.user._id).subscribe(allReports => {
      this.allReports = allReports;
      this.allReports.sort((firstReport, secondReport) => {
        const firstReportDate = new Date(firstReport.reportDate).getTime();
        const firstReportReplyDate = new Date(firstReport.reportReplyDate).getTime();
        const secondReportDate = new Date(secondReport.reportDate).getTime();
        const secondReportReplyDate = new Date(secondReport.reportReplyDate).getTime();

        if (firstReportReplyDate && secondReportReplyDate) {
          return secondReportReplyDate - firstReportReplyDate;
        } else if (firstReportReplyDate) {
          return secondReportDate - firstReportReplyDate;
        } else if (secondReportReplyDate) {
          return secondReportReplyDate - firstReportDate;
        } else {
          return secondReportDate - firstReportDate;
        }
      });
    })
  }

  updateReportList(event) {
    this.allReports = this.allReports.filter(x => x._id !== event._id);
  }
}
