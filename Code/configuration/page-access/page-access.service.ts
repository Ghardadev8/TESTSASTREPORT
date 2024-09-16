import { Injectable } from '@angular/core';
import { BaseHttpService } from '@app/service/base-http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageAccessService extends BaseHttpService {

  // public getPageContext(
  //   pageCode: string,
  //   handleError: boolean = true,
  // ): Observable<any> {
  //   return this.get(`page-access/${pageCode}/page-context`, handleError);
  // }
  public getPageAccessList(roleId: number, handleError: boolean = true): Observable<any> {
    return this.get(`page-access/${this.encryption.EncryptURI(roleId.toString())}`, handleError);
  }

  public getPageConfigurationById(id: number, handleError: boolean = true): Observable<any> {
    return this.get(`page-access/${this.encryption.EncryptURI(id.toString())}/configuration`, handleError);
  }

  public savePageAccessDetail(handleError: boolean = true): Observable<any> {
    return this.post(`page-access`, handleError);
  }
}
