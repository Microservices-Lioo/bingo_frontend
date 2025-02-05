import { Routes } from "@angular/router";
import { RegisterComponent } from "./components/register/register.component";
import { noAuthGuard } from "../../core/guards/no-auth.guard";
import { LoginComponent } from "./components/login/login.component";

export const authRoutes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [noAuthGuard] },
];