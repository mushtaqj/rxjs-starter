import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ProductService } from '../product.service';
import { catchError, map } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';


@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private readonly errorMessageSubject = new Subject<string>();

  readonly errorMessage$ = this.errorMessageSubject.asObservable();

  readonly product$ = this.productService.selectedProduct$.pipe(
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  readonly pageTitle$ = this.product$.pipe(
    map(prod => prod ? `Product Detail for: ${prod.productName}`: null)
  );

  readonly productSuppliers$ = this.productService.selectedProductSuppliers$.pipe(
    catchError(err => {
      this.errorMessageSubject.next(err)
      return EMPTY;
    })
  )

  constructor(private productService: ProductService) { }

}
