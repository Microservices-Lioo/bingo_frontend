import { OrderEventInterface } from './../interfaces/order-event.interface';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { handleError } from '../../../core/errors';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  url: string = environment.apiUrl + environment.apiMSPaymentUrl;

  constructor(private http: HttpClient) { }

  createEvent(event: OrderEventInterface, cuid: string, quantity: number): Observable<{url: string}> {
    return this.http.post<{url: string}>(`${this.url}/create-checkout-session`, { event, cuid, quantity } )
      .pipe(catchError(handleError));
  }
}
