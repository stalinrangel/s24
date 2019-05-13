import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatprincipalesComponent } from './Catprincipales.component';
import { CategoriasVerComponent } from './categorias-ver/categorias-ver.component';
import { CategoriasAgregarComponent } from './categorias-agregar/categorias-agregar.component';

const routes: Routes = [{
  path: '',
  component: CatprincipalesComponent,
  children: [{
    path: 'ver',
    component: CategoriasVerComponent,
  },{
    path: 'agregar',
    component: CategoriasAgregarComponent,
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
export class CatprincipalesRoutingModule {

}

export const routedComponents = [
  CatprincipalesComponent,
  CategoriasVerComponent,
  CategoriasAgregarComponent,
];
