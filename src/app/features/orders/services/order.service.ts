import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { handleError } from '../../../core/errors';
import { ICreateOrder } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  url: string = environment.apiUrl + environment.apiMSOrderUrl;

  constructor(private http: HttpClient) { }

  createOrder(order: ICreateOrder): Observable<{url: string}> {
    return this.http.post<{url: string}>(`${this.url}`, order )
      .pipe(catchError(handleError));
  }
}
