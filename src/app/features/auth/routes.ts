import { Routes } from "@angular/router";
import { RegisterComponent } from "./components/register/register.component";
import { noAuthGuard } from "../../core/guards/no-auth.guard";
import { LoginComponent } from "./components/login/login.component";

export const authRoutes: Routes = [
    { 
        path: '', 
        redirectTo: 'login', 
        pathMatch: 'full' 
    },
    { 
        path: 'login', 
        title: 'Login', 
        component: LoginComponent, 
        canActivate: [noAuthGuard] 
    },
    { 
        path: 'register', 
        title: 'Registro', 
        component: RegisterComponent, 
        canActivate: [noAuthGuard] 
    },
    { 
        path: '**', 
        component: LoginComponent 
    }
];