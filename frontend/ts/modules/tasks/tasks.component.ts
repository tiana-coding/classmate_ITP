import { Component, OnInit } from '@angular/core';
import { Task } from './models/task.model';
import { TasksService } from './services/tasks.service';
import { AuthService } from './services/auth.service';
import { UserService } from '../../user/services/user.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html'
})
export class TasksComponent implements OnInit {
  classes = ['L1','L2','L3','L4'];
  selectedClass = 'L1';
  tasks: Task[] = [];

  constructor(
    private svc: TasksService,
    public auth: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.getTasksByClass(this.selectedClass).subscribe(list => {
      this.tasks = list;
      const points = this.svc.calculatePoints(list);
      this.userService.updatePoints(points);
    });
  }

  onClassChange() {
    this.load();
  }

  onToggle(task: Task) {
    this.svc.toggleCompleted(task).subscribe(() => this.load());
  }

  onDelete(id: number) {
    this.svc.removeTask(id).subscribe(() => this.load());
  }
}