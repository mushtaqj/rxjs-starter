import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ProductService } from '../product.service';
import { catchError } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';


@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private readonly errorMessageSubject = new Subject<string>();
  readonly pageTitle = 'Product Detail';

  readonly errorMessage$ = this.errorMessageSubject.asObservable();

  readonly product$ = this.productService.selectedProduct$.pipe(
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  readonly productSuppliers$ = this.productService.selectedProductSuppliers$.pipe(
    catchError(err => {
      this.errorMessageSubject.next(err)
      return EMPTY;
    })
  )

  constructor(private productService: ProductService) { }

}
