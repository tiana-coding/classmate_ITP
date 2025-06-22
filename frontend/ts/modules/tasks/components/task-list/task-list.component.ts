import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../models/task.model.js';

@Component({ selector: 'app-task-list', templateUrl: './task-list.component.html' })
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Output() toggleComplete = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<number>();
}
