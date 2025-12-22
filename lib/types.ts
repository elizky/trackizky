export interface Activity {
  id: string;
  label: string;
  category: string;
}

export interface LogEntry {
  date: string;
  activities: string[];
}

export interface HomeProps {
  activities: Activity[];
  initialLog: LogEntry | null;
}

export interface HistoryProps {
  activities: Activity[];
  logs: LogEntry[];
}
