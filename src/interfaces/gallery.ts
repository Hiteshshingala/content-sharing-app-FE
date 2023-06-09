import { ISearch } from './utils';

export interface IGallery {
  _id?: string;
  name?: string;
  description?: string;
  status?: string;
  token?: number;
  performerId?: string;
  coverPhoto?: { thumbnails?: string[]; url?: string };
}

export interface IGalleryCreate {
  name: string;
  description?: string;
  status: string;
}

export interface IGallerySearch extends ISearch {
  sort: string;
  sortBy: string;
}
