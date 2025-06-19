import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-connection',
  imports: [],
  templateUrl: './status-connection.component.html',
  styles: ``
})
export class StatusConnectionComponent {
  @Input() title!: string;
  @Input() message!: string;
  @Input() type!: 'connected' | 'disconnected' | 'reconnecting' | 'failed' | 'on-standby';

  reloadPage() {
    window.location.reload();
  }
}
