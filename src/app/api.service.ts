import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    console.log('perform$()')
    return this.http.get('/perform')
  }

  fundsData$(): Observable<any> {
    return this.http.get(`/api/funds/data`);
  }

  cbondsData$(date): Observable<any> {
    return this.http.get(`/api/cbonds/calculate/${date}`);
  }
  // tficalclr$(symbol): Observable<any> {
  //   return this.http.get(`/api/tfi/calclr/${symbol}`);
  // }
}
