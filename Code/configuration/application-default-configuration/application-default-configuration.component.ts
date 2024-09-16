import {
  Component,
  Input,
  NgZone
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionService } from '@app/core/service/session.service';
import { UtilityService } from '@app/core/service/utility.service';
import { MessageType } from '@app/shared/enums/enum';
import { SharedModule } from '@app/shared/shared.module';
import { ConfigTypeService } from '../../masters/config-type/config-type.service';
import { ApplicationConfigService } from '../application-default-configuration/application-default-configuration.service';

@Component({
  selector: 'app-application-default-configuration',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './application-default-configuration.component.html',
  styleUrls: ['./application-default-configuration.component.scss'],
})
export class ApplicationDefaultConfigurationComponent {
  @Input() expand: boolean = true;

  form: FormGroup = new FormGroup({});
  listConfigType: any[] = [];
  lstApplicationConfig: any[] = [];

  dataInit = {
    Id: 0,
    ShortCode: '',
    Description: '',
    ConfigTypeId: null,
    ConfigValue: '',
    ConfigValueUnit: '',
    ControlUse: '',
    IsCommon: false,
    IsActive: true
  };

  disabled: boolean = true;
  title: string = 'ApplicationDefaultConfiguration';

  constructor(
    private fb: FormBuilder,
    private utility: UtilityService,
    private applicationConfigurationService: ApplicationConfigService,
    private configTypeService: ConfigTypeService,
    private zone: NgZone,
    private sessionService: SessionService
  ) {
    this.utility.setTitle(this.title);
    this.initForm();
    this.getDropDownData();
    this.getLists();
  }

  ngOnInit(): void {
    this.disabled = this.sessionService.PagePermission.IsDisabled;
  }

  ngOnDestroy(): void {

  }

  filterAppConfigTypwWise(lstApplicationConfig: any[], Id: number) {
    return lstApplicationConfig.filter(x => x.ConfigTypeId == Id);
  }

  initForm() {
    this.form = this.fb.group({
      Id: [0],
      ConfigTypeId: [null],
      ShortCode: ['', [Validators.required, Validators.maxLength(50)]],
      Description: ['', [Validators.required, Validators.maxLength(200)]],
      ConfigValue: [null, [Validators.required, Validators.maxLength(50)]],
      ConfigValueUnit: [null, [Validators.maxLength(50)]],
      ControlUse: [null, [Validators.maxLength(50)]],
      IsCommon: [false],
      IsActive: [true]
    });
  }

  getLists() {
    this.zone.runOutsideAngular(() => {
      let subscription = this.applicationConfigurationService.GetAll().subscribe((response: any) => {
        subscription.unsubscribe();
        this.zone.run(() => {
          if (response.MessageType == MessageType.Success) {
            this.lstApplicationConfig = response.Result;
          }
        });
      });
    });
  }

  getDropDownData() {
    this.getConfigTypeList();
  }

  getConfigTypeList() {
    this.zone.runOutsideAngular(() => {
      let subscription = this.configTypeService.GetAll().subscribe((response: any) => {
        subscription.unsubscribe();
        this.zone.run(() => {
          if (response.MessageType == MessageType.Success) {
            this.listConfigType = response.Result;
          }
        });
      });
    });
  }

  editApplicationConfig(applicationConfig: any) {
    this.form.patchValue(applicationConfig);
    // this.utility.ScrollbarTop();
  }

  deleteApplicationConfig(id: number) {
    let subscription = this.utility.DisplayConfirmationMessage(
      'AreYouSureYouWantDeleteThisRecord'
      , 'YesDeleteIt'
      , 'No'
    )
      // .subscribe((isConfirmed: boolean) => {
      //   subscription.unsubscribe();
      //   if (isConfirmed) {
      //     this.utility.showLoader = true;
      //     this.zone.runOutsideAngular(() => {
      //       let subscription = this.applicationConfigurationService.Delete(id).subscribe((response: any) => {
      //         subscription.unsubscribe();
      //         this.zone.run(() => {
      //           this.utility.showLoader = false;
      //           this.getLists();
      //           this.utility.DisplayMessage(response.Message, response.MessageType);
      //         });
      //       });
      //     });
      //   }
      // });
  }
  fileExport(type: string) {
    this.applicationConfigurationService.ExportApplicationConfiguration(type);
  }

  resetFormData() {
    this.form.reset();
    this.form.patchValue(this.dataInit)
  }

  clearForm() {
    this.resetFormData();
  }
  onSubmit(form: FormGroup) {
    let validForm = true;
    let formData = form.getRawValue();

    if (formData.ConfigTypeId == null || formData.ConfigTypeId == 0) {
      this.utility.DisplayMessage("ConfigTypeIsRequired", MessageType.Warning);
      validForm = false;
      return;
    }
    if (formData.ShortCode == null || formData.ShortCode == "") {
      this.utility.DisplayMessage("ConfigCodeIsRequired", MessageType.Warning);
      validForm = false;
      return;
    }
    if (formData.Description == null || formData.Description == "") {
      this.utility.DisplayMessage("ConfigDesignationIsRequired", MessageType.Warning);
      validForm = false;
      return;
    }
    if (formData.ConfigValue == null || formData.ConfigValue == "") {
      this.utility.DisplayMessage("ConfigValueIsRequired", MessageType.Warning);
      validForm = false;
      return;
    }
    this.save(formData)
  }

  save(data: any) {
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.applicationConfigurationService.Save(data).subscribe((response: any) => {
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
