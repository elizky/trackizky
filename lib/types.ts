export interface DailyLog {
  date: string;
  noAlcohol: boolean;
  food: boolean;
  water: boolean;
  noScreens: boolean;
  noDelivery: boolean;
  noVice: boolean;
  exTennis: boolean;
  exFootball: boolean;
  exWalk: boolean;
  exGym: boolean;
  artWrite: boolean;
  artDraw: boolean;
  artRead: boolean;
  artMusic: boolean;
  weight: number | null;
  sleepHours: number | null;
  energy: number | null;
  mood: number | null;
}

export function emptyLog(date: string): DailyLog {
  return {
    date,
    noAlcohol: false,
    food: false,
    water: false,
    noScreens: false,
    noDelivery: false,
    noVice: false,
    exTennis: false,
    exFootball: false,
    exWalk: false,
    exGym: false,
    artWrite: false,
    artDraw: false,
    artRead: false,
    artMusic: false,
    weight: null,
    sleepHours: null,
    energy: null,
    mood: null,
  };
}
