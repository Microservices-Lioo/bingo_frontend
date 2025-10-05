import { Routes } from "@angular/router";
import { HomeComponent } from "./components/principal/home.component";
import { EventsListComponent } from "./components/events-list/events-list.component";
import { ViewEventComponent } from "../events/components/view-event/view-event.component";
import { ProfileComponent } from "../profile/components/view-profile/profile.component";
import { AppLayoutComponent } from "../../shared/layout/app-layout/app-layout.component";
import { orderRoutes } from "../orders/routes";
import { NotFoundComponent } from "../other-page/not-found/not-found.component";
import { roomRoutes } from "../games/routes";

export const homeRoutes: Routes = [
    { 
        path: '', 
        component: AppLayoutComponent,
        children: [
            { 
                path: '', 
                component: HomeComponent, 
                pathMatch: 'full',
                title: 'Todos los eventos | Mi Bingo'
            },
            { 
                path: 'all-events', 
                title: 'Todos los eventos | Mi Bingo', 
                component: EventsListComponent 
            },
            { 
                path: 'event-detail', 
                title: 'Detalles del evento | Mi Bingo', 
                component: ViewEventComponent 
            },
            { 
                path: 'profile', 
                title: 'Perfil | Mi Bingo', 
                component: ProfileComponent 
            },
            { 
                path: 'room', 
                title: 'Sala | Mi Bingo', 
                children: roomRoutes 
            },
            {
                path: 'order',
                title: 'Orden de compra',
                children: orderRoutes
            },
            { 
                path: '**',  
                title: 'Página no encontrada',
                component: NotFoundComponent
            }
        ]
    },
];
