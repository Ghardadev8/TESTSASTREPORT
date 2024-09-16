import { Injectable } from "@angular/core";
import { MasterBaseHttpService } from "@app/service/master-base.service";

@Injectable({ providedIn: 'root' })
export class ConfigHierarchyService extends MasterBaseHttpService {
    
    constructor(
    ) {
      super('config-hierarchy-master');
    }

    public ExportConfigHierarchyMaster(type: string, filter?: any, handleError: boolean = true): void {
        this.downloadFile(`config-hierarchy-master/export/${type}`
          + `?SearchQuery=${filter?.SearchQuery ?? ''}`
          , handleError).subscribe((response: any) => {
            this.utility.DownloadFile(response);
          });
      }
    
}
