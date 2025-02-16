import { EditAwardInterface } from './../interfaces/edit-award.interface';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { AwardInterface, CreateAwardInterface, UpdateAwardInterface } from '../interfaces';
import { handleError } from '../../../core/errors';

@Injectable({
  providedIn: 'root'
})
export class AwardService {

  url: string = environment.apiUrl + 'award';

  constructor(
    private http: HttpClient
  ) { }

  createAward(createAward: CreateAwardInterface): Observable<AwardInterface> {
    return this.http.post<AwardInterface>(this.url + 'create', createAward)
      .pipe(catchError(handleError));
  }

  createAwards(createAwards: CreateAwardInterface[]): Observable<AwardInterface> {
    return this.http.post<AwardInterface>(this.url + '/multi', createAwards)
      .pipe(catchError(handleError));
  }

  updateAward(id: number, updateAward: UpdateAwardInterface): Observable<AwardInterface> {
    return this.http.patch<AwardInterface>(this.url + `/${id}`, updateAward)
      .pipe(catchError(handleError));
  }

  getAwardsByEvent(eventId: number): Observable<AwardInterface[]> {
    return this.http.get<AwardInterface[]>(this.url+'/event/' + eventId)
      .pipe(catchError(handleError));
  }

  deleteAward(id: number): Observable<any> {
    return this.http.delete<any>(this.url + `/${id}`)
      .pipe(catchError(handleError));
  }
}
