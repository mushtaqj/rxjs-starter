import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, merge, Observable, Subject, throwError } from 'rxjs';
import { catchError, map, scan, shareReplay, tap } from 'rxjs/operators';

import { Product } from './product';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly productsUrl = 'api/products';
  private readonly suppliersUrl = this.supplierService.suppliersUrl;

  readonly products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(ProductService.handleError)
    );

  readonly productsWithCategory$ = combineLatest([this.products$, this.productCategoryService.productCategories$])
    .pipe(
      map(([products, categories]) =>
        products.map(product => ({
          ...product,
          price: product.price * 1.5,
          category: categories.find(c => product.categoryId === c.id).name,
          searchKey: [product.productName]
        }) as Product)
      ),
      shareReplay(1)
    );

  private readonly productSelectedSubject = new BehaviorSubject<number>(0);
  readonly productSelectedAction$ = this.productSelectedSubject.asObservable();

  readonly selectedProduct$: Observable<Product> = combineLatest(
    [this.productsWithCategory$, this.productSelectedAction$])
    .pipe(
      map(([products, selectedProdId]) => products.find(product => product.id === selectedProdId)),
      tap(selectedProduct => console.log({ selectedProduct })),
      shareReplay(1)
    );

  private readonly insertProductSubject = new Subject<Product>();
  readonly insertedProductAction$ = this.insertProductSubject.asObservable();

  readonly productsWithAdd$ = merge(this.productsWithCategory$, this.insertedProductAction$).pipe(
    scan((acc: Product[], newProduct: Product) => [...acc, newProduct]),
    shareReplay(1)
  );

  readonly selectedProductSuppliers$ = combineLatest([this.selectedProduct$, this.supplierService.suppliers$])
    .pipe(
      map(([selectedProduct, suppliers]) =>
        suppliers.filter(supplier => selectedProduct.supplierIds.includes(supplier.id))
      )
    )

  constructor(private readonly http: HttpClient,
              private readonly supplierService: SupplierService,
              private readonly productCategoryService: ProductCategoryService) { }


  private static fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

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

  selectedProductChanged(productId: number): void {
    this.productSelectedSubject.next(productId);
  }

  insertProduct(newProduct: Product = ProductService.fakeProduct()): void {
    this.insertProductSubject.next(newProduct);
  }

}
