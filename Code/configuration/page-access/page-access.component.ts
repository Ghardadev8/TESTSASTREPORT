import { Component, NgZone } from '@angular/core';
import { SessionService } from '@app/core/service/session.service';
import { UtilityService } from '@app/core/service/utility.service';
import { MasterDataTableComponent } from '@app/shared/components/common/master-data-table/master-data-table.component';
import { MessageType } from '@app/shared/enums/enum';
import { SharedModule } from '@app/shared/shared.module';
import { forkJoin } from 'rxjs';
import { GroupMasterService } from '../../masters/group-master/group-master.service';
import { ModulePageMasterService } from '../../masters/module-page-master/module-page-master.service';
import { PageAccessService } from './page-access.service';



@Component({
  selector: 'app-page-access',
  standalone: true,
  imports: [
    SharedModule,
    MasterDataTableComponent
  ],
  templateUrl: './page-access.component.html',
  styleUrls: ['./page-access.component.scss']
})
export class PageAccessComponent {

  pages: any[] = [];
  roles: any[] = [];
  access: any[] = [];
  roleId: number;
  disabled: boolean = true;
  title: string = 'PageAccess';
  activeIds: any[] = [];
  isOldPage: boolean = false;

  constructor(
    private zone: NgZone,
    private utility: UtilityService,
    private groupService: GroupMasterService,
    private modulePageService: ModulePageMasterService,
    private pageAccessService: PageAccessService,
    private sessionService: SessionService
  ) {
    this.utility.setTitle(this.title);
  }

  ngOnInit(): void {
    this.GetData();
    this.disabled = this.sessionService.PagePermission.IsDisabled;
  }

  ngOnDestroy(): void {
    this.pages = [];
    this.roles = [];
    this.access = [];
    this.activeIds = [];
  }

  getPageAccess() {
    this.access = [];
    if (this.roleId > 0) {
      let services = [
        this.pageAccessService.getPageAccessList(this.roleId),
      ];
      this.utility.showLoader = true;
      this.zone.runOutsideAngular(() => {
        let subscription = forkJoin(services).subscribe(([
          pageAccessResponse,
        ]) => {
          subscription.unsubscribe();
          this.zone.run(() => {
            this.utility.showLoader = false;
            if (pageAccessResponse.MessageType == MessageType.Success) {
              this.access = pageAccessResponse.Result;
              this.pages.forEach(r => {
                r.CanRead = this.access.length > 0 && this.access.find(a => a.PageId == r.Id && a.CanRead) ? true : false;
                r.CanWrite = this.access.length > 0 && this.access.find(a => a.PageId == r.Id && a.CanWrite) ? true : false;
                r.readAll = this.access.length > 0 && this.access.find(a => a.PageId == r.Id && a.CanRead)  ?true:false;
                r.writeAll = this.access.length > 0 && this.access.find(a => a.PageId == r.Id && a.CanWrite) ?true:false;
              });
            }
          });
        });
      });
    }
  }

  GetData() {
    this.pages = [];
    this.roles = [];
    this.access = [];
    let services = [
      this.groupService.GetGroupTypes(null, null),
      this.modulePageService.GetAll(null, null, { IsActive: true })
    ];
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = forkJoin(services).subscribe(([
        groupsResponse,
        modulePageResponse,
      ]) => {
        subscription.unsubscribe();
        this.zone.run(() => {
          this.utility.showLoader = false;
          if (groupsResponse.MessageType == MessageType.Success) {
            this.roles = groupsResponse.Result.filter(x => x.Description !== 'System Administrator');
          }
          if (modulePageResponse.MessageType == MessageType.Success) {
            this.pages = modulePageResponse.Result;
          }
        });
      });
    });
  }

  saveData() {
    var pageAccessData = [];
    if (this.roleId) {
      this.pages.forEach(r => {
        if (r.CanRead == true || r.CanWrite == true) {
          let data = {
            Id: 0,
            GroupTypeId: this.roleId,
            PageId: r.Id,
            CanRead: r.CanRead ?? false,
            CanWrite: r.CanWrite ?? false,
            IsActive: true,
            ParentId: r.ParentId
          };
          pageAccessData.push(data);
        }
        if (!pageAccessData.find(x => x.PageId == r.Id) && this.pages.find(x => x.ParentId == r.Id && r.ParentId == null && (x.CanRead == true || x.CanWrite == true))) {
          let data = {
            Id: 0,
            GroupTypeId: this.roleId,
            PageId: r.Id,
            CanRead: true,
            CanWrite: true,
            IsActive: true,
            ParentId: null
          };
          pageAccessData.push(data);
        }
      });     
      this.save(pageAccessData);
    }
  }

reset(){
  this.roleId = null;
  this.GetData();
}

  save(data: any) {
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.pageAccessService.savePageAccessDetail(data).subscribe((response: any) => {
        subscription.unsubscribe();
        this.zone.run(() => {
          this.utility.showLoader = false;
          this.utility.DisplayMessage(response.Message, response.MessageType);
          if (response.MessageType == MessageType.Success) {
            this.roleId = null;
            this.GetData();
            this.getPageAccess();
          }
        });
      });
    });
  }
  parentFilter(page: any) {
    return page.ParentId == null;
  }
  roleWisePageFilter(page: any, parameter: any[]) {
    return page.filter(x => x.MainParentId == parameter[0].Id);
  }
  getData(data: any) {
    return this.pages.filter(x => x.MainParentId == data.Id);
  }
  checkAll(CanRead: boolean, page: any) {
    if (CanRead)
      return this.pages.filter(x => x.MainParentId == page.Id).forEach(x => x.CanRead = page.readAll);
    else
      return this.pages.filter(x => x.MainParentId == page.Id).forEach(x => x.CanWrite = page.writeAll);
  }

  checkAllChildReadAccess(CanRead: boolean, page: any) {
    if (CanRead){
        var totalPages = this.pages.filter(x => x.MainParentId == page.Id);
        var totalReadPages = this.pages.filter(x => x.MainParentId == page.Id && x.CanRead == true);
        if(totalPages.length == totalReadPages.length){
          page.readAll = true;
        }
        else{
          page.readAll = false;
        }
    }
  }

  checkAllChildWriteAccess(CanWrite: boolean, page: any) {
    if (CanWrite){
        var totalPages = this.pages.filter(x => x.MainParentId == page.Id);
        var totalWritePages = this.pages.filter(x => x.MainParentId == page.Id && x.CanWrite == true);
        if(totalPages.length == totalWritePages.length){
          page.writeAll = true;
        }
        else{
          page.writeAll = false;
        }
    }
  }

  toggleAccordion(pageId) {
    this.activeIds = [];
    let activePanel = 'panelId-' + pageId;
    this.activeIds.push(activePanel);
  }
}
