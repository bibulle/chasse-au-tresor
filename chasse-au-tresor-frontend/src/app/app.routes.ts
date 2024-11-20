import { Routes } from '@angular/router';
import { UserCreateComponent } from './users/user-create/user-create.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { AuthGuard } from './core/auth.guard';
import { LoginComponent } from './admin/login/login.component';

export const routes: Routes = [
    { path: '', redirectTo: 'create-user', pathMatch: 'full' },
    { path: 'create-user', component: UserCreateComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent }, // Route de login


];
