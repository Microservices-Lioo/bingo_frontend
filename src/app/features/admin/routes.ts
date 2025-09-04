import { Routes } from "@angular/router";
import { authGuard } from "../../core/guards";
import { AdminComponent } from "./admin.component";
import { eventsRoutes } from "../events/routes";
import { awardRoutes } from "../award/routes";


export const adminRoutes: Routes = [
    { 
        path: '', 
        component: AdminComponent,
        canActivate: [authGuard],
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
            { path: '**', redirectTo: 'events' }
        ]
    }
]