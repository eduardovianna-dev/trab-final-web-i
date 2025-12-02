import { Component } from '@angular/core';
import { ProductItem } from '../product-item/product-item';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductItem, NgFor],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList {
  // TODO: Aluno
  // 1. Crie uma lista (array) de produtos.
  //    Cada produto deve ter: id, name, price, e imageUrl.
  //    Ex: { id: 1, name: 'Nome do Produto', price: 99.99, imageUrl: 'url_d-imagem' }
  products = [];
}
