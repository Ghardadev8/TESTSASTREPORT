import { Injectable } from '@angular/core';
import { MasterBaseHttpService } from '@app/service/master-base.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigLevelService extends MasterBaseHttpService {
  constructor() {
    super('hierarchy');
  }

  public GetConfigLevel(
    structureLevelId: number,
    parentId?: number | string,
    handleError: boolean = true,
  ): Observable<any> {
    return this.get(
      `hierarchy/${this.encryption.EncryptURI(
        structureLevelId.toString(),
      )}/data?IsActive=true${parentId ? `&ParentId=${parentId}` : ''}`,
      handleError,
    );
  }

  public GetConfigLevelById(structureLevelId: number, id: number | string, handleError: boolean = true): Observable<any> {
    return this.get(`hierarchy/${this.encryption.EncryptURI(
      structureLevelId.toString()
      )}/data/${this.encryption.EncryptURI(id.toString())}`, handleError);
}

  public GetConfigLevelWithPaging(
    structureLevelId: number,
    paging: any,
    search: any,
    handleError: boolean = true,
  ): Observable<any> {
    return this.get(
      `hierarchy/${this.encryption.EncryptURI(
        structureLevelId.toString(),
      )}/data` +
      `?Page=${paging.Page}` +
      `&Size=${paging.Size}` +
      `&OrderBy=${paging.OrderBy}` +
      `&Ascending=${paging.Ascending}` +
      `&ApplyPaging=${paging.ApplyPaging}` +
      `&SearchQuery=${search.SearchQuery}` +
      `&SearchField=${search.SearchField}` +
      `&ParentHierarchy=${search.ParentHierarchy ? search.ParentHierarchy : ''
      }`,
      handleError,
    );
  }

  public ExportConfigLevel(
    structureLevelId: number,
    enHiddenLevels: string,
    type: string,
    handleError: boolean = true,
  ): void {
    this.downloadFile(
      `hierarchy/${this.encryption.EncryptURI(
        structureLevelId.toString(),
      )}/data/export/${type}`+
      `?enHiddenLevels=${this.encryption.EncryptURI(enHiddenLevels)}`,
      handleError,
    ).subscribe((response: any) => {
      this.utility.DownloadFile(response);
    });
  }

  public SaveConfigLevel(
    structureLevelId: number,
    configLevel?: number | string,
    handleError: boolean = true,
  ): Observable<any> {
    return this.post(
      `hierarchy/${this.encryption.EncryptURI(
        structureLevelId.toString(),
      )}/data`,
      configLevel,
      handleError,
    );
  }

  public ToggleConfigLevelState(
    structureLevelId: number,
    id: number,
    handleError: boolean = true,
  ): Observable<any> {
    return this.put(
      `hierarchy/${this.encryption.EncryptURI(
        structureLevelId.toString(),
      )}/data/${this.encryption.EncryptURI(id.toString())}/toggle-state`,
      handleError,
    );
  }

  public GetParentList(
    value: any,
    handleError: boolean = true,
  ): Observable<any> {
    return this.get(
      `hierarchy/structure/data/${this.encryption.EncryptURI(
        value.toString(),
      )}/parent-list`,
      handleError,
    );
  }

  public GetMallMapImage(
    id: number,
    handleError: boolean = true,
  ): Observable<any> {
    return this.get(
      `hierarchy/${this.encryption.EncryptURI(id.toString())}/map`,
      handleError,
    );
  }

  public GetHierarchyDataByLevelId(
    id: number,
    structureLevelId: number,
    handleError?: boolean,
  ): Observable<any> {
    return this.get(
      `hierarchy/${this.encryption.EncryptURI(structureLevelId.toString())}/data/${this.encryption.EncryptURI(
        id.toString(),
      )}`,
      handleError,
    );
  }
  public GetConfigLevelByHierarchy(hierarchyFilter: any, handleError: boolean = true): Observable<any> {
    return this.get(`hierarchy/data`
      //+ `?Id=${id}`
      + `?HierarchyId=${hierarchyFilter.HierarchyId ?? null}`
      + `&ParentId=${hierarchyFilter.ParentId ?? ''}`
      , handleError);
  }
}
