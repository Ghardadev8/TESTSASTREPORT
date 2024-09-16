import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UtilityService } from '@app/core/service/utility.service';
import { ConfigurationService } from '@app/service/common/configuration.service';
import { MasterDataTableComponent } from '@app/shared/components/common/master-data-table/master-data-table.component';
import { MessageType } from '@app/shared/enums/enum';
import { TableConfig } from '@app/shared/model/table-config';
import { SharedModule } from '@app/shared/shared.module';

@Component({
  selector: 'app-common-configuration',
  standalone: true,
  imports: [
    SharedModule,
    MasterDataTableComponent
  ],
  templateUrl: './common-configuration.component.html',
  styleUrls: ['./common-configuration.component.scss']
})
export class CommonConfigurationComponent implements OnInit {

  commonConfigFormGroup: any = {
    form: new FormGroup({}),
    controls: [],
    allowSubmitIfInvalid: false,
    // showValidationPopup: true,
    onSubmit: this.onSubmit.bind(this)
  };

  commonTableConfig: any = new TableConfig;
  rows: any[] = [];
  title: string = 'CommonConfiguration';
  constructor(
    private configService: ConfigurationService,
    private utility: UtilityService
  ) {
    this.utility.setTitle(this.title);
    //this.commonTableConfig.isActionEdit = true;
    //this.commonTableConfig.isActionDelete = true;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {

  }

  initForm() {
    this.configForm();
    this.configColumn();
    this.getClientConfiguration();
  }

  configForm() {
    this.commonConfigFormGroup.controls = [
      {
        name: 'Id',
        type: 'hidden',
        value: 0
      },
      {
        name: 'EmailDisplayName',
        type: 'text',
        label: 'Email Display Name',
        columnClass: 'col-md-3',
        placeholder: 'Name',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'EmailId',
        type: 'text',
        label: 'EmailId',
        columnClass: 'col-md-3',
        placeholder: 'Email',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'IsEmailPasswordRequired',
        type: 'checkbox',
        label: 'Is EmailPassword Required',
        value: false,
        columnClass: 'col-md-3',
        //controlClass: 'form-check form-check-inline',
      },
      {
        name: 'EmailPassword',
        type: 'text',
        label: 'Email Password',
        columnClass: 'col-md-3',
        placeholder: 'Password',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'EmailServerPort',
        type: 'number',
        label: 'Email Server Port',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'EmailIsEnabledSSL',
        type: 'checkbox',
        label: 'Email Is Enabled SSL',
        value: false,
        columnClass: 'col-md-3',
        //controlClass: 'form-check form-check-inline',
      },
      {
        name: 'ApplicationPath',
        type: 'text',
        label: 'Application Path',
        columnClass: 'col-md-3',
        placeholder: 'Path',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'FcmAppId',
        type: 'text',
        label: 'Fcm AppId',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'FcmSenderId',
        type: 'text',
        label: 'Fcm SenderId',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'FcmRequestUrl',
        type: 'text',
        label: 'Fcm Request Url',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'LDAPPassword',
        type: 'text',
        label: 'LDAP Password',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'LDAPPath',
        type: 'text',
        label: 'LDAP Path',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'LDAPUserName',
        type: 'text',
        label: 'LDAP UserName',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'SMSUrl',
        type: 'text',
        label: 'SMS Url',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'UNCDomain',
        type: 'text',
        label: 'UNC Domain',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'UNCPassword',
        type: 'text',
        label: 'UNC Password',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'UNCPath',
        type: 'text',
        label: 'UNC Path',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },
      {
        name: 'UNCUserName',
        type: 'text',
        label: 'UNC UserName',
        columnClass: 'col-md-3',
        controlClass: 'form-control',
        validators: { required: true }
      },

      {
        label: "Submit",
        type: "button",
        buttonType: "submit",
        controlClass: "btn btn-info",
        columnClass: "col-md-12 text-left"
      }
    ];
  }

  configColumn() {

    this.commonTableConfig.columns = [
      { id: 1, name: 'Email Display Name', prop: 'EmailDisplayName', forzenLeft: true },
      { id: 2, name: 'Email', prop: 'EmailId' },
    ];
  }

  getClientConfiguration() {
    this.configService.GetClientConfiguration().subscribe((response: any) => {
      if (response.Result) {
        this.rows = [];
        this.rows.push(response.Result);
      }
    });
  }

  onSubmit() {
    this.saveClientConfiguration(this.commonConfigFormGroup.value);
  }

  onClickAction(event: any) {
    switch (event.actionType) {
      case 'edit':
        this.editFormBind(event.Data);
        break;
      // case 'delete':
      //   this.deleteEquipment(event.Data.EquipmentId)
      default:
        break;
    }
  }

  editFormBind(data: any) {
    this.commonConfigFormGroup.form?.patchValue(data);
  }

  saveClientConfiguration(data: any) {
    this.configService.SaveClientConfiguration(data).subscribe((response: any) => {
      if (response.MessageType == MessageType.Success) {
        this.commonConfigFormGroup.form?.reset();

        this.getClientConfiguration();
      }
      this.utility.DisplayMessage(response.Message, response.MessageType);
    });
  }





}
