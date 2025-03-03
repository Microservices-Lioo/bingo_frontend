import { Routes } from '@angular/router';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { authGuard } from '../../core/guards';

export const orderRoutes: Routes = [
    { path: '', component: OrderFormComponent, canActivate: [authGuard]},
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '**', component: OrderFormComponent }
]