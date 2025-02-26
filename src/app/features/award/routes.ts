import { Routes } from "@angular/router";
import { EditAwardsComponent } from "./components/edit-awards/edit-awards.component";
import { authGuard } from "../../core/guards";
import { PrincipalComponent } from "./components/principal/principal.component";

export const awardRoutes: Routes = [
    { path: 'edit/:eventId', title: 'Editar Premios', component: EditAwardsComponent, canActivate: [authGuard] },
    { path: '**', component: PrincipalComponent }
];