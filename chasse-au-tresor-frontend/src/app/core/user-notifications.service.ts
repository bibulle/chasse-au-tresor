import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UserNotificationsService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title?: string): void {
    console.log(`success(${message}, ${title})`);
    this.toastr.success(message, title);
  }

  error(message: string, error: any|null, title?: string): void {
    console.error(error);
    console.log(`error(${message}, ${title})`);

    if (error?.error?.message?.message) {
        message+=`<p><small>${error?.error?.message?.message}</small></p>`;
    } 
    this.toastr.error(message, title);
  }

  info(message: string, title?: string): void {
    console.log(`info(${message}, ${title})`);
    this.toastr.info(message, title);
  }

  warning(message: string, title?: string): void {
    console.log(`warning(${message}, ${title})`);
    this.toastr.warning(message, title);
  }
}
