import { Component, NgZone, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppSettingService } from '@app/core/service/app-settings.service';
import { UtilityService } from '@app/core/service/utility.service';
import { MasterDataTableComponent } from '@app/shared/components/common/master-data-table/master-data-table.component';
import { AttachmentTypes, ConfigurationType, MessageType } from '@app/shared/enums/enum';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApplicationConfigService } from '../application-default-configuration/application-default-configuration.service';


@Component({
  selector: 'app-application-configuration',
  standalone: true,
  imports: [
    SharedModule,
    MasterDataTableComponent
  ],
  templateUrl: './application-configuration.component.html',
  styleUrls: ['./application-configuration.component.scss']
})

export class ApplicationConfigurationComponent {

  form: FormGroup;
  logoFileExtensions: string = 'image/*';
  faviconFileExtensions: string = 'image/*, .ico';
  //@Input() expand: boolean = true;

  activeIds: any[] = ['emailConfiguration', 'companyConfiguration', 'collectPlusConfiguration', 'CommonConfiguration', 'scaffoldConfiguration', 'weeklyScaffoldAlertNotificaion'];
  title: string = 'ApplicationConfiguration';

  reportLogo: any;
  applicationLogo: any;
  faviconLogo: any;
  enumConfigType = ConfigurationType;

  @ViewChild('popupEmailDisabledConfirmation') popupEmailDisabledConfirmation: TemplateRef<any>;

  //private subscriptions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private zone: NgZone,
    private modalService: NgbModal,
    private utility: UtilityService,
    public settings: AppSettingService,
    private applicationConfigurationService: ApplicationConfigService
  ) {
    this.utility.setTitle(this.title);
    this.initForm();
    this.getList();
  }

  ngOnInit(): void {
    // let subscription = this.settings.appLogoChange.subscribe(
    //   (appLogo: string) => {
    //     this.applicationLogo = appLogo;
    //   },
    // );
  }


  initForm() {
    this.form = this.fb.group({
      From_Email_Name: [null, [Validators.required]],
      SMTP_Server_Network_Credential_User_Name: [null, [Validators.required]],
      SMTP_Server_Network_Credential_Admin_Email: [null, [Validators.required]],
      SMTP_Is_Email_Password_Required: [false],
      SMTP_Server_Network_Credential_Password: [null],
      SMTP_Server_Host: [null, [Validators.required]],
      SMTP_Server_Port: [null, [Validators.required]],
      SMTP_Enable_SSL: [false],
      Email_Enabled: [true],
      Default_User_Password: [null, [Validators.required]],
      PushNotification_Enabled: [true],
      FCM_Request_Url: [null, [Validators.required]],
      FCM_Json: [null, [Validators.required]],
      Enable_AD_Login: [false],
      MSAL_ClientId: [null, [Validators.required]],
      MSAL_TenantId: [null, [Validators.required]],
      MSAL_Redirect_URI: [null, [Validators.required]],
      CMC: [null, [Validators.required]],
      Enable_Account_Lockout: [false],
      Lock_out_Hour: [null, [Validators.required]],
      No_of_Attempts_Allowed: [null, [Validators.required]],
      Allow_Concurrent_Login: [false],
      Force_Password_Reset: [false],
      Enable_Password_Strength_Policy: [false],
      Accept_Weak_Password: [false],
      Enable_User_Enter_Password: [false],
      Is_Production: [false],
      Environment_Name: [null, [Validators.required]],
      Date_Format: [null, [Validators.required]],
      DateTime_Format: [null, [Validators.required]],
      Time_Format: [null, [Validators.required]],
      Page_Size: [null, [Validators.required]],
      Site_Key: [null, [Validators.required]],
      Enable_Captcha: [false],
      Enable_Request_Limits: [false],
      Request_Limits_Time_Window: [null, [Validators.required]],
      Request_Limits_Max_Requests: [null, [Validators.required]],
      Default_Landing_Page: [null, [Validators.required]],
      Request_Report_New_Tab: [false],
      Financial_Year: [false],
      Enable_Admin_Comment: [true]
    });
  }


  getList() {
    this.zone.runOutsideAngular(() => {
      let subscription = this.applicationConfigurationService.GetApplicationConfigObject().subscribe((response: any) => {
        subscription.unsubscribe();
        this.zone.run(() => {
          if (response.MessageType == MessageType.Success) {
            let data = response.Result;
            if (data != null) {
              this.form.patchValue(data);

              if (data.Logos.ApplicationLogo)
                this.applicationLogo = data.Logos.ApplicationLogo;
              if (data.Logos.ReportLogo)
                this.reportLogo = data.Logos.ReportLogo;
              if (data.Logos.FaviconLogo)
                this.faviconLogo = data.Logos.FaviconLogo;
            }
          }

          if (response.MessageType != MessageType.Success) {
            this.utility.DisplayMessage(response.Message, response.MessageType);
          }
        });
      });
    });
  }

  EmailPasswordChange(isEmailPasswordRequired: boolean) {
    if (!isEmailPasswordRequired) {
      this.form.controls['SMTP_Server_Network_Credential_Password'].setValue('');
    }
  }


  onSubmit(form: FormGroup, type?: ConfigurationType) {
    let validForm = true;
    let formData = form.getRawValue();

    if (type == this.enumConfigType.Email_Configuration) {
      if (!formData.Email_Enabled) {
        const modalRef = this.modalService.open(this.popupEmailDisabledConfirmation, { size: 'm', backdrop: 'static' });
        modalRef.result.then((x) => {
          if (x) {
            this.save(formData, type)
            return;
          } else {
            //this.form.controls['Email_Enabled'].patchValue(true);
            return;
          }
        }, reason => {
          if (reason == 0) {
            this.utility.DisplayMessage('PleaseConfirmYourAction', MessageType.Warning);
            return;
          }
        });
      }

      if (formData.From_Email_Name == null || formData.From_Email_Name == "") {
        this.utility.DisplayMessage("EmailDisplayNameIsRequired", MessageType.Warning);
        validForm = false;
        return;
      }

      if (formData.SMTP_Server_Network_Credential_User_Name == null || formData.SMTP_Server_Network_Credential_User_Name == "") {
        this.utility.DisplayMessage("EmailAddressIsRequired", MessageType.Warning);
        validForm = false;
        return;
      } else if (!(this.utility.ValidateEmail(formData.SMTP_Server_Network_Credential_User_Name))) {
        this.utility.DisplayMessage("EmailIsInvalid", MessageType.Warning);
        validForm = false;
        return;
      }

      if (formData.SMTP_Server_Network_Credential_Admin_Email == null || formData.SMTP_Server_Network_Credential_Admin_Email == "") {
        this.utility.DisplayMessage("AdminEmailIsRequired", MessageType.Warning);
        validForm = false;
        return;
      } else if (!(this.utility.ValidateEmail(formData.SMTP_Server_Network_Credential_Admin_Email))) {
        this.utility.DisplayMessage("AdminEmailIsInvalid", MessageType.Warning);
        validForm = false;
        return;
      }

      if (formData.SMTP_Is_Email_Password_Required && (formData.SMTP_Server_Network_Credential_Password == null || formData.SMTP_Server_Network_Credential_Password == "")) {
        this.utility.DisplayMessage("EmailPasswordIsRequired", MessageType.Warning);
        validForm = false;
        return;
      }

      if (formData.SMTP_Server_Host == null || formData.SMTP_Server_Host == "") {
        this.utility.DisplayMessage("EmailHostIsRequired", MessageType.Warning);
        validForm = false;
        return;
      }

      if (formData.SMTP_Server_Port == null || formData.SMTP_Server_Port == "") {
        this.utility.DisplayMessage("EmailServerPortIsRequired", MessageType.Warning);
        validForm = false;
        return;
      }
    }

    else if (type == this.enumConfigType.AD_Configuration) {
      if (formData.MSAL_ClientId == null || formData.MSAL_ClientId == "") {
        this.utility.DisplayMessage("MSALClientIdIsRequiredMsg", MessageType.Warning);
        validForm = false;
        return;
      }
      if (formData.MSAL_TenantId == null || formData.MSAL_TenantId == "") {
        this.utility.DisplayMessage("MSALTenantIdIsRequiredMsg", MessageType.Warning);
        validForm = false;
        return;
      }
      if (formData.MSAL_Redirect_URI == null || formData.MSAL_Redirect_URI == "") {
        this.utility.DisplayMessage("MSALRedirectURIIsRequiredMsg", MessageType.Warning);
        validForm = false;
        return;
      }
    }

    else if (type == this.enumConfigType.Password_Configuration) {
      if (formData.DefaultUserPassword == null || formData.DefaultUserPassword == "") {
        this.utility.DisplayMessage("DefaultUserPasswordIsRequired", MessageType.Warning);
        validForm = false;
        return;
      }
    }

    else if (type == this.enumConfigType.Company_Master_Configuration) {
      if (formData.CMC == null || formData.CMC == "") {
        this.utility.DisplayMessage("CMCIsRequiredMsg", MessageType.Warning);
        validForm = false;
        return;
      }
    }

    else if (type == this.enumConfigType.User_Login_Configuration) {
      if (formData.Lock_out_Hour == null || formData.Lock_out_Hour == "") {
        this.utility.DisplayMessage("LockoutHourIsRequiredMsg", MessageType.Warning);
        validForm = false;
        return;
      }
      if (formData.No_of_Attempts_Allowed == null || formData.No_of_Attempts_Allowed == "") {
        this.utility.DisplayMessage("NoOfAttemptsAllowedIsRequiredMsg", MessageType.Warning);
        validForm = false;
        return;
      }
    }

    else if (type == this.enumConfigType.Push_Notification_Configuration) {
      if (formData.FCM_Request_Url == null || formData.FCM_Request_Url == "") {
        this.utility.DisplayMessage("FcmRequestUrlIsRequired", MessageType.Warning);
        validForm = false;
        return;
      }
      if (formData.FCM_Json == null || formData.FCM_Json == "") {
        this.utility.DisplayMessage("FcmJsonIsRequired", MessageType.Warning);
        validForm = false;
        return;
      }
    }

    if (validForm) {
      this.save(formData, type)
    }
  }

  save(data: any, type?: ConfigurationType) {
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.applicationConfigurationService.SaveApplicationConfigObject(data, type.toString()).subscribe((response: any) => {
        subscription.unsubscribe();
        this.zone.run(() => {
          this.utility.showLoader = false;
          this.utility.DisplayMessage(response.Message, response.MessageType);
          if (response.MessageType == MessageType.Success) {
            this.getList();
          }
        });
      });
    });
  }

  saveLogo() {
    let data = {
      ApplicationLogo: this.applicationLogo,
      ReportLogo: this.reportLogo,
      FaviconLogo: this.faviconLogo
    };
    this.utility.showLoader = true;
    this.zone.runOutsideAngular(() => {
      let subscription = this.applicationConfigurationService.SaveApplicationLogo(data).subscribe((response: any) => {
        subscription.unsubscribe();
        this.zone.run(() => {
          this.utility.showLoader = false;
          this.utility.DisplayMessage(response.Message, response.MessageType);
          if (response.MessageType == MessageType.Success) {
            this.getList();
          }
        });
      });
    });
  }

  fileUpload(event: any, type) {
    if (event) {
      switch (type) {
        case 'application_logo':
          event.AttachmentTypeId = AttachmentTypes.ApplicationLogo;
          break;
        case 'report_logo':
          event.AttachmentTypeId = AttachmentTypes.ReportLogo;
          break;
        case 'favicon_logo':
          event.AttachmentTypeId = AttachmentTypes.Favicon_Logo;
          break;
        default:
          event.AttachmentTypeId = AttachmentTypes.Temp;
          break;
      }
    }
  }

}
