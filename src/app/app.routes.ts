import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'home', loadChildren: () => import('./features/home/routes').then(m => m.homeRoutes) },
    { path: 'auth', loadChildren: () => import('./features/auth/routes').then(m => m.authRoutes) },
    { path: 'profile', loadChildren: () => import('./features/profile/routes').then(m => m.profileRoutes),  },
    { path: 'events', loadChildren: () => import('./features/events/routes').then(m => m.eventsRoutes),  },
    { path: 'award', loadChildren: () => import('./features/award/routes').then(m => m.awardRoutes),  },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/home' },
];
