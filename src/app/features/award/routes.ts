import { Routes } from "@angular/router";
import { EditAwardsComponent } from "./components/edit-awards/edit-awards.component";
import { authGuard } from "../../core/guards";

export const awardRoutes: Routes = [
    { path: 'edit/:eventId', component: EditAwardsComponent, canActivate: [authGuard] },
];