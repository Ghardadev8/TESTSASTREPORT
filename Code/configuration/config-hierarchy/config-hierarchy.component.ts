import {
  Component,
  NgZone,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { SessionService } from '@app/core/service/session.service';
import { UtilityService } from '@app/core/service/utility.service';
import { MasterDataTableComponent } from '@app/shared/components/common/master-data-table/master-data-table.component';
import { MessageType } from '@app/shared/enums/enum';
import { TableConfig } from '@app/shared/model/table-config';
import { SharedModule } from '@app/shared/shared.module';
import { ConfigHierarchyService } from './config-hierarchy.service';

@Component({
  selector: 'app-config-hierarchy',
  standalone: true,
  imports: [SharedModule, MasterDataTableComponent],
  templateUrl: './config-hierarchy.component.html',
  styleUrls: ['./config-hierarchy.component.scss'],
})
export class ConfigHierarchyComponent implements OnInit {
  form: FormGroup;
  tableConfig: any = new TableConfig();
  rows: any[] = [];
  total: number = 0;
  offset: number = 0;

  dataInit = {
    ConfigHierarchyId: 0,
    Id: 0,
    ParentId: null,
    StructureLevelId: 0,
    Description: '',
    HierarchyPath: '',
    IconClass: '',
    HasMultipleParent: false,
    IsOperationLevel: false,
    ConfigHierarchyResource: [],
    IsActive: true,
  };

  paging: any = {};

  search: any = {
    SearchQuery: '',
  };

  private subscriptions: any[] = [];
  configHierarchyList: any[] = [];
  @ViewChild('booleanTemplate') booleanTemplate: TemplateRef<any>;

  disabled: boolean = true;
  currentActiveStatus: boolean;
  title: string = 'ConfigHierarchy';
  constructor(
    private fb: FormBuilder,
    private zone: NgZone,
    private utility: UtilityService,
    private sessionService: SessionService,
    private configHierarchyService: ConfigHierarchyService,
  ) {
    this.utility.setTitle(this.title);
    this.paging = this.utility.DefaultPaging('Id');
    this.paging.Ascending = true;
    this.initForm();
    this.getLists();

    this.disabled = this.sessionService.PagePermission.IsDisabled;
  }

  ngOnInit(): void {
    this.configColumn();
  }

  ngAfterViewInit(): void {
    // Configure columns here if used templates
    this.configColumn();
  }

  ngOnDestroy(): void {
    for (let index = 0; index < this.subscriptions.length; index++) {
      this.subscriptions[index].unsubscribe();
    }
    this.tableConfig = new TableConfig();
    this.rows = [];
    this.subscriptions = [];
  }

  initForm() {
    this.form = this.fb.group({
      ConfigHierarchyId: [0],
      Description: ['', [Validators.required, Validators.maxLength(200)]],
      HierarchyPath: [''],
      IconClass: [''],
      Id: [0],
      StructureLevelId: [0],
      ParentId: [null],
      HasMultipleParent: [false],
      IsOperationLevel: [false],
      ConfigHierarchyResource: [[]],
      IsActive: [true],
    });
    this.resetFormData();
  }

  getLists() {
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.configHierarchyService
        .GetAll(this.paging, this.search)
        .subscribe((response: any) => {
          subscription.unsubscribe();
          this.zone.run(() => {
            this.utility.showLoader = false;
            this.rows = [];
            this.total = 0;
            if (response.MessageType == MessageType.Success) {
              this.rows = response.Result;
              this.total = response.Total;
            }
          });
        });
    });
  }

  resetFormData() {
    this.form.reset();
    this.form.patchValue(JSON.parse(JSON.stringify(this.dataInit)));
  }

  clearForm() {
    this.resetFormData();
  }

  configColumn() {
    this.tableConfig.columns = [
      { id: 1, name: 'Description', prop: 'Description' },
      { id: 2, name: 'HierarchyPath', prop: 'HierarchyPath' },
      { id: 3, name: 'IconClass', prop: 'IconClass' },
      {
        id: 4,
        name: 'HasMultipleParent',
        prop: 'HasMultipleParent',
        cellTemplate: this.booleanTemplate,
      },
      {
        id: 5,
        name: 'IsOperationLevel',
        prop: 'IsOperationLevel',
        cellTemplate: this.booleanTemplate,
      },
    ];
    this.tableConfig.externalSorting = true;
    this.tableConfig.externalPaging = true;
    this.tableConfig.paging = this.paging;
    this.tableConfig.isActionEdit = true;
    this.tableConfig.isActionDelete = true;
    this.tableConfig.isActiveButton = true;
  }

  onChangePage(pageInfo: any) {
    this.offset = pageInfo.offset;
    this.paging.Page = pageInfo.offset + 1;
    this.getLists();
  }

  onChangePageSize(pageSize: number) {
    this.offset = 0;
    this.paging.Page = 1;
    this.getLists();
  }

  onSort(event: any) {
    this.offset = 0;
    this.paging.Page = 1;
    this.tableConfig.paging.Ascending = event.newValue == 'asc' ? true : false;
    this.tableConfig.paging.OrderBy = event.column.prop;
    this.getLists();
  }

  onSearch(data: any) {
    if (data) {
      this.search = {
        SearchQuery: data,
      };
      this.offset = 0;
      this.paging.Page = 1;
    } else {
      this.search = {
        SearchQuery: '',
      };
    }
    this.getLists();
  }

  fileExport(type: string) {
    this.configHierarchyService.ExportConfigHierarchyMaster(type, this.search);
  }

  onClickAction(event: any) {
    switch (event.actionType) {
      case 'edit':
        this.editFormBind(event.Data);
        break;
      case 'isactive':
        this.currentActiveStatus = !event.Data.IsActive;
        this.utility.ConfirmationDialog(
          'Alert',
          event.Data.IsActive
            ? 'AreYouSureYouWantActiveThisRecord'
            : 'AreYouSureYouWantInActiveThisRecord',
          this.toggleState.bind(this),
          event.Data,
        );
        break;
      case 'delete':
        this.utility.ConfirmationDialog(
          'Delete',
          'AreYouSureYouWantDeleteThisRecord',
          this.delete.bind(this),
          event.Data.Id,
        );
        break;
      default:
        break;
    }
  }

  editFormBind(data: any) {
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.configHierarchyService
        .GetById(data.ConfigHierarchyId)
        .subscribe((response: any) => {
          subscription.unsubscribe();
          this.zone.run(() => {
            this.utility.showLoader = false;
            if (response.MessageType == MessageType.Success) {
              this.utility.ScrollbarTop();
              this.form.patchValue(response.Result);
              if (this.disabled) {
                this.form.disable();
              }
              // this.utility.ScrollbarTop();
            }
          });
        });
    });
  }

  active(id: number) {
    // this.utility.showLoader = true;
    // this.zone.runOutsideAngular(() => {
    //   let subscription = this.configHierarchyService.Active(id).subscribe((response: any) => {
    //     subscription.unsubscribe();
    //     this.zone.run(() => {
    //       this.utility.showLoader = false;
    //       this.getLists();
    //       this.utility.DisplayMessage(response.Message, response.MessageType);
    //     });
    //   });
    // });
  }

  inactive(id: number) {
    // this.utility.showLoader = true;
    // this.zone.runOutsideAngular(() => {
    //   let subscription = this.configHierarchyService.InActive(id).subscribe((response: any) => {
    //     subscription.unsubscribe();
    //     this.zone.run(() => {
    //       this.utility.showLoader = false;
    //       this.getLists();
    //       this.utility.DisplayMessage(response.Message, response.MessageType);
    //     });
    //   });
    // });
  }

  toggleState(isConfirmed, data) {
    if (isConfirmed) {
      this.utility.showLoader = true;
      this.zone.runOutsideAngular(() => {
        let subscription = this.configHierarchyService
          .ToggleState(data.Id)
          .subscribe((response: any) => {
            subscription.unsubscribe();
            this.zone.run(() => {
              this.utility.showLoader = false;
              this.getLists();
              this.utility.DisplayMessage(
                response.Message,
                response.MessageType,
              );
            });
          });
      });
    } else {
      data.IsActive = this.currentActiveStatus;
    }
  }


  delete(isConfirmed, id) {
    if (isConfirmed) {
      this.utility.showLoader = true;
      this.zone.runOutsideAngular(() => {
        let subscription = this.configHierarchyService
          .Delete(id)
          .subscribe((response: any) => {
            subscription.unsubscribe();
            this.zone.run(() => {
              this.utility.showLoader = false;
              this.getLists();
              this.utility.DisplayMessage(
                response.Message,
                response.MessageType,
              );
            });
          });
      });
    }
  }

  onSubmit(form: FormGroup) {
    let validForm = true;
    let formData = form.getRawValue();

    if (formData.Description == null || formData.Description == '') {
      this.utility.DisplayMessage('DescriptionIsRequired', MessageType.Warning);
      validForm = false;
      return;
    }

    this.utility.setDefaultLanguageData(
      formData,
      [formData.ConfigHierarchyResource],
      ['Description'],
    );

    this.save(formData);
  }

  save(data: any) {
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.configHierarchyService
        .Save(data)
        .subscribe((response: any) => {
          subscription.unsubscribe();
          this.zone.run(() => {
            this.utility.showLoader = false;
            this.utility.DisplayMessage(response.Message, response.MessageType);
            if (response.MessageType == MessageType.Success) {
              this.getLists();
              this.resetFormData();
            }
          });
        });
    });
  }
}
