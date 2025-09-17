import { Routes } from '@angular/router';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { authGuard } from '../../core/guards';
import { SuccessComponent } from './components/success/success.component';
import { CancelComponent } from './components/cancel/cancel.component';
import { NotFoundComponent } from '../other-page/not-found/not-found.component';
import { PrincipalComponent } from './components/principal/principal.component';

export const orderRoutesAdmin: Routes = [
    { 
        path: '', 
        component: PrincipalComponent,
        pathMatch: 'full'
    },
    { path: '**', component: NotFoundComponent }
]

export const orderRoutes: Routes = [
    { 
        path: 'success', 
        component: SuccessComponent, 
        canActivate: [authGuard]
    },
    { 
        path: 'cancel', 
        component: CancelComponent, 
        canActivate: [authGuard]
    },
    { 
        path: ':id', 
        component: OrderFormComponent, 
        canActivate: [authGuard]
    },
    { path: '**', component: NotFoundComponent }
]