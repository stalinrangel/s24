import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MisPedidosComponent } from './mis-pedidos.component';
import { MisPedidosCursoComponent } from './mis-pedidos-curso/mis-pedidos-curso.component';
import { MisPedidosFinalizadosComponent } from './mis-pedidos-finalizados/mis-pedidos-finalizados.component';

const routes: Routes = [{
  path: '',
  component: MisPedidosComponent,
  children: [{
    path: 'encurso',
    component: MisPedidosCursoComponent,
  },{
    path: 'finalizados',
    component: MisPedidosFinalizadosComponent,
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
export class MisPedidosRoutingModule {

}

export const routedComponents = [
  MisPedidosComponent,
  MisPedidosCursoComponent,
  MisPedidosFinalizadosComponent,
];
