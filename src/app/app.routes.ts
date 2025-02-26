import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'home', title: 'Inicio', loadChildren: () => import('./features/home/routes').then(m => m.homeRoutes) },
    { path: 'auth', title: 'Autenticación', loadChildren: () => import('./features/auth/routes').then(m => m.authRoutes) },
    { path: 'profile', title: 'Perfil', loadChildren: () => import('./features/profile/routes').then(m => m.profileRoutes),  },
    { path: 'events', title: 'Eventos', loadChildren: () => import('./features/events/routes').then(m => m.eventsRoutes),  },
    { path: 'award', title: 'Premios', loadChildren: () => import('./features/award/routes').then(m => m.awardRoutes),  },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', loadChildren: () => import('./features/home/routes').then(m => m.homeRoutes) },
];
