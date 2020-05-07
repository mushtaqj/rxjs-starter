import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { of, throwError } from 'rxjs';
import { catchError, concatMap, map, shareReplay, tap } from 'rxjs/operators';
import { Supplier } from './supplier';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  readonly suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl).pipe(
    tap(suppliers => console.log('suppliers', JSON.stringify(suppliers))),
    shareReplay(1),
    catchError(err => SupplierService.handleError(err))
  );

  readonly suppliersWithMap$ = of(1,4,8).pipe(
    map(suppId => this.http.get<Supplier>(`${this.suppliersUrl}/${suppId}`))
  );

  readonly suppliersWithConcatMap$ = of(1,4,8).pipe(
    tap(id => console.log(`concatMap source Observable`,id)),
    concatMap(suppId => this.http.get<Supplier>(`${this.suppliersUrl}/${suppId}`))
  );

  readonly suppliersWithMergeMap$ = of(1,4,8).pipe(
    tap(id => console.log(`mergeMap source Observable`,id)),
    concatMap(suppId => this.http.get<Supplier>(`${this.suppliersUrl}/${suppId}`))
  );

  readonly suppliersWithSwitchMap$ = of(1,4,8).pipe(
    tap(id => console.log(`switchMap source Observable`,id)),
    concatMap(suppId => this.http.get<Supplier>(`${this.suppliersUrl}/${suppId}`))
  );

  constructor(private readonly http: HttpClient) { }

  private static handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
