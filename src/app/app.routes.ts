import { Routes } from '@angular/router';
import { authGuard } from './core/guards';
import { NotFoundComponent } from './features/other-page/not-found/not-found.component';
import { ForbiddenComponent } from './features/other-page/forbidden/forbidden.component';

export const routes: Routes = [
    { 
        path: 'auth', 
        title: 'Autenticación', 
        loadChildren: () => import('./features/auth/routes').then(m => m.authRoutes) 
    },
    { 
        path: 'admin', 
        title: 'Administrar', 
        loadChildren: () => import('./features/admin/routes').then(m => m.adminRoutes), 
        canActivate: [authGuard] 
    },
    { 
        path: 'profile', 
        title: 'Perfil', 
        loadChildren: () => import('./features/profile/routes').then(m => m.profileRoutes),  
    },
    // { path: 'events', title: 'Eventos', loadChildren: () => import('./features/events/routes').then(m => m.eventsRoutes),  },
    // { path: 'award', title: 'Premios', loadChildren: () => import('./features/award/routes').then(m => m.awardRoutes),  },
    // error
    { 
        path: 'forbidden',  
        title: 'Página protegida',
        component: ForbiddenComponent
    },
    { 
        path: '', 
        title: 'Inicio', 
        loadChildren: () => import('./features/home/routes').then(m => m.homeRoutes) 
    }
];
