import { Routes } from "@angular/router";
import { HomeComponent } from "./components/principal/home.component";
import { EventsListComponent } from "./components/events-list/events-list.component";
import { HomeSidebarComponent } from "./home-sidebar/home-sidebar.component";
import { ViewEventComponent } from "../events/components/view-event/view-event.component";
import { PrincipalComponent as PrincipalGamesComponent } from "../games/components/principal.component";
import { authGuard, eventGuard } from "../../core/guards";
import { ProfileComponent } from "../profile/components/view-profile/profile.component";

export const homeRoutes: Routes = [
    { 
        path: '', 
        component: HomeSidebarComponent,
        children: [
            { path: '', redirectTo: '/principal', pathMatch: 'full' },
            { path: 'principal', component: HomeComponent },
            { path: 'all-events', title: 'Todos los eventos', component: EventsListComponent },
            { path: 'event-detail', title: 'Detalles del evento', component: ViewEventComponent },
            { path: 'profile', title: 'Perfil', component: ProfileComponent },
            { path: 'game/:userId/:id', title: 'Game', component: PrincipalGamesComponent, canActivate: [authGuard, eventGuard] },
            { path: '**', redirectTo: '/principal' }
        ]
    },
];
