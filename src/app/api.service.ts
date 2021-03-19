import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  dicts$(): Observable<any> {
    return this.http.get(`/api/dicts`);
  }

  funds$(): Observable<any> {
    return this.http.get(`/api/funds`);
  }

  investments$(): Observable<any> {
    return this.http.get(`/api/investments`);
  }

  roi$(datemin): Observable<any> {
    return this.http.get(`/api/rois/${datemin}`);
  }

  tfivalues$(symbol): Observable<any> {
    return this.http.get(`/api/tfi/values/${symbol}`);
  }

  tfivaluesDate$(symbol, date): Observable<any> {
    return this.http.get(`/api/tfi/values/${symbol}/${date}`);
  }

  tfimonthly$(symbols, date, period): Observable<any> {
    return this.http.get(`/api/calculate/monthly/values/${symbols}/${date}/${period}`);
  }

  tfimeta$(symbol): Observable<any> {
    return this.http.get(`/api/tfi/metadata/${symbol}`);
  }

  tfilook$(symbol): Observable<any> {
    return this.http.get(`/api/tfi/look/${symbol}`);
  }

  tfiupdate$(symbol): Observable<any> {
    return this.http.get(`/api/tfi/run/${symbol}`);
  }

  perform$(): Observable<any> {
    //console.log('perform$()')
    return this.http.get('/perform')
  }

  fundsData$(): Observable<any> {
    return this.http.get(`/api/funds/data`);
  }

  cbondsData$(date): Observable<any> {
    return this.http.get(`/api/cbonds/calculate/${date}`);
  }

  //###no longer used by GUI
  // pickOccasion$(symbol): Observable<any> {
  //   return this.http.get(`/api/robot/pick/${symbol}`);
  // }

  getOccasions$(mode, symbols): Observable<any> {
    return this.http.get(`/api/robot/occasions/${mode}/${symbols}`);
  }

  getOccasionsParamsConf$(mode): Observable<any> {
    return this.http.get(`/api/robot/occasions-params-conf/${mode}`);
  }

  getRegisters$(period): Observable<any> {
    return this.http.get(`/api/units/register/${period}/*`);
  }

  postRegisters$(object, type): Observable<any> {
      const headers = new HttpHeaders().set("Content-Type", "application/json");
      switch (type.toUpperCase()) {
          case 'P':
              return this.http.post(`/api/units/purchase`, object, {headers});
          case 'R':
              return this.http.post(`/api/units/redeem`, object, {headers});
      }
  }

  // tficalclr$(symbol): Observable<any> {
  //   return this.http.get(`/api/tfi/calclr/${symbol}`);
  // }
}
