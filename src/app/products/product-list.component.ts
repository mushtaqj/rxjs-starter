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
  categories;

  private categorySelectedSubject = new Subject<number>()
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([this.productService.productWithCategory$, this.categorySelectedAction$.pipe(startWith(0))])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product => selectedCategoryId ? product.categoryId === selectedCategoryId : true)
      ),
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  )

  constructor(private readonly productService: ProductService,
              private readonly productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
