import { NgModule } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';

import { ThemeModule } from '../../@theme/theme.module';
import { MiDashboardComponent } from './mi-dashboard.component';
import { StatusCardComponent } from './status-card/status-card.component';


//Mis imports
import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';
import { ToasterModule } from 'angular2-toaster';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartModule } from 'angular2-chartjs';

import { ChartjsBarComponent } from './chartjs-mouvers/chartjs-bar.component';
import { ChartjsLineComponent } from './chartjs-mouvers/chartjs-line.component';
import { ChartjsPieComponent } from './chartjs-mouvers/chartjs-pie.component';
import { ChartjsMultipleXaxisComponent } from './chartjs-mouvers/chartjs-multiple-xaxis.component';
import { ChartjsBarHorizontalComponent } from './chartjs-mouvers/chartjs-bar-horizontal.component';
import { ChartjsRadarComponent } from './chartjs-mouvers/chartjs-radar.component';

import { EchartsLineComponent } from './echarts-mouvers/echarts-line.component';
import { EchartsPieComponent } from './echarts-mouvers/echarts-pie.component';
import { EchartsBarComponent } from './echarts-mouvers/echarts-bar.component';
import { EchartsMultipleXaxisComponent } from './echarts-mouvers/echarts-multiple-xaxis.component';
import { EchartsAreaStackComponent } from './echarts-mouvers/echarts-area-stack.component';
import { EchartsBarAnimationComponent } from './echarts-mouvers/echarts-bar-animation.component';
import { EchartsRadarComponent } from './echarts-mouvers/echarts-radar.component';

@NgModule({
  imports: [
    NgxChartsModule,
    ChartModule,
    ThemeModule,
    NgxEchartsModule,
    ToasterModule,
    LoadingModule.forRoot({
        animationType: ANIMATION_TYPES.chasingDots,
        backdropBackgroundColour: 'rgba(0,0,0,0.5)', 
        backdropBorderRadius: '4px',
        primaryColour: '#ffffff', 
        secondaryColour: '#ffffff', 
        tertiaryColour: '#ffffff',
        fullScreenBackdrop: false
    }),
  ],
  declarations: [
    MiDashboardComponent,
    StatusCardComponent,

    ChartjsBarComponent,
    ChartjsLineComponent,
    ChartjsPieComponent,
    ChartjsMultipleXaxisComponent,
    ChartjsBarHorizontalComponent,
    ChartjsRadarComponent,
    EchartsLineComponent,
    EchartsPieComponent,
    EchartsBarComponent,
    EchartsMultipleXaxisComponent,
    EchartsAreaStackComponent,
    EchartsBarAnimationComponent,
    EchartsRadarComponent,
  ],
})
export class MiDashboardModule { }
