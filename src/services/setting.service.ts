import { ISetting, IContact } from 'src/interfaces';
import { APIRequest, IResponse } from './api-request';

export class SettingService extends APIRequest {
  all(group = ''): Promise<IResponse<ISetting>> {
    return this.get(this.buildUrl('/settings/public', { group }));
  }

  contact(data: IContact) {
    return this.post('/contact', data);
  }
}

export const settingService = new SettingService();
