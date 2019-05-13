import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MisProductosComponent } from './mis-productos.component';
import { MisProductosVerComponent } from './mis-productos-ver/mis-productos-ver.component';
import { MisProductosAgregarComponent } from './mis-productos-agregar/mis-productos-agregar.component';

const routes: Routes = [{
  path: '',
  component: MisProductosComponent,
  children: [{
    path: 'ver',
    component: MisProductosVerComponent,
  },{
    path: 'agregar',
    component: MisProductosAgregarComponent,
  }],
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class MisProductosRoutingModule {

}

export const routedComponents = [
  MisProductosComponent,
  MisProductosVerComponent,
  MisProductosAgregarComponent,
];
