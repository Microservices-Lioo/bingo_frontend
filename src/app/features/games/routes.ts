import { Routes } from "@angular/router";
import { NotFoundComponent } from "../other-page/not-found/not-found.component";
import { PrincipalComponent } from "./components/principal.component";

export const roomRoutes: Routes = [
    { 
        path: ':userId/:id', 
        component: PrincipalComponent
    },
    // { path: 'create', title: 'Crear Evento', component: CreateEventComponent },
    // { path: 'edit', title: 'Editar Evento', component: EditEventComponent },
    { path: '**', component: NotFoundComponent }
]