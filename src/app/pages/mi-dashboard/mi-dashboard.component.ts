import { Component, OnInit, OnDestroy } from '@angular/core';

// Mis imports
import { NbSpinnerService, NbThemeService } from '@nebular/theme';
import { NbJSThemeOptions } from '@nebular/theme/services/js-themes/theme.options';

import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { RutaBaseService } from '../../services/ruta-base/ruta-base.service';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-mi-dashboard',
  styleUrls: ['./mi-dashboard.component.scss'],
  templateUrl: './mi-dashboard.component.html',
})
export class MiDashboardComponent implements OnInit {

	items = [{ title: 'Profile' }, { title: 'Log out' }];

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

	data : any;
	data1 : any;
	data2 : any;
	data3 : any;
	data4 : any;
	data5 : any;
	data6 : any;
	data7 : any;

	themeSubscription: any;

	dias = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
	meses = [1,2,3,4,5,6,7,8,9,10,11,12];
	anios = [];

	diaActual: any;
	mesActual: any;
	anioActual: any;

	//Ventas por hora
	pedidosA = [];
	loadDiagram4 = false;
	diagram4 = false;
	radioModelD4 = 'left';
	diaD4: any;
	mesD4: any;
	anioD4: any;

	//Contadores
	count_1: any;
	count_2: any;
	count_3: any;
	count_4: any;

	public establecimiento_id = localStorage.getItem('mouvers_establecimiento_id');
  	public establecimiento_nom = localStorage.getItem('mouvers_user_nombre');
  	public mouvers_user_tipo = localStorage.getItem('mouvers_user_tipo');
	
	constructor(public themeService:NbThemeService,
				private toasterService: ToasterService,
				private http: HttpClient,
                private router: Router,
                private rutaService: RutaBaseService
				){

		this.count_1 = 'Consultando.....';
		this.count_2 = 'Consultando.....';
		this.count_3 = 'Consultando.....';
		this.count_4 = 'Consultando.....';

		var fecha = new Date();
		//var fecha = Date.now();
		this.diaActual = fecha.getDate();
		this.mesActual = fecha.getMonth() + 1;
		this.anioActual = fecha.getFullYear();

		this.anios.push(this.anioActual);
		for (var i = 1; i < 5; i++) {
			this.anios.push(this.anioActual - i);
		}

		this.diaD4 = this.diaActual;
		this.mesD4 = this.mesActual;
		this.anioD4 = this.anioActual;


		//console.log(this.diaActual+'-'+this.mesActual+'-'+this.anioActual);

		

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
	    
		//this.themeService.changeTheme('cosmic');
		this.themeService.changeTheme('default');

		this.getContadores();
		setTimeout(()=>{

			this.getDiagram4();

		},5);

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

	//Obtener los contadores del dia
	getContadores() {

	    this.http.get(this.rutaService.getRutaApi()+'dashboard/contadores/establecimiento/'+this.establecimiento_id+'?token='+localStorage.getItem('mouvers_token'))
	       .toPromise()
	       .then(
	         data => { // Success
	           console.log(data);
	           this.data=data;
	           this.count_1 = this.data.pedidos_curso;
	           this.count_2 = this.data.pedidos_finalizados;
	           this.count_3 = this.data.pagos_registrados;
	           if (!this.data.dinero_recaudado) {
	           	this.count_4 = 0;
	           }else{
	           	this.count_4 = this.data.dinero_recaudado;
	           }
	           

	         },
	         msg => { // Error
	           console.log(msg);
	           console.log(msg.error.error);

	           //token invalido/ausente o token expiro
	           if(msg.status == 400 || msg.status == 401){ 
	                //alert(msg.error.error);

	                this.showToast('warning', 'Warning!', msg.error.error);
	                setTimeout(()=>{
	                  this.router.navigateByUrl('/pagessimples/loginf');
	                },1000);
	                   
	            }else{
	            	this.showToast('info', 'Info!', 'Algo salió mal.');
	            }

	         }
	    );
	}

	//Obtener las ventas por hora
	getDiagram4() {

		if (this.radioModelD4 == 'left') {
			var dia = this.diaD4;
			var mes = this.mesD4;
			var anio = this.anioD4;
		}else{
			var dia = null;
			var mes = this.mesD4;
			var anio = this.anioD4;
		}

		this.diagram4 = false;
		this.loadDiagram4 = true;
		this.pedidosA = [];
	    this.http.get(this.rutaService.getRutaApi()+'dashboard/diagram4/establecimiento/'+this.establecimiento_id+'?dia='+dia+'&mes='+mes+'&anio='+anio+'&token='+localStorage.getItem('mouvers_token'))
	       .toPromise()
	       .then(
	         data => { // Success
	           console.log(data);
	           this.data3=data;
	           this.pedidosA = this.data3.pedidos;

	           this.loadDiagram4 = false;
	           
	           if (this.pedidosA.length > 0) {
	           	this.diagram4 = true;
	           }else{
	           	this.diagram4 = false;
	           }

	         },
	         msg => { // Error
	           console.log(msg);
	           console.log(msg.error.error);

	           this.loadDiagram4 = false;

	           //token invalido/ausente o token expiro
	           if(msg.status == 400 || msg.status == 401){ 
	                //alert(msg.error.error);

	                this.showToast('warning', 'Warning!', msg.error.error);
	                setTimeout(()=>{
	                  this.router.navigateByUrl('/pagessimples/loginf');
	                },1000);
	                   
	            }
	            //sin data
	            else if(msg.status == 404){ 
	                //alert(msg.error.error);
	                this.showToast('info', 'Info!', msg.error.error);
	            }
	            

	         }
	    );
	}


	/*
	loadDiagram1 = false;
	categorias = [];
	optionsD1: any;
	dataD1: any;
	labelsD1 = [];
	datosD1 = [];
	setDiagram1() {

		for (var i = 0; i < this.categorias.length; ++i) {
			this.labelsD1.push(this.categorias[i].nombre);
			this.datosD1.push(this.categorias[i].count_solicitados);
		}

	    this.themeSubscription = this.themeService.getJsTheme().subscribe(config => {

	      const colors: any = config.variables;
	      const chartjs: any = config.variables.chartjs;

	      this.dataD1 = {
	        labels: this.labelsD1,
	        datasets: [{
	          data: this.datosD1,
	          backgroundColor: [colors.primaryLight, colors.infoLight, colors.successLight],
	        }],
	      };

	      this.optionsD1 = {
	        maintainAspectRatio: false,
	        responsive: true,
	        scales: {
	          xAxes: [
	            {
	              display: false,
	            },
	          ],
	          yAxes: [
	            {
	              display: false,
	            },
	          ],
	        },
	        legend: {
	          labels: {
	            fontColor: chartjs.textColor,
	          },
	        },
	      };
	    });
	}

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }*/

}
