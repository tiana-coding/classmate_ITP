import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TasksComponent } from './tasks.component';
import { AdminUploadComponent } from './components/admin-upload.component';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  {
    path: '', component: TasksComponent,
    children: [
      { path: 'upload', component: AdminUploadComponent, canActivate: [AdminGuard] }
    ]
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class TasksRoutingModule {}