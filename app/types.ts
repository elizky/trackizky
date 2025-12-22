export interface Activity {
  id: string;
  label: string;
  category: string;
}

export interface LogEntry {
  date: string;
  activities: string[];
}
