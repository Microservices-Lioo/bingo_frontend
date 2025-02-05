import { Routes } from "@angular/router";
import { EditProfileComponent } from "./components/edit-profile/edit-profile.component";
import { ProfileComponent } from "./components/view-profile/profile.component";
import { authGuard } from "../../core/guards";

export const profileRoutes: Routes = [
    { path: '', component: ProfileComponent, canActivate: [authGuard]},
    { path: 'edit-profile', component: EditProfileComponent, canActivate: [authGuard]},
];