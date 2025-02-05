import { Component, OnInit } from '@angular/core';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { UserInterface } from '../../../../core/interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PrimaryButtonComponent],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent implements OnInit {
  user: UserInterface | any = null;

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }  
}
