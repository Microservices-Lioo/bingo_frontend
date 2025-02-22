import { Routes } from "@angular/router";
import { HomeComponent } from "./components/principal/home.component";
import { EventsListComponent } from "./components/events-list/events-list.component";
import { HomeSidebarComponent } from "./home-sidebar/home-sidebar.component";

export const homeRoutes: Routes = [
    { path: '', redirectTo: 'home/principal', pathMatch: 'full'},
    { path: '', component: HomeSidebarComponent, 
        children: [
            { path: 'principal', component: HomeComponent },
            { path: 'all-events', component: EventsListComponent },
            { path: '', redirectTo: 'principal', pathMatch: 'full'}
        ]
    },
];
