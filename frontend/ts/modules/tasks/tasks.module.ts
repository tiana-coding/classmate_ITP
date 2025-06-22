import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksRoutingModule } from './tasks-routing.module';
import { TasksComponent } from './tasks.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskItemComponent } from './components/task-item/task-item.component';
import { TaskStatsComponent } from './components/task-stats.component';
import { AdminUploadComponent } from './components/admin-upload.component';

@NgModule({
  declarations: [
    TasksComponent,
    TaskListComponent,
    TaskItemComponent,
    TaskStatsComponent,
    AdminUploadComponent
  ],
  imports: [CommonModule, FormsModule, TasksRoutingModule]
})
export class TasksModule {}