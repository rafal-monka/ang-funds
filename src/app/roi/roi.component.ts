import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs'
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';

const START_DATE = "2015-08-31"

@Component({
  selector: 'app-roi',
  templateUrl: './roi.component.html',
  styleUrls: ['./roi.component.css']
})
export class RoiComponent implements OnInit {

  periods : Array<any> = ['value',24,18,12,9,6,3,2,1]
  series2 : Array<any>
  datemin : string
  subscription: Subscription
  roi: any
  avg: any
  lr: any
  symbol: string
  Highcharts: typeof Highcharts = Highcharts
  Highcharts2: typeof Highcharts = Highcharts

  constructor(private api: ApiService) { }

  private setChart(series, periodIndex, period) {
    Highcharts.chart('chart', {
      title: {
          text: 'ROI-'+period
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      xAxis: {
          type: 'datetime',
      },
      legend: {
          enabled: true
      },
      series: series
    })
  }

  setChart2(symbol) {
    //console.log(symbol)
    //return
    Highcharts.chart('chart2', {
      title: {
          text: 'LR-value-diff%'
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      xAxis: {
          type: 'datetime',
      },
      legend: {
          enabled: true
      },
      series: this.series2//.filter(item=>item.name===symbol)
    })
  }

  setChartData(periodIndex, period) {
    let series = []
    this.series2 = []
    this.avg = []
    this.lr = []
    this.roi.forEach((item, fund) => {
        let data = item.data.filter(dataitem=> {
          //console.log(dataitem[0], dataitem[periodIndex], dataitem[periodIndex] !== null)
          return dataitem[periodIndex] !== null
        }).map(dataitem => [dataitem[0], dataitem[periodIndex], dataitem[1]])

        series.push({
            name: item.symbol,
            data: data
        })

        if (false) {
            this.avg[fund] = {
              symbol: item.symbol,
              val: Math.round(data.reduce((total, item) => total+item[1], 0) / data.length * 100) / 100,
              x: Math.round(data.reduce((total, item) => total+item[0], 0) / data.length * 100) / 100,
              y: Math.round(data.reduce((total, item) => total+item[1], 0) / data.length * 100) / 100
            }

            //trend
            let sumCounter = data.reduce((total, item) => total + (item[0] - this.avg[fund].x)*(item[1] - this.avg[fund].y), 0)
            let sumDenominator = data.reduce((total, item) => total + Math.pow( (item[0] - this.avg[fund].x), 2), 0)
            let a = sumCounter / sumDenominator
            this.lr[fund] = {
              a: a,
              b: this.avg[fund].y - a * this.avg[fund].x
            }

            series.push({
              name: 'LR-'+item.symbol,
              data: data.map(item => [
                item[0],
                Math.round( (this.lr[fund].a * item[0] + this.lr[fund].b)*100)/100
              ])
            })

            //diff % (value - avg) / value
            if (period==='value') {
                this.series2.push({
                    name: item.symbol,
                    data: data.map((item, index) => [
                        item[0],
                        Math.round( 100* 100*(data[index][2] - (this.lr[fund].a * item[0] + this.lr[fund].b)) / data[index][2] ) / 100
                    ])
                })
            } else {
                this.series2.length = 0
            }
        }
        // series2.push({
        //   symbol: item.symbol,
        //   data: data.map((item, index) => [
        //     item[0],
        //     Math.round( (this.lr[fund].a * item[0] + this.lr[fund].b)*100)/100
        //   ])
        // })

    })

    // this.avg.push({
    //   symbol: 'ALL',
    //   val: Math.round(this.avg.reduce((total, item) => total+item.val, 0) / this.avg.length * 100) / 100
    // })

    this.setChart(series, periodIndex, period)
// console.log(series2)
    this.setChart2(this.series2)
  }


  refreshData() {
    this.subscription = combineLatest(
      this.api.roi$(this.datemin),
    ).subscribe(([roi]) => {
        this.roi = roi
        this.setChartData(4, 12) //default 12 months (4th position)
    })
  }

  ngOnInit() {
    console.log('ngOnInit')
    this.datemin = START_DATE
    this.refreshData()
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) this.subscription.unsubscribe()
  }

}


// let data = [
//   {symbol: 'F1', data: [
//       [new Date("2020-08-01").getTime(), 10],
//       [new Date("2020-08-02").getTime(), 11],
//       [new Date("2020-08-03").getTime(), 12]
//     ]
//   },
//   {symbol: 'F2', data: [
//       [new Date("2020-08-01").getTime(), 20],
//       [new Date("2020-08-02").getTime(), 21],
//       [new Date("2020-08-03").getTime(), 22]
//     ]
//   }
// ]
