import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Notification } from '../../models/notifications.interface';

interface NotificationState {
  notifications: Notification[];
}

@Injectable()
export class NotificationStore extends ComponentStore<NotificationState> {
  constructor() {
    super({ notifications: [] });
  }

  readonly notifications$ = this.select((state) => state.notifications);

  readonly addNotification = this.updater((state, newNotification: Notification) => {
    return {
      ...state,
      notifications: [...state.notifications, newNotification],
    };
  });
}
