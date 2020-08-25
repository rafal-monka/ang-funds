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
  datemin : string
  subscription: Subscription
  roi: any
  avg: any
  lr: any
  Highcharts: typeof Highcharts = Highcharts

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

  setChartData(periodIndex, period) {
    let series = []
    this.avg = []
    this.lr = []
    this.roi.forEach((item, fund) => {
        let data = item.data.filter(dataitem=> {
          //console.log(dataitem[0], dataitem[periodIndex], dataitem[periodIndex] !== null)
          return dataitem[periodIndex] !== null
        }).map(dataitem => [dataitem[0], dataitem[periodIndex]])

        console.log('first', data[0], 'last', data[data.length-1])

        series.push({
            name: item.symbol,
            data: data
        })
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

    })

    this.avg.push({
      symbol: 'ALL',
      val: Math.round(this.avg.reduce((total, item) => total+item.val, 0) / this.avg.length * 100) / 100
    })
    this.setChart(series, periodIndex, period)
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
