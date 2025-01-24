import { Component, OnInit } from '@angular/core';
import { BtnPrimaryComponent } from '../../components/btn-primary/btn-primary.component';
import { UserInterface } from '../../interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [BtnPrimaryComponent],
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
