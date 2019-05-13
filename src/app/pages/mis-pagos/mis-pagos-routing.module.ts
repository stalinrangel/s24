import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MisPagosComponent } from './mis-pagos.component';
import { MisPagosPendientesComponent } from './mis-pagos-pendientes/mis-pagos-pendientes.component';
import { MisPagosRealizadosComponent } from './mis-pagos-realizados/mis-pagos-realizados.component';

const routes: Routes = [{
  path: '',
  component: MisPagosComponent,
  children: [{
    path: 'pendientes',
    component: MisPagosPendientesComponent,
  },{
    path: 'realizados',
    component: MisPagosRealizadosComponent,
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
export class MisPagosRoutingModule {

}

export const routedComponents = [
  MisPagosComponent,
  MisPagosPendientesComponent,
  MisPagosRealizadosComponent,
];
