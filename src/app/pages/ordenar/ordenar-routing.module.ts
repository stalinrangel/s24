import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrdenarComponent } from './ordenar.component';

const routes: Routes = [{
  path: '',
  component: OrdenarComponent,
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class OrdenarRoutingModule {

}

export const routedComponents = [
  OrdenarComponent,
];
