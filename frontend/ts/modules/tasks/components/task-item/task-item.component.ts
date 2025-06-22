import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Task } from '../../models/task.model.js';
import { AuthService } from '../../services/auth.service.js';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() toggle = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<number>();

  constructor(public auth: AuthService) {}

  trackById(index: number, item: Task) {
    return item.id;
  }
}