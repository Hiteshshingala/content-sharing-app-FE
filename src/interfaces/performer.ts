export interface IBanking {
  firstName?: string;
  lastName?: string;
  SSN?: string;
  bankName?: string;
  bankAccount?: string;
  bankRouting?: string;
  bankSwiftCode?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  performerId?: string;
}

export interface IPerformerStats {
  totalGrossPrice?: number;
  totalCommission?: number;
  totalNetPrice?: number;
}

export interface IBlockCountries {
  performerId?: string;
  countries?: string[];
}

export interface IBlockedByPerformer {
  userId: string;
  description?: string;
}

export interface IPerformer {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  phoneCode?: string;
  avatarPath?: string;
  avatar?: any;
  coverPath?: string;
  cover?: any;
  gender?: string;
  country?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  address?: string;
  languages?: string[];
  studioId?: string;
  categoryIds?: string[];
  timezone?: string;
  noteForUser?: string;
  height?: string;
  weight?: string;
  bio?: string;
  eyes?: string;
  sexualPreference?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  stats?: {
    likes?: number;
    subscribers?: number;
    views?: number;
    totalVideos?: number;
    totalPhotos?: number;
    totalGalleries?: number;
    totalProducts?: number;
  };
  score?: number;
  isPerformer?: boolean;
  bankingInformation?: IBanking;
  blockCountries?: IBlockCountries;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isOnline?: boolean;
  welcomeVideoId?: string;
  welcomeVideoPath?: string;
  activateWelcomeVideo?: boolean
}

export interface IUpdatePerformer {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  phoneCode?: string;
  gender?: string;
  country?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  address?: string;
  languages?: string[];
  studioId?: string;
  categoryIds?: string[];
  timezone?: string;
  noteForUser?: string;
  height?: string;
  weight?: string;
  bio?: string;
  eyes?: string;
  sexualPreference?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  bankingInformation?: IBanking;
  welcomeVideoId?: string;
  welcomeVideoPath?: string;
  activateWelcomeVideo?: boolean
}
