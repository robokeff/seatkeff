
export type GuestCategory = string;

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  category: GuestCategory;
  adults: number;
  children: number;
  tableId: string | null;
  confirmed: boolean;
  color?: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  name?: string;
  position?: { x: number; y: number };
}

export interface EventData {
  id: string;
  name: string;
  date: string;
  venue: string;
  address?: string;
  imageUrl?: string;
  guests: Guest[];
  tables: Table[];
  categories: string[];
  whatsappTemplate?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface CustomApiConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface UserAccount {
  username: string;
  password?: string;
  events: EventData[];
  isAdmin?: boolean;
  cloudConfig?: FirebaseConfig;
  apiConfig?: CustomApiConfig;
}

export interface AppState {
  currentUser: string | null; // username
  currentEventId: string | null;
  showWelcome: boolean;
  isCloudEnabled?: boolean;
  isApiEnabled?: boolean;
  lastUpdated?: string; // ISO string of last sync
}
