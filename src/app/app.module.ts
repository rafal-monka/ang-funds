import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { FundsComponent } from './funds/funds.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { RoiComponent } from './roi/roi.component';
import { TfisComponent } from './tfis/tfis.component';
import { TfismetaComponent } from './tfismeta/tfismeta.component';
import { PivotTableComponent } from './components/pivot-table/pivot-table.component'
import { Utils } from './utils';

@NgModule({
   declarations: [
      AppComponent,
      NavBarComponent,
      FundsComponent,
      RoiComponent,
      TfisComponent,
      TfismetaComponent,
      PivotTableComponent
   ],
   imports: [
      BrowserModule,
      HttpClientModule,
      AppRoutingModule,
      FormsModule,
      HighchartsChartModule
   ],
   providers: [ Utils ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
