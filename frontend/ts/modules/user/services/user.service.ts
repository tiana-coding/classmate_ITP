import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  name: string;
  class: string;
  totalPoints: number;
  badges: string[];
  isAdmin: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private storageKey = 'userProfile';
  private _profile$ = new BehaviorSubject<UserProfile>(this.loadProfile());

  /** Observable für alle Profileigenschaften */
  readonly profile$: Observable<UserProfile> = this._profile$.asObservable();

  /** synchroner Zugriff */
  get profile(): UserProfile {
    return this._profile$.value;
  }

  /** prüft, ob der User Admin ist */
  isAdmin(): boolean {
    return this.profile.isAdmin;
  }

  /** Aktualisiert nur den Admin-Status */
  setAdmin(admin: boolean) {
    const prof = { ...this.profile, isAdmin: admin };
    this.saveProfile(prof);
  }

  /** Aktualisiert den Punktestand */
  updatePoints(points: number) {
    const prof = { ...this.profile, totalPoints: points };
    this.saveProfile(prof);
  }

  /** Fügt ein Badge hinzu */
  addBadge(badge: string) {
    const prof = { ...this.profile, badges: [...this.profile.badges, badge] };
    this.saveProfile(prof);
  }

  /** private Hilfsmethoden */
  private loadProfile(): UserProfile {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      return JSON.parse(raw) as UserProfile;
    }
    // Defaults
    const defaultProfile: UserProfile = {
      name: 'Unbekannt',
      class: 'L1',
      totalPoints: 0,
      badges: [],
      isAdmin: false
    };
    localStorage.setItem(this.storageKey, JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  private saveProfile(profile: UserProfile) {
    localStorage.setItem(this.storageKey, JSON.stringify(profile));
    this._profile$.next(profile);
  }
}