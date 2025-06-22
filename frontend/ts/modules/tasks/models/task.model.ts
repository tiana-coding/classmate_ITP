export interface Task {
  id: number;
  class: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  documentUrl?: string;
  externalUrl?: string;
  points: number;
}