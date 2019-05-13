import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

//Mis imports
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { RutaBaseService } from '../../../services/ruta-base/ruta-base.service';

//import { FormBuilder, FormArray, FormGroup, Validators, FormControl  } from '@angular/forms';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'ngx-mis-pagos-pendientes',
  templateUrl: './mis-pagos-pendientes.component.html',
  /*styles: [`
    nb-card {
      transform: translate3d(0, 0, 0);
    }
  `],*/
  styleUrls: ['./mis-pagos-pendientes.component.scss'],
})
export class MisPagosPendientesComponent implements OnInit{

  //----Alertas---<
  config: ToasterConfig;

  position = 'toast-top-right';
  animationType = 'fade';
  title = 'HI there!';
  content = `I'm cool toaster!`;
  timeout = 5000;
  toastsLimit = 5;
  type = 'default'; // 'default', 'info', 'success', 'warning', 'error'

  isNewestOnTop = true;
  isHideOnClick = true;
  isDuplicatesPrevented = false;
  isCloseButton = true;
  //----Alertas--->

  private data:any;
  public productList:any;

  selectedObj: any;
  pedidos: any;
  total_deuda = 0;
  cancelar_monto = 0;

  public loading = false;
  public pagando = false;
  public mostrar = false;

  public establecimiento_id = localStorage.getItem('mouvers_establecimiento_id');
  public establecimiento_nom = localStorage.getItem('mouvers_user_nombre');
  public mouvers_user_tipo = localStorage.getItem('mouvers_user_tipo');

  constructor( private modalService: NgbModal,
               private toasterService: ToasterService,
               private http: HttpClient,
               private router: Router,
               private rutaService: RutaBaseService)
  {
    
    
  }

  ngOnInit() {

    if (this.mouvers_user_tipo != '4') {
      localStorage.removeItem('mouvers_token');
      localStorage.removeItem('mouvers_user_id');
      localStorage.removeItem('mouvers_user_nombre');
      localStorage.removeItem('mouvers_user_tipo');
      localStorage.removeItem('mouvers_establecimiento_id');

      this.router.navigateByUrl('/pagessimples/loginf');
    }
    
     this.getDeuda();
  }

  private showToast(type: string, title: string, body: string) {
      this.config = new ToasterConfig({
        positionClass: this.position,
        timeout: this.timeout,
        newestOnTop: this.isNewestOnTop,
        tapToDismiss: this.isHideOnClick,
        preventDuplicates: this.isDuplicatesPrevented,
        animation: this.animationType,
        limit: this.toastsLimit,
      });
      const toast: Toast = {
        type: type,
        title: title,
        body: body,
        timeout: this.timeout,
        showCloseButton: this.isCloseButton,
        bodyOutputType: BodyOutputType.TrustedHtml,
      };
      this.toasterService.popAsync(toast);
  }

  //Abrir modal por defecto
  open(modal) {
    this.modalService.open(modal);
  }

  //Abrir modal larga
  open2(modal) {
    this.modalService.open(modal , { size: 'lg', backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

  atras(): void {
    this.pagando = false;
    this.selectedObj = null;
    this.total_deuda = 0;
    this.cancelar_monto = 0;
  }

  getDeuda() {
    
    this.loading = true;
    this.http.get(this.rutaService.getRutaApi()+'pagos/pendientes/'+this.establecimiento_id+'?token='+localStorage.getItem('mouvers_token'))
       .toPromise()
       .then(
         data => { // Success

           console.log(data);
           this.data=data;
           this.pedidos = this.data.pedidos;
           this.total_deuda = this.data.total_deuda;

           this.loading = false;
           this.pagando = true;
           this.mostrar = false;

         },
         msg => { // Error
           console.log(msg);
           console.log(msg.error.error);

           this.loading = false;

           //token invalido/ausente o token expiro
           if(msg.status == 400 || msg.status == 401){ 
                //alert(msg.error.error);

                this.showToast('warning', 'Warning!', msg.error.error);
                this.mostrar = false;
            }
            //sin deuda
            else if(msg.status == 404){ 
                //alert(msg.error.error);
                this.showToast('info', 'Info!', msg.error.error);
                this.mostrar = true;
            }
            

         }
       );
  }



}
