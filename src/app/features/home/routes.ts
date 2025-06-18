import { Routes } from "@angular/router";
import { HomeComponent } from "./components/principal/home.component";
import { EventsListComponent } from "./components/events-list/events-list.component";
import { HomeSidebarComponent } from "./home-sidebar/home-sidebar.component";
import { ViewEventComponent } from "../events/components/view-event/view-event.component";
import { PrincipalComponent as PrincipalGamesComponent } from "../games/components/principal.component";
import { authGuard, eventGuard } from "../../core/guards";

export const homeRoutes: Routes = [
    { path: '', redirectTo: '/home/principal', pathMatch: 'full' },
    { path: '', component: HomeSidebarComponent, 
        children: [
            { path: 'principal', component: HomeComponent },
            { path: 'all-events', title: 'Todos los eventos', component: EventsListComponent },
            { path: 'event-detail', title: 'Detalles del evento', component: ViewEventComponent },
            { path: 'game/:userId/:id', title: 'Game', component: PrincipalGamesComponent, canActivate: [authGuard, eventGuard] },
            { path: '', redirectTo: '/principal', pathMatch: 'full' },
            { path: '**', component: HomeComponent }
        ]
    },
    { path: '**', component: HomeSidebarComponent }
];
