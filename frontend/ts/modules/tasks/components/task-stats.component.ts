import { Component } from '@angular/core';
import { UserService } from '../../user/services/user.service.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-task-stats',
  template: `<div class="mb-3">Punkte gesamt: {{ totalPoints$ | async }}</div>`
})
export class TaskStatsComponent {
  totalPoints$: Observable<number>;

  constructor(private userService: UserService) {
    this.totalPoints$ = this.userService.profile$.pipe(
      map(profile => profile.totalPoints)
    );
  }
}