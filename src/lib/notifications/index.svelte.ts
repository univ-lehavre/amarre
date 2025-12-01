import { v7 } from 'uuid';
import { type Log } from '$lib/types';

export enum Color {
  Primary = 'primary',
  Secondary = 'secondary',
  Success = 'success',
  Danger = 'danger',
  Warning = 'warning',
  Info = 'info',
  Light = 'light',
  Dark = 'dark',
}

interface NotificationParams {
  message: string;
  type: Color;
  title?: string;
  log?: Log;
  delay?: number;
}

interface Notification extends NotificationParams {
  id: string;
  createdAt: string;
  hidedAt?: string;
  show: boolean;
}

export class NotificationCenter {
  private readonly id: string = v7();
  private notifications: Notification[] = $state([]);

  constructor() {}

  get items(): Notification[] {
    return this.notifications;
  }

  get store() {
    return { id: this.id, notifications: this.notifications };
  }

  static build(pars: NotificationParams): Notification {
    const notif: Notification = { id: v7(), createdAt: new Date().toISOString(), show: true, ...pars };
    return notif;
  }

  add(pars: NotificationParams): void {
    const notif = NotificationCenter.build({ ...pars });
    this.notifications.push(notif);
  }

  private findIndex(id: string): number {
    const index = this.notifications.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`Notification with id ${id} not found`);
    return index;
  }

  find(id: string): Notification {
    const idx = this.findIndex(id);
    return this.notifications[idx];
  }

  private remove(idx: number): void {
    this.notifications.splice(idx, 1);
  }

  hide(id: string): void {
    const idx = this.findIndex(id);
    this.notifications[idx].show = false;
    this.notifications[idx].hidedAt = new Date().toISOString();
    this.remove(idx);
  }
}
