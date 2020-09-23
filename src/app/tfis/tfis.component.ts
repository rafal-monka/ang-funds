import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs'
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';
import { Utils } from './../utils.js';

@Component({
  selector: 'app-tfis',
  templateUrl: './tfis.component.html',
  styleUrls: ['./tfis.component.css'],
  providers: [Utils]
})
export class TfisComponent implements OnInit {
  subscription: Subscription
  Highcharts: typeof Highcharts = Highcharts
  chart1: any
  chart2: any
  tfimeta: Array<any>
  symbol: String

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router, public utils: Utils) { }

  private setChart(series, title) {
    function afterSetExtremes(event) {
      Highcharts.charts[0].xAxis[0].setExtremes(event.min, event.max)
    }

    Highcharts.chart('chart', {
      title: {
          text: title
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      xAxis: {
          events: { afterSetExtremes: afterSetExtremes },
          type: 'datetime',
      },
      legend: {
          enabled: true
      },
      series: series
    })
  }

  private setChart2(series, title) {
    function afterSetExtremes(event) {
        Highcharts.charts[1].xAxis[0].setExtremes(event.min, event.max)
    }
    this.chart2 = Highcharts.chart('chart2', {
      title: {
          text: title
      },
      chart: {
          zoomType: 'x'//,
          //type: 'line'
      },
      xAxis: {
          events: { afterSetExtremes: afterSetExtremes },
          type: 'datetime',
      },
      legend: {
          enabled: true
      },
      series: series
    })
  }

  addTrend(name, series, lra, lrb) {
      let trendSeries = null
      if (lra !== undefined && lrb !== undefined) {
          trendSeries = {
              name: 'LR-'+name,
              color: 'red',
              data: series.map(item => [
                  item[0],
                  Math.round( (lra * item[0] + lrb)*100)/100
              ])
          }
      }
      return trendSeries
  }

  private addDiffeence(series) {
      //console.log('addDiffeence, series', series)
      let data = series[0].data.map((item, index) => [
          item[0],
          Math.round( (series[0].data[index][1] - series[1].data[index][1]) * 100) / 100 //percentage diff
      ])
      let diff = {
          name: 'DIFF',
          data: data,
          // chart: {
            type: 'column',
            color: 'grey'
          // },
      }
      return diff
  }

  setChartData(series, metadata) {
      let lr = this.addTrend(series[0].name, series[0].data, metadata.lra, metadata.lrb)
      if (lr != null) {
          series.push(lr)

          let diff = this.addDiffeence(series)
          let series2 = []
          series2.push(diff)

          let diff2lr = diff.data.filter((item, index) => index>=Math.max(0, diff.data.length-metadata.CONST_LAST_PERIOD))
          let lrdiff = this.addTrend('DIFF', diff2lr, metadata.diff_lra, metadata.diff_lrb)
          series2.push(lrdiff)

          this.setChart2(series2, 'Difference[%] a='+this.utils.getLRAPercent(metadata.diff_lra)/*+', b='+(Math.round(metadata.diff_lrb*100)/100)*/+' (last '+metadata.CONST_LAST_PERIOD+')')
      }
      this.setChart(series, 'Value [%] a='+this.utils.getLRAPercent(metadata.lra)/*+', b='+(Math.round(metadata.lrb*100)/100)*/+' (last '+metadata.CONST_LAST_PERIOD_VALUE+')')
  }

  refreshData(symbol) {
    this.subscription = combineLatest(
        this.api.tfimeta$(symbol),
        this.api.tfivalues$(symbol),
    ).subscribe(([tfimeta, tfivalues]) => {
        this.tfimeta = tfimeta
        let metadata = tfimeta.filter(item => item.symbol === symbol)

        //filter to given period
        tfivalues[0].data = tfivalues[0].data.filter((item, index) => {
            return index>=Math.max(0, tfivalues[0].data.length-metadata[0].CONST_LAST_PERIOD_VALUE)
        })
        //convert values to % diff
        tfivalues[0].data = tfivalues[0].data.map((item, index) => {
// if (index < 10) console.log(index, new Date(item[0]), item[1], 100*(item[1]-tfivalues[0].data[0][1])/tfivalues[0].data[0][1])
            return [
                item[0],
                Math.round(100*(item[1]-tfivalues[0].data[0][1])/tfivalues[0].data[0][1] * 100)/100
            ]
        })

        this.setChartData(tfivalues, metadata[0])
    })
  }

  ngOnInit() {
      console.log('ngOnInit')
      this.route.params.subscribe(params => {
          let symbol = params['symbol']
          console.log('symbol', symbol)
          this.refreshData(symbol)
      })
  }

  ngOnDestroy() {
      if (this.subscription !== undefined) this.subscription.unsubscribe()
  }
}


//----------------------OLD
// fLRBrowserOLD(series) {
//   // console.log(series)
//   let trendSeries
//   //series.forEach(item => {
//   let avg = {
//       x: Math.round(series.reduce((total, item) => total+item[0], 0) / series.length * 100) / 100,
//       y: Math.round(series.reduce((total, item) => total+item[1], 0) / series.length * 100) / 100
//   }
//   let sumCounter = series.reduce((total, item) => total + (item[0] - avg.x)*(item[1] - avg.y), 0)
//   let sumDenominator = series.reduce((total, item) => total + Math.pow( (item[0] - avg.x), 2), 0)
//   let a = sumCounter / sumDenominator
//   let lr = {
//       a: a,
//       b: avg.y - a * avg.x
//   }

//   return lr

//       trendSeries = {
//           name: 'LR-'+series.name,
//           data: series.map(item => [
//               item[0],
//               Math.round( (this.lr.a * item[0] + this.lr.b)*100)/100
//           ])
//       }

//       //difference between value and trend
//       // series.push({
//       //   name: 'DIFF-'+item.symbol,
//       //   data: item.data.map(item => [
//       //       item[0],
//       //       Math.round( 100* 100*(item[1] - (this.lr.a * item[0] + this.lr.b)) / item[1] ) / 100
//       //   ])
//       // })
//   //})
//   return trendSeries
// }
