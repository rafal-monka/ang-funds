import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthGuard } from './auth/auth.guard';
import { InterceptorService } from './auth/interceptor.service';
import { FundsComponent } from './funds/funds.component'
import { RoiComponent } from './roi/roi.component'
import { TfisComponent } from './tfis/tfis.component'
import { TfismetaComponent } from './tfismeta/tfismeta.component'
import { FundCompareComponent } from './fund-compare/fund-compare.component'
import { OccasionPreviewComponent } from './occasion-preview/occasion-preview.component'
import { RegisterComponent } from './register/register.component';
import { AddRegisterComponent } from './register/add-register/add-register.component';
import { HeatMapComponent } from './heat-map/heat-map.component';

const routes: Routes = [
  { path: '', component: TfismetaComponent/*, canActivate: [AuthGuard]*/ },
  { path: 'register', component: RegisterComponent/*, canActivate: [AuthGuard]*/ },
  { path: 'register/add', component: AddRegisterComponent/*, canActivate: [AuthGuard]*/ },
  { path: 'roi', component: RoiComponent, canActivate: [AuthGuard] },
  { path: 'tfi/:symbol', component: TfisComponent, canActivate: [AuthGuard] },
  { path: 'funds', component: FundsComponent, canActivate: [AuthGuard] },
  { path: 'compare/:method/:symbols/:date/:period', component: FundCompareComponent/*, canActivate: [AuthGuard]*/ },
  { path: 'occasion/preview/:mode/:symbols', component: OccasionPreviewComponent/*, canActivate: [AuthGuard]*/ },
  { path: 'heatmap/:symbols/:date', component: HeatMapComponent/*, canActivate: [AuthGuard]*/ }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ]
})
export class AppRoutingModule { }
