import { Routes } from "@angular/router";
import { HomeComponent } from "./components/principal/home.component";
import { EventsListComponent } from "./components/events-list/events-list.component";
import { ViewEventComponent } from "../events/components/view-event/view-event.component";
import { PrincipalComponent as PrincipalGamesComponent } from "../games/components/principal.component";
import { authGuard, eventGuard } from "../../core/guards";
import { ProfileComponent } from "../profile/components/view-profile/profile.component";
import { AppLayoutComponent } from "../../shared/layout/app-layout/app-layout.component";
import { orderRoutes } from "../orders/routes";
import { NotFoundComponent } from "../other-page/not-found/not-found.component";

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
                path: 'game/:userId/:id', 
                title: 'Game | Mi Bingo', 
                component: PrincipalGamesComponent, 
                canActivate: [authGuard, eventGuard] 
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
