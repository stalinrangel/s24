import { Component } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';
import { MENU_ITEMS2 } from './pages-menu';

@Component({
  selector: 'ngx-pages',
  template: `
    <ngx-sample-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-sample-layout>  `,
})
export class PagesComponent {

  //menu = MENU_ITEMS;
  menu = [];

  constructor(){

  	var tipo_usuario = localStorage.getItem('mouvers_user_tipo');

  	if (tipo_usuario == '1') {
  		this.menu = MENU_ITEMS;
  	}else if (tipo_usuario == '4') {
  		this.menu = MENU_ITEMS2;
  	}
  }

  
}
