import { Injectable } from '@angular/core';

@Injectable()
export class Utils {
  public CONST_ONE_DAY = 24*60*60*1000
  public CONST_ONE_YEAR = 365 * this.CONST_ONE_DAY
  public CONST_THRESHOLD_LRA = 3.0 / this.CONST_ONE_YEAR //=3% per year

  getLRAPercent(a: number) {
      return Math.round(a * this.CONST_ONE_YEAR * 100) / 100
  }
  //#https://realtimelogic.com/articles/Creating-SinglePage-Apps-with-the-Minnow-Server
  httpToWs() {
      const l = window.location;
      let wsURL = '';
      // Start by working out if the calling URL was secure or not.
      if (l.protocol === 'https:') {
          wsURL = wsURL.concat('wss://');
      } else {
          wsURL = wsURL.concat('ws://');
      }
      // Concatenate the hostname onto the URL.
      wsURL = wsURL.concat(l.hostname.replace("b4a.app", "b4a.io"));

      // Now process any non-standard port numbers.
      if  (l.port !== "80" && l.port !== "443" && l.port.length !== 0) {
          let port = (l.port === "4200") ? "8080" : l.port
          wsURL = wsURL.concat(':' + port);
      }
      // Now add in anything left in the way of a path part of the URL.
      wsURL = wsURL.concat(l.pathname);
      // Return the WebSocket URL we have created.
      return(wsURL);
  };


  calcLR(series) {
    let avg = {
        x: Math.round(series.reduce((total, item) => total+item[0], 0) / series.length * 100) / 100,
        y: Math.round(series.reduce((total, item) => total+item[1], 0) / series.length * 100) / 100
    }
    let sumCounter = series.reduce((total, item) => total + (item[0] - avg.x)*(item[1] - avg.y), 0)
    let sumDenominator = series.reduce((total, item) => total + Math.pow( (item[0] - avg.x), 2), 0)
    let a = sumCounter / sumDenominator
    let lr = {
        a: a,
        b: avg.y - a * avg.x
    }
    return lr
  }
}


//---------------------------OLD
// return lr

// trendSeries = {
//     name: 'LR-'+series.name,
//     data: series.map(item => [
//         item[0],
//         Math.round( (this.lr.a * item[0] + this.lr.b)*100)/100
//     ])
// }

// //difference between value and trend
// // series.push({
// //   name: 'DIFF-'+item.symbol,
// //   data: item.data.map(item => [
// //       item[0],
// //       Math.round( 100* 100*(item[1] - (this.lr.a * item[0] + this.lr.b)) / item[1] ) / 100
// //   ])
// // })
// //})
// return trendSeries
