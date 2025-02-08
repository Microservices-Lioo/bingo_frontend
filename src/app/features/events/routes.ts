import { Routes } from "@angular/router";
import { PrincipalComponent } from "./components/principal/principal.component";
import { authGuard } from "../../core/guards";
import { CreateComponent } from "./components/create/create.component";


export const eventsRoutes: Routes = [
    { path: '', component: PrincipalComponent, canActivate: [authGuard] },
    { path: 'create', component: CreateComponent, canActivate: [authGuard] },
]