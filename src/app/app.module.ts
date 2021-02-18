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
import { PivotTableLoComponent } from './components/pivot-table-lo/pivot-table-lo.component'
import { TableLoComponent } from './components/table-lo/table-lo.component'
import { Utils } from './utils';
import { FundCompareComponent } from './fund-compare/fund-compare.component';

@NgModule({
   declarations: [
      AppComponent,
      NavBarComponent,
      FundsComponent,
      RoiComponent,
      TfisComponent,
      TfismetaComponent,
      PivotTableComponent,
      PivotTableLoComponent,
      TableLoComponent,
      FundCompareComponent
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
