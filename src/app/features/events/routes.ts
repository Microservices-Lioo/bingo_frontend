import { Routes } from "@angular/router";
import { PrincipalComponent } from "./components/principal/principal.component";
import { authGuard } from "../../core/guards";
import { CreateEventComponent } from "./components/create-event/create-event.component";
import { EditEventComponent } from "./components/edit-event/edit-event.component";
import { ViewEventComponent } from "./components/view-event/view-event.component";


export const eventsRoutes: Routes = [
    { path: 'principal', title: 'Administrar Eventos', component: PrincipalComponent, canActivate: [authGuard] },
    { path: 'create', title: 'Crear Evento', component: CreateEventComponent, canActivate: [authGuard] },
    { path: 'edit', title: 'Editar Evento', component: EditEventComponent, canActivate: [authGuard] },
    { path: 'view', title: 'Ver Evento', component: ViewEventComponent },
    { path: '', redirectTo: '/principal', pathMatch: 'full'},
    { path: '**', component: PrincipalComponent, canActivate: [authGuard] }
]