import { Injectable } from '@angular/core';
import { MasterBaseHttpService } from '@app/service/master-base.service';

@Injectable({
  providedIn: 'root',
})
export class EmailMatrixService extends MasterBaseHttpService {
  constructor() {
    super('email-matrix');
  }
}
