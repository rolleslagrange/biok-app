export type AppMode = 'planes' | 'comer';

export enum Author {
  SERGIO = 'Sergio',
  NEREA = 'Nerea'
}

export enum PlanLocation {
  HOME = 'home',
  CITY = 'city',
  NATURE = 'nature'
}

export enum PlanDuration {
  SHORT = 'short', // <2h
  HALF_DAY = 'half_day',
  FULL_DAY = 'full_day'
}

export enum PriceRange {
  LOW = 'low',   // €
  MID = 'mid',   // €€
  HIGH = 'high'  // €€€
}

export enum MealType {
  LUNCH = 'lunch',
  DINNER = 'dinner',
  BAR = 'bar'
}

export interface LinkItem {
  url: string;
  label: string;
}

export interface BaseItem {
  id: string;
  title: string;
  createdBy: Author;
  notes?: string;
  links?: LinkItem[];
  time_las_carreras: number; // minutes
  time_portu: number; // minutes
  car_needed: boolean;
  isFavorite: boolean;
  isDone: boolean;
  isActive?: boolean; // New field for "In Progress" / "Reserved"
  completedAt?: number; // Timestamp
  createdAt: number; // Timestamp
}

export interface PlanItem extends BaseItem {
  type: 'plan';
  price: number; // Exact price per person
  location: PlanLocation;
  duration: PlanDuration;
}

export interface ComerItem extends BaseItem {
  type: 'comer';
  price_range: PriceRange;
  meal_type: MealType[];
}

export type Item = PlanItem | ComerItem;