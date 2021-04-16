import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

import { NavBarComponent } from './nav-bar/nav-bar.component';
import { FundsComponent } from './funds/funds.component';
import { RoiComponent } from './roi/roi.component';
import { TfisComponent } from './tfis/tfis.component';
import { TfismetaComponent } from './tfismeta/tfismeta.component';
import { PivotTableComponent } from './components/pivot-table/pivot-table.component'
import { PivotTableLoComponent } from './components/pivot-table-lo/pivot-table-lo.component'
import { TableLoComponent } from './components/table-lo/table-lo.component'
import { TotalTableComponent } from './components/total-table/total-table.component'
import { Utils } from './utils';
import { FundCompareComponent } from './fund-compare/fund-compare.component';
import { OccasionPreviewComponent } from './occasion-preview/occasion-preview.component';
import { RegisterComponent } from './register/register.component';
import { AddRegisterComponent } from './register/add-register/add-register.component';
import { NgbModule  } from '@ng-bootstrap/ng-bootstrap';
import { HeatMapComponent } from './heat-map/heat-map.component';

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
      TotalTableComponent,
      FundCompareComponent,
      OccasionPreviewComponent,
      RegisterComponent, AddRegisterComponent,
      HeatMapComponent
   ],
   imports: [
      BrowserModule,
      HttpClientModule,
      AppRoutingModule,
      FormsModule,
      HighchartsChartModule,
      NgxJsonViewerModule,
      NgbModule
   ],
   providers: [ Utils ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
