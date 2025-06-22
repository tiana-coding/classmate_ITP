import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private staticUrl = 'assets/tasks/tasks.json';
  private dataKey = 'tasksData';

  constructor(private http: HttpClient) {}

  private initData(): Observable<Task[]> {
    const raw = localStorage.getItem(this.dataKey);
    if (raw) {
      return of(JSON.parse(raw) as Task[]);
    }
    return this.http.get<Task[]>(this.staticUrl).pipe(
      map(tasks => {
        localStorage.setItem(this.dataKey, JSON.stringify(tasks));
        return tasks;
      }),
      catchError(() => of([]))
    );
  }

  getTasksByClass(cls: string): Observable<Task[]> {
    return this.initData().pipe(
      map(tasks => tasks.filter(t => t.class === cls))
    );
  }

  toggleCompleted(task: Task): Observable<Task> {
    return this.initData().pipe(
      map(tasks => {
        const idx = tasks.findIndex(t => t.id === task.id);
        if (idx !== -1) {
          tasks[idx].completed = !tasks[idx].completed;
          this.saveData(tasks);
        }
        return tasks[idx];
      })
    );
  }

  removeTask(id: number): Observable<void> {
    return this.initData().pipe(
      map(tasks => {
        const filtered = tasks.filter(t => t.id !== id);
        this.saveData(filtered);
      })
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.initData().pipe(
      map(tasks => {
        const idx = tasks.findIndex(t => t.id === task.id);
        if (idx !== -1) {
          tasks[idx] = { ...task };
          this.saveData(tasks);
        }
        return tasks[idx];
      })
    );
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.initData().pipe(
      map(tasks => {
        const newTask: Task = {
          id: Date.now(),
          class: task.class!,
          title: task.title!,
          description: task.description,
          dueDate: task.dueDate!,
          completed: task.completed || false,
          documentUrl: task.documentUrl,
          externalUrl: task.externalUrl,
          points: task.points || 0
        };
        tasks.push(newTask);
        this.saveData(tasks);
        return newTask;
      })
    );
  }

  calculatePoints(tasks: Task[]): number {
    return tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
  }

  private saveData(tasks: Task[]): void {
    localStorage.setItem(this.dataKey, JSON.stringify(tasks));
  }
}