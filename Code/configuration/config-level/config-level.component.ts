import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { EncryptionService } from '@app/core/service/encryption.service';
import { SessionService } from '@app/core/service/session.service';
import { UtilityService } from '@app/core/service/utility.service';
import { CustomImageCropperComponent } from '@app/shared/components/common/custom-image-cropper/custom-image-cropper.component';
import { MasterDataTableComponent } from '@app/shared/components/common/master-data-table/master-data-table.component';
import { HierarchyLevelComponent } from '@app/shared/components/custom/hierarchy-level/hierarchy-level.component';
import { MessageType } from '@app/shared/enums/enum';
import { TableConfig } from '@app/shared/model/table-config';
import { SharedModule } from '@app/shared/shared.module';
import { ConfigLevelService } from './config-level.service';


@Component({
  selector: 'app-config-level',
  standalone: true,
  imports: [
    SharedModule,
    MasterDataTableComponent,
    CustomImageCropperComponent,
  ],
  templateUrl: './config-level.component.html',
  styleUrls: ['./config-level.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigLevelComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  title: string = '';
  icon: string = '';
  //expand: boolean = false;
  editInProgress: boolean = false;
  //Data Table Initial Start
  tableConfig: any = new TableConfig();
  rows: any[] = [];
  total: number = 0;
  offset: number = 0;

  paging: any = {};

  search: any = {
    SearchQuery: '',
    SearchField: [],
    Hierarchy: {},
    ParentHierarchy: '',
  };
  //Data Table Initial End

  //Model
  defaultData = {
    Id: 0,
    ShortCode: '',
    TimezoneId: null,
    Description: '',
    Hierarchy: {},
    IsActive: true,
    ConfigLevelResource: []
  };

  public hierarchy: any = {};
  public hiddenLevels: any[] = [];
  public hierarchyPath: string[] = [];

  private subscriptions: any[] = [];
  currentActiveStatus: boolean;
  maxLevelId: number = null;

  @ViewChild('hierarchyLevel') hierarchyLevel?: HierarchyLevelComponent;

  //Constructor
  constructor(
    private fb: FormBuilder,
    private configLevelService: ConfigLevelService,
    private route: ActivatedRoute,
    private encryption: EncryptionService,
    private utility: UtilityService,
    public sessionService: SessionService,
    private cdRef: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.paging = this.utility.DefaultPaging();
    this.initForm();
    this.tableConfig.isActiveButton = true;
    this.tableConfig.isActionEdit = true;

    this.route.paramMap.subscribe((params: ParamMap) => {
      let level = params.get('level') as string;
      if (level) {
        level = decodeURIComponent(level);
        this.hierarchy = this.encryption.DecryptObject(level);
        if(this.hierarchy && this.hierarchy.HierarchyPath){
          this.maxLevelId = this.hierarchy.HierarchyPath.split('-').filter(x => x != '').reverse()[1];
        }

        this.setHiddenLevels();
        this.setHierarchyLevels();
      }
    });
  }

  ngOnInit(): void {
    this.getLevels();
    this.configColumns();
  }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    for (let index = 0; index < this.subscriptions.length; index++) {
      this.subscriptions[index].unsubscribe();
    }
    this.tableConfig = new TableConfig();
    this.rows = [];
    this.hierarchyPath = [];
    this.hiddenLevels = [];
    this.subscriptions = [];
    //this.clearVariables();
  }

  setHiddenLevels() {
    let siblings = this.hierarchy.Siblings;
    let skipId = this.hierarchy.Id;

    if (!siblings) {
      this.hierarchy.HierarchyPath.split('-').reverse().forEach(h => {
        if (!siblings) {
          let ph = this.utility.hierarchies.find(x => x.Id == h);
          if (ph && ph.Siblings) {
            siblings = ph.Siblings;
            skipId = ph.Id;
          }
        }
      });
    }
    if (siblings) {
      let hiddenLevels = siblings.split('-').map((s) => parseInt(s)).filter(s => s != skipId);

      hiddenLevels.forEach(l => {
        let hierarchy = this.utility.hierarchies.find(h => h.Id == l);
        if (hierarchy) {
          let hierarchy_child = this.utility.hierarchies.filter(h => h.HierarchyPath.includes(hierarchy.HierarchyPath)).map(x => x.Id);
          hiddenLevels = [...hiddenLevels, ...hierarchy_child];
        }
      });

      this.hiddenLevels = [...new Set(hiddenLevels)]; // get unique
    }
  }


  setHierarchyLevels() {
    this.title = this.hierarchy.Description;
    this.utility.setTitle(this.title);
    this.icon = this.hierarchy.IconClass;
    this.hierarchyPath = this.hierarchy.HierarchyPath.split('-').filter(
      (x: any) => x != '',
    );
  }

  resetFormData() {
    this.editInProgress = true;
    this.form.reset();
    this.form.patchValue(JSON.parse(JSON.stringify(this.defaultData)));
    let t = setTimeout(() => {
      clearTimeout(t);
      this.editInProgress = false;
    }, 100);
  }

  initForm() {
    this.form = this.fb.group({
      Id: [0],
      Hierarchy: [{}],
      Description: [''],
      IsActive: [true],
      ShortCode: [''],
      TimezoneId: [null],
      ConfigLevelResource: [[]]
    });
    this.resetFormData();
  }

  configColumns() {
    this.tableConfig.columns = [
      // { name: 'Description', prop: 'DescriptionRes', frozenLeft: true },
      { id: 1, name: (this.title + ' Name'), prop: 'Description', frozenLeft: true },
    ];

    let hierarchies = this.utility.hierarchies;
    let columns = [];

    for (let index = hierarchies.length - 1; index >= 1; index--) {
      const hierarchy = hierarchies[index];
      if (hierarchy.StructureLevelId < this.hierarchy.StructureLevelId &&
        !this.hiddenLevels.includes(hierarchy.Id)) {
        columns.push({
          name: hierarchy.Description,
          prop: `Level${hierarchy.StructureLevelId}Description`,
          sortable: false
        });
      }
    }
    //columns.reverse();

    for (let index = 0; index < columns.length; index++) {
      let column = columns[index];
      column.id = 2 + index;
      this.tableConfig.columns.push(column);
    }
    this.tableConfig.columns.push({
      id: columns.length + 2,
      name: 'ShortCode',
      prop: 'ShortCode',
      width: 90,
      minWidth: 90,
      maxWidth: 90,
    });

    this.tableConfig.columns.forEach((column: any, index: number) => {
      column.id = index + 1;
    });

    this.tableConfig.externalSorting = true;
    this.tableConfig.externalPaging = true;
    this.tableConfig.frozenRightAction = true;
    this.tableConfig.paging = this.paging;
  }

  getLevels() {
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.configLevelService
        .GetConfigLevelWithPaging(this.hierarchy.Id, this.paging, this.search)
        .subscribe((response: any) => {
          subscription.unsubscribe();
          this.zone.run(() => {
            this.utility.showLoader = false;
            this.rows = [];
            this.total = 0;
            if (response.Result.length > 0) {
              this.rows = this.setLevelObjects(response.Result);
              this.total = response.Total;
            }

            this.cdRef.detectChanges();
          });
        });
    });
  }

  setLevelObjects(rows: any[]) {
    return rows.map((x: any) => {
      let h: any = {};
      for (let index = 0; index < this.hierarchyPath.length; index++) {
        const path = this.hierarchyPath[index];
        x[`Level${path}Description`] = x.SubDescription.split(' > ')[index];
        h[`Level${path}Id`] = parseInt(x.LevelHierarchy.split('-')[index]);
      }
      x['Hierarchy'] = h;
      return x;
    });
  }

  onSubmit(form: FormGroup) {
    this.levelInsertUpdate(form.getRawValue());
  }

  clearForm() {
    this.resetFormData();
  }

  onClickAction(event: any) {
    switch (event.actionType) {
      case 'edit':
        this.editFormBind(event.Data);
        break;
      case 'delete':
        this.deleteLevel(event.Data.ConfigLevelId);
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
      default:
        break;
    }
  }

  editFormBind(data: any) {
    //this.form.patchValue(data);
    // if (data.MallId > 0 && this.hierarchy.StructureLevelId == 4) {
    //   this.mallId = data.MallId;
    //   this.mallLocationMapping = data.MallLocationMapping;
    //   this.GetMallMapImage(data.MallId);
    // } else {
    //   this.resetMallMapConfig();
    // }
    this.editInProgress = true;
    let subscription = this.configLevelService
      //.GetHierarchyDataByLevelId(data.Id, this.hierarchy.StructureLevelId)
       .GetConfigLevelById(this.hierarchy.Id, data.Id)
      .subscribe((response: any) => {
        subscription.unsubscribe();
        this.zone.run(() => {
          this.utility.showLoader = false;
          if (response.MessageType == MessageType.Success) {
            let hierarchyData = response.Result;
            hierarchyData.Hierarchy = data.Hierarchy;
            this.editInProgress = false;
            this.form.patchValue(hierarchyData);
          }
        });
      });
    this.utility.ScrollbarTop();
  }

  levelInsertUpdate(data: any) {
    var dataDTO: any = null;

    if (data.Id > 0) {
      dataDTO = this.rows.find((x: any) => x.Id == data.Id);
      dataDTO.ShortCode = data.ShortCode;
      dataDTO.TimezoneId = data.TimezoneId;
      dataDTO.Description = data.Description;
      dataDTO.IsActive = data.IsActive;
      dataDTO.ConfigLevelResource = data.ConfigLevelResource || [];
    } else {
      dataDTO = {
        ConfigLevelId: 0,
        //ConfigHierarchyId: this.hierarchyId,//ConfigHierarchyId from HierarchyId set in sp
        HierarchyId: this.hierarchy.Id,
        Id: data.Id,
        Description: data.Description,
        SubDescription: '',
        ParentId: 0,
        StructureLevelId: this.hierarchy.StructureLevelId,
        ShortCode: data.ShortCode,
        TimezoneId: null,
        IsActive: data.IsActive,
        ConfigLevelResource: data.ConfigLevelResource
      };
    }

    for (let index = 0; index < this.hierarchyPath.length - 1; index++) {
      const hierarchyId = parseInt(this.hierarchyPath[index]);
      if (index == this.hierarchyPath.length - 2) {
        dataDTO.ParentId = data.Hierarchy[`Level${hierarchyId}Id`];
      }


      if (index > 0 && !this.hiddenLevels.includes(hierarchyId)) {
        if (!data.Hierarchy[`Level${hierarchyId}Id`]) {
          this.utility.DisplayMessageWithParams(
            '_IsRequired',
            { p1: this.utility.hierarchies.find(x => x.Id == hierarchyId).Description },
              MessageType.Warning,
          );
          return;
        }
      }
    }

    // if (!(dataDTO.ParentId > 0)) {
    //   // if (this.hierarchy.StructureLevelId == ConfigHierarchy.ShoppingMall) {
    //   //   dataDTO.ParentId = 1;
    //   // } else if (this.hierarchy.StructureLevelId == ConfigHierarchy.Shop) {
    //   //   dataDTO.ParentId = 2;
    //   // }
    // }

    if (!data.Description) {
      this.utility.DisplayMessageWithParams(
        '_NameIsRequired',
        { p1: this.hierarchy.Description },
          MessageType.Warning,
      );
      return;
    }

    if (!data.ShortCode) {
      this.utility.DisplayMessage(this.utility.translate('ShortCodeIsRequired'),   MessageType.Warning);
      return;
    }
    
    this.utility.setDefaultLanguageData(
      dataDTO,
      [dataDTO.ConfigLevelResource],
      ['Description'],
    );
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.configLevelService
        .SaveConfigLevel(this.hierarchy.Id, dataDTO)
        .subscribe((response: any) => {
          subscription.unsubscribe();
          this.zone.run(() => {
            this.utility.showLoader = false;
            this.utility.DisplayMessage(response.Message, response.MessageType);

            if (response.MessageType == MessageType.Success) {
              this.getLevels();
              this.resetFormData();
              //this.utility.hierarchies_data = [];
              //this.hierarchyLevel.getAllConfigLevels();
              if (response.Result != null) {
                this.updateCacheData(response.Result, null);//Point
              }
            }
          });
        });
    });
  }

  updateCacheData(result: any, deletedId: number | null) {
    var _hierarchies_data = this.utility.hierarchies_data;
    var i = this.utility.hierarchies.findIndex(
      (a) => a.StructureLevelId == this.hierarchy.StructureLevelId,
    );
    if (i >= 0) {
      if (result) {
        var dataIndex = _hierarchies_data[i].findIndex(
          (a: any) => a.Id == result.Id,
        );

        if (dataIndex >= 0) {
          if (result.IsActive == true) {
            _hierarchies_data[i][dataIndex] = result;
          } else {
            _hierarchies_data[i] = _hierarchies_data[i].filter(
              (a: any) => a.Id != result.Id,
            );
          }
        } else if (result.IsActive == true) {
          _hierarchies_data[i].push(result);
        }
      } else if (deletedId && deletedId > 0) {
        _hierarchies_data[i] = _hierarchies_data[i].filter(
          (a: any) => a.Id != deletedId,
        );
      }
    }
    _hierarchies_data[i].sort((a, b) => a.Description.localeCompare(b.Description));
    this.utility.hierarchies_data = _hierarchies_data;
  }

  toggleState(isConfirmed, data) {
    if (isConfirmed) {
      this.utility.showLoader = true;
      this.zone.runOutsideAngular(() => {
        let subscription = this.configLevelService
        .ToggleConfigLevelState(this.hierarchy.Id, data.Id)
          .subscribe((response: any) => {
            subscription.unsubscribe();
            this.zone.run(() => {
              this.utility.showLoader = false;
              this.getLevels();
              this.utility.DisplayMessage(
                response.Message,
                response.MessageType,
              );
              if (response.Result) {
                this.updateCacheData(response.Result, null);
              }
            });
          });
      });
    } else {
      data.IsActive = this.currentActiveStatus;
    }
  }

  deleteLevel(id: any) {
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.configLevelService
        .Delete(id)
        .subscribe((response: any) => {
          subscription.unsubscribe();
          this.zone.run(() => {
            this.utility.showLoader = false;
            this.utility.DisplayMessage(response.Message, response.MessageType);
            if (response.MessageType == MessageType.Success) {
              this.getLevels();
              //this.utility.hierarchies_data = [];
              //this.hierarchyLevel.getAllConfigLevels();
              //this.getAllConfigLevels();

              this.updateCacheData(null, id);
            }
          });
        });
    });
  }

  fileExport(type: string) {
    this.configLevelService.ExportConfigLevel(
      this.hierarchy.StructureLevelId,
      this.hiddenLevels.join(','),
      type,
    );
  }

  onChangePage(pageInfo: any) {
    this.offset = pageInfo.offset;
    this.paging.Page = pageInfo.offset + 1;
    this.getLevels();
  }

  onChangePageSize(page: number) {
    this.offset = page;
    this.paging.Page = page;
    this.getLevels();
  }

  onSort(event: any) {
    this.tableConfig.paging.Ascending = event.newValue == 'asc' ? true : false;
    this.tableConfig.paging.OrderBy = event.column.prop;
    this.getLevels();
  }

  setParentFilter(event: any) {
    this.search.ParentHierarchy = event?.LevelHierarchy || '';
    this.getLevels();
  }

  onSearch(data: any) {
    if (data) {
      this.search.SearchQuery = data;
      this.search.SearchField = ['Description', 'SubDescription', 'ShortCode'];
      this.paging.Page = 1;
      this.offset = 0;
    } else {
      this.search.SearchQuery = '';
      this.search.SearchField = [];
    }
    this.getLevels();
  }

  // OnImgUpload(e: any) {
  //   this.cdRef.detectChanges();
  // }

  // onLevelChange(lvl: any) {
  //   if (lvl && lvl.Hierarchy.id == 2) {
  //     if (lvl.LevelData.value > 0) {
  //       this.GetMallMapImage(lvl.LevelData.value);
  //       this.mallId = lvl.LevelData.value;
  //     } else {
  //       this.resetMallMapConfig();
  //     }
  //   }
  // }

  // GetMallMapImage(mallId: number) {
  //   this.utility.showLoader = true;
  //   this.zone.runOutsideAngular(() => {
  //     let subscription = this.configLevelService
  //       .GetMallMapImage(mallId)
  //       .subscribe((response: any) => {
  //         subscription.unsubscribe();
  //         this.zone.run(() => {
  //           this.utility.showLoader = false;
  //           if (response.Result) {
  //             this.imageMallURL = response.Result?.FileUrl;
  //           } else {
  //             this.imageMallURL = null;
  //           }
  //         });
  //       });
  //   });
  // }

  OnImageCropped(data: any) {
    this.utility.showLoader = false;
    this.form.patchValue({ MapCoordinates: data });
  }
  // getCompanyList() {
  //   this.utility.showLoader = true;
  //   this.zone.runOutsideAngular(() => {
  //     let subscription = this.companyService
  //       .GetAll(null, null, { IsActive: true })
  //       .subscribe((response) => {
  //         subscription.unsubscribe();
  //         this.utility.showLoader = false;
  //         if (response.MessageType == MessageType.Success && response.Result) {
  //           this.companyList = response.Result;
  //         } else {
  //           this.companyList = [];
  //         }
  //       });
  //   });
  // }
  // // Set default crop position after image load
  // OnImageLoaded(data: any) {
  //   if (this.mallLocationMapping) {
  //     this.utility.showLoader = true;
  //     let t = setTimeout(() => {
  //       clearTimeout(t);
  //       //this.setImageMapping(this.mallLocationMapping);
  //       this.utility.showLoader = false;
  //     }, 200);
  //   }
  // }
}
