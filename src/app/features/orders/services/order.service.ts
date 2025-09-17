import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { handleError } from '../../../core/errors';
import { ICreateOrder, IOrderPagination } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  url: string = environment.apiUrl + environment.apiMSOrderUrl;

  constructor(private http: HttpClient) { }

  //* Crear una orden de compra
  createOrder(order: ICreateOrder): Observable<{url: string}> {
    return this.http.post<{url: string}>(`${this.url}`, order )
      .pipe(catchError(handleError));
  }

  //* Obtener las ordenes
  getOrders(pagination: {page?: number, limit?: number}): Observable<IOrderPagination> {
    return this.http.get<IOrderPagination>(this.url, { params: pagination })
      .pipe(catchError(handleError));
  }
}
