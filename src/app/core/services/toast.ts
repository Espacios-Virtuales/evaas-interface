// src/app/core/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success'|'info'|'warning'|'danger';
export interface ToastMsg { id: number; type: ToastType; text: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastMsg[]>([]);
  private _id = 0;

  show(text: string, type: ToastType = 'info', timeout = 3000) {
    const id = ++this._id;
    this.toasts.update(xs => [...xs, { id, type, text }]);
    if (timeout) setTimeout(() => this.dismiss(id), timeout);
  }
  
  success(t:string){this.show(t,'success');} info(t:string){this.show(t,'info');}
  warn(t:string){this.show(t,'warning');}  error(t:string){this.show(t,'danger',5000);}
  dismiss(id:number){ this.toasts.update(xs => xs.filter(t => t.id !== id)); }
  clear(){ this.toasts.set([]); }
}
