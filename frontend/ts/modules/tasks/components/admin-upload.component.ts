import { Component, OnInit } from '@angular/core';
import { TasksService } from '../services/tasks.service.js';
import { Task } from '../models/task.model.js';
import { AuthService } from '../services/auth.service.js';

@Component({
  selector: 'app-admin-upload',
  templateUrl: './admin-upload.component.html'
})
export class AdminUploadComponent implements OnInit {
  tasks: Task[] = [];
  editTask: Task|null = null;
  classes = ['L1','L2','L3','L4'];

  constructor(private svc: TasksService, public auth: AuthService) {}

  ngOnInit() {
    this.svc.getTasksByClass('L1').subscribe(data => this.tasks = data);
  }

  save() {
    if (this.editTask) {
      this.svc.updateTask(this.editTask).subscribe(() => this.refresh());
    }
  }

  create(newTask: Partial<Task>) {
    this.svc.createTask(newTask).subscribe(() => this.refresh());
  }

  delete(id: number) {
    this.svc.removeTask(id).subscribe(() => this.refresh());
  }

  private refresh() {
    this.svc.getTasksByClass(this.editTask?.class || 'L1').subscribe(data => this.tasks = data);
  }
}