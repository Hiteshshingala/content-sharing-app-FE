import { ICountry, ILangguges, IPhoneCodes } from 'src/interfaces';
import { APIRequest, IResponse } from './api-request';

export class UtilsService extends APIRequest {
  countriesList(): Promise<IResponse<ICountry>> {
    return this.get('/countries/list');
  }

  languagesList(): Promise<IResponse<ILangguges>> {
    return this.get('/languages/list');
  }

  phoneCodesList(): Promise<IResponse<IPhoneCodes>> {
    return this.get('/phone-codes/list');
  }
}

export const utilsService = new UtilsService();
