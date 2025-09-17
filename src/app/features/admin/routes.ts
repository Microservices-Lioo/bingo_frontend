import { Routes } from "@angular/router";
import { eventsRoutes } from "../events/routes";
import { awardRoutes } from "../award/routes";
import { AppAdminLayoutComponent } from "../../shared/layout/app-admin-layout/app-admin-layout.component";
import { orderRoutesAdmin } from "../orders/routes";


export const adminRoutes: Routes = [
    { 
        path: '', 
        component: AppAdminLayoutComponent,
        children: [
            { 
                path: '', 
                redirectTo: 'events', 
                pathMatch: 'full'
             },
            { 
                path: 'events', 
                title: 'Administrar eventos', 
                children: eventsRoutes
            },
            { 
                path: 'award', 
                title: 'Premios', 
                children: awardRoutes
            },
            {
                path: 'orders',
                title: 'Administrar ordenes',
                children: orderRoutesAdmin
            },
            { path: '**', redirectTo: 'events' }
        ]
    }
]