import { Routes } from "@angular/router";
import { PrincipalComponent } from "./components/principal/principal.component";
import { authGuard } from "../../core/guards";
import { CreateEventComponent } from "./components/create-event/create-event.component";
import { EditEventComponent } from "./components/edit-event/edit-event.component";
import { ViewEventComponent } from "./components/view-event/view-event.component";


export const eventsRoutes: Routes = [
    { path: '', title: 'Administrar Eventos', component: PrincipalComponent },
    { path: 'create', title: 'Crear Evento', component: CreateEventComponent },
    { path: 'edit', title: 'Editar Evento', component: EditEventComponent },
    { path: '**', component: PrincipalComponent, canActivate: [authGuard] }
]