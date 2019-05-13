import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ChatBoxRoutingModule, routedComponents } from './chat-box-routing.module';

//Mis imports
import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';
import { ToasterModule } from 'angular2-toaster';

import { RelativeTimePipe2 } from '../../pipes/relative-time2/relative-time2';


@NgModule({
  imports: [
    ToasterModule,
    ThemeModule,
    ChatBoxRoutingModule,
    LoadingModule.forRoot({
        animationType: ANIMATION_TYPES.chasingDots,
        backdropBackgroundColour: 'rgba(0,0,0,0.5)', 
        backdropBorderRadius: '4px',
        primaryColour: '#ffffff', 
        secondaryColour: '#ffffff', 
        tertiaryColour: '#ffffff',
        fullScreenBackdrop: true
    })
  ],
  declarations: [
    ...routedComponents,
    RelativeTimePipe2
  ],
   providers: [

  ],
})
export class ChatBoxModule { }
