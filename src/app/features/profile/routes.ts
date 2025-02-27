import { Routes } from "@angular/router";
import { EditProfileComponent } from "./components/edit-profile/edit-profile.component";
import { ProfileComponent } from "./components/view-profile/profile.component";
import { authGuard } from "../../core/guards";

export const profileRoutes: Routes = [
    { path: '', title: 'Perfil', component: ProfileComponent },
    { path: 'edit-profile', title:'Editar Perfil', component: EditProfileComponent, canActivate: [authGuard]},
    { path: '**', component: ProfileComponent }
];