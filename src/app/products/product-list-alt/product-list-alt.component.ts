import { ChangeDetectionStrategy, Component } from '@angular/core';

import { combineLatest, EMPTY, Subject } from 'rxjs';
import { ProductService } from '../product.service';
import { catchError, map } from 'rxjs/operators';


@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  private readonly errorMessageSubject = new Subject<string>();
  readonly pageTitle = 'Products';

  readonly errorMessage$ = this.errorMessageSubject.asObservable();

  private readonly products$ = this.productService.productsWithCategory$.pipe(
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  private readonly selectedProduct$ = this.productService.selectedProduct$;

  vm$ = combineLatest([this.products$, this.selectedProduct$]).pipe(
    map(([products, selectedProduct]) => ({ products, selectedProduct }))
  )

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId);
  }
}
