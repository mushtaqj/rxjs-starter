import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { ProductService } from '../product.service';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  private errorMessageSubject = new Subject<string>();
  pageTitle = 'Products';

  errorMessage$ = this.errorMessageSubject.asObservable();


  products$ = this.productService.productWithCategory$.pipe(
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  selectedProduct$ = this.productService.selectedProduct$;

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId);
  }
}
