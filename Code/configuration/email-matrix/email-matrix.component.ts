import { Component, NgZone, TemplateRef, ViewChild } from '@angular/core';
import { SessionService } from '@app/core/service/session.service';
import { UtilityService } from '@app/core/service/utility.service';
import { MessageType } from '@app/shared/enums/enum';
import { SharedModule } from '@app/shared/shared.module';
import { GroupMasterService } from '../../masters/group-master/group-master.service';
import { EmailMatrixService } from './email-matrix.service';

@Component({
  selector: 'app-email-matrix',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './email-matrix.component.html',
  styleUrls: ['./email-matrix.component.scss'],
})
export class EmailMatrixComponent {
  @ViewChild('isRequestorTemplate') isRequestorTemplate = TemplateRef<any>;
  emailMatrixList: any[] = [];
  activeIds: any[] = [];
  groupTypeList: any[] = [];

  private subscriptions: any[] = [];

  constructor(
    public session: SessionService,
    private utility: UtilityService,
    private emailMatrixService: EmailMatrixService,
    private groupService: GroupMasterService,
    private zone: NgZone,
  ) {
    //this.utility.setTitle(this.session.PageContext.Description);
    this.getUserGroups();
    this.getList();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    for (let index = 0; index < this.subscriptions.length; index++) {
      this.subscriptions[index].unsubscribe();
    }
  }
  getUserGroups() {
    this.zone.runOutsideAngular(() => {
      let subscription = this.groupService
        .GetGroupTypes(null, null)
        .subscribe((response: any) => {
          subscription.unsubscribe();
          if (response.MessageType == MessageType.Success) {
            this.zone.run(() => {
              this.groupTypeList = [];
              if (response.Result.length > 0) {
                this.groupTypeList = response.Result;
              }
            });
          } else {
            this.utility.DisplayMessage(response.Message, response.MessageType);
          }
        });
    });
  }
  getList() {
    this.zone.runOutsideAngular(() => {
      let subscription = this.emailMatrixService
        .GetAll()
        .subscribe((response: any) => {
          subscription.unsubscribe();
          this.zone.run(() => {
            if (response.MessageType == MessageType.Success) {
              let data = response.Result;
              if (data != null) {
                this.activeIds = [];
                data = data.map((x: any) => {
                  // x.Matrix = x.Matrix.map((y) => {
                  //   if (y.Id == 41 && y.SendToGroupTypeId) {
                  //     y.SendToGroupTypeId = parseInt(y.SendToGroupTypeId);
                  //   }
                  //   return y;
                  // });
                  let matrix: any[] = x.Matrix;
                  matrix = matrix.map((y) => {
                    //Send To GroupType
                    if (y.SendToGroupTypeId) {
                      y.SendToGroupTypeIds = Array.from(
                        y.SendToGroupTypeId.split(','),
                        Number,
                      );
                    } else y.SendToGroupTypeIds = [];

                    //send to group Type CC
                    if (y.SendToGroupTypeIdCC) {
                      y.SendToGroupTypeIdCCs = Array.from(
                        y.SendToGroupTypeIdCC.split(','),
                        Number,
                      );
                    } else y.SendToGroupTypeIdCCs = [];

                    return y;
                  });
                  x.Matrix = matrix;
                  return x;
                });
                this.emailMatrixList = data;
                // data.forEach((x: any) => {
                //   this.activeIds.push('matrix_' + x.DisplayTabGroupId);
                // });
              }
            }
          });
        });
    });
  }

  onSubmit(matrixList: any[]) {
    let lists: any[] = [];
    matrixList.forEach((x) => {
      lists.push(...x.Matrix.filter((c: any) => c['isEdited'] == true));
    });
    lists.map((x) => {
      x.SendToGroupTypeId = x.SendToGroupTypeIds.toString();
      x.SendToGroupTypeIdCC = x.SendToGroupTypeIdCCs.toString();
      return x;
    });
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.emailMatrixService
        .Save(lists)
        .subscribe((response: any) => {
          subscription.unsubscribe();
          this.zone.run(() => {
            this.utility.showLoader = false;
            if (response.MessageType == MessageType.Success) {
              this.utility.DisplayMessage(
                response.Message,
                response.MessageType,
              );
              this.getList();
            }
          });
        });
    });
  }
}
