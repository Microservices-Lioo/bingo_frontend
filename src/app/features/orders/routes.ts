import { Routes } from '@angular/router';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { authGuard } from '../../core/guards';
import { SuccessComponent } from './components/success/success.component';
import { CancelComponent } from './components/cancel/cancel.component';

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
    // { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '**', component: OrderFormComponent }
]