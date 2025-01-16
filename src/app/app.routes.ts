import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { EventsListComponent } from './pages/events/events-list/events-list.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'auth', component: AuthComponent, canActivate: [] },
    { path: 'register', component: RegisterComponent, canActivate: [] },
    { path: 'home', component: HomeComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard]},
    { path: '**', redirectTo: 'home', pathMatch: 'full'},
];
