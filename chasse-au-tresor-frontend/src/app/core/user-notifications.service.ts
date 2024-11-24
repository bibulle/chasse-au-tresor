import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UserNotificationsService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title?: string): void {
    console.log(`success(${message}, ${title})`);
    this.toastr.success(message, title);
  }

  error(message: string, title?: string): void {
    console.log(`error(${message}, ${title})`);
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
