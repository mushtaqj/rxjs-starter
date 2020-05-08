import { ChangeDetectionStrategy, Component } from '@angular/core';

import { combineLatest, EMPTY, Subject } from 'rxjs';
import { ProductService } from './product.service';
import { catchError, map, startWith } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';


@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  private errorMessageSubject = new Subject<string>();
  pageTitle = 'Product List';
  errorMessage$ = this.errorMessageSubject.asObservable();

  private categorySelectedSubject = new Subject<number>()
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  private readonly products$ = combineLatest(
    [this.productService.productsWithAdd$, this.categorySelectedAction$.pipe(startWith(0))])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product => selectedCategoryId ? product.categoryId === selectedCategoryId : true)
      ),
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  private readonly categories$ = this.productCategoryService.productCategories$.pipe(
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  )

  readonly vm$ = combineLatest([this.products$, this.categories$]).pipe(
    map(([products, categories]) => ({ products, categories }))
  )

  constructor(private readonly productService: ProductService,
              private readonly productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    this.productService.insertProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
