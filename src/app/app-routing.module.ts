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

const routes: Routes = [
  { path: '', component: FundsComponent/*, canActivate: [AuthGuard]*/ },
  { path: 'roi', component: RoiComponent, canActivate: [AuthGuard] },
  { path: 'tfi/:symbol', component: TfisComponent, canActivate: [AuthGuard] },
  { path: 'tfi-meta', component: TfismetaComponent, canActivate: [AuthGuard] },
  { path: 'compare/:symbols/:date', component: FundCompareComponent/*, canActivate: [AuthGuard]*/ }
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
