import { Injectable } from '@angular/core';
import { MasterBaseHttpService } from '@app/service/master-base.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApplicationConfigService extends MasterBaseHttpService {
  constructor() {
    super('application-config');
  }

  // public GetApplicationConfig(handleError: boolean = true): Observable<any> {
  //   return this.get(`${this.endpoint}`, handleError);
  // }
  
  // public SaveApplicationConfig(
  //   data: any,
  //   handleError: boolean = true,
  // ): Observable<any> {
  //   return this.post(
  //     `${this.endpoint}/`,
  //     data,
  //     handleError,
  //   );
  // }

  public ExportApplicationConfiguration(type: string, handleError: boolean = true): void {
    this.downloadFile(`application-config/export/${type}`
      , handleError).subscribe((response: any) => {
        this.utility.DownloadFile(response);
      });
  }
  
  public GetApplicationConfigObject(handleError: boolean = true): Observable<any> {
    return this.get(`${this.endpoint}/object`, handleError);
  }

  public SaveApplicationConfigObject(data: any, type: any, handleError: boolean = true): Observable<any> {
    return this.post(`${this.endpoint}/object/${this.encryption.EncryptURI(type)}`, data, handleError);
  }

  public SaveApplicationLogo(data: any, handleError: boolean = true): Observable<any> {
    return this.post(`${this.endpoint}/object/logo`, data, handleError);
  }
}
