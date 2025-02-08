import { Routes } from "@angular/router";
import { PrincipalComponent } from "./components/principal/principal.component";
import { authGuard } from "../../core/guards";
import { CreateEventComponent } from "./components/create-event/create-event.component";


export const eventsRoutes: Routes = [
    { path: '', component: PrincipalComponent, canActivate: [authGuard] },
    { path: 'create', component: CreateEventComponent, canActivate: [authGuard] },
]