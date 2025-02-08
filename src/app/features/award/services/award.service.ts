import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { AwardInterface, CreateAward } from '../interfaces';
import { handleError } from '../../../core/errors';

@Injectable({
  providedIn: 'root'
})
export class AwardService {

  url: string = environment.apiUrl + 'award';

  constructor(
    private http: HttpClient
  ) { }

  createAward(createAward: CreateAward): Observable<AwardInterface> {
    return this.http.post<AwardInterface>(this.url + 'create', createAward)
      .pipe(catchError(handleError));
  }

  createAwards(createAwards: CreateAward[]): Observable<AwardInterface> {
    return this.http.post<AwardInterface>(this.url + '/multi', createAwards)
      .pipe(catchError(handleError));
  }
}
