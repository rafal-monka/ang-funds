import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-fund-monthly',
  templateUrl: './fund-monthly.component.html',
  styleUrls: ['./fund-monthly.component.css']
})
export class FundMonthlyComponent implements OnInit {
  subscription: Subscription
  Highcharts: typeof Highcharts = Highcharts
  chart1: any
  tfimetadata: Array<any>
  tfimonthly: Array<any>
  filterSymbols: String// = 'TFI6771,TFI8172,TFI112,TFI4562,TFI1,TFI4635,TFI616,TFI8344,TFI543,TFI167'
  filterDate: String  = new Date().toISOString().substring(0,10)
  period: String

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    console.log('ngOnInit')
    this.route.params.subscribe(params => {
//      console.log('symbols', symbols)
      this.filterSymbols = params['symbols']
      this.filterDate = params['date']
      this.period = params['period'] || 'M'
      this.refresh()
    })

  }

  refresh() {
    this.refreshData(this.filterSymbols, this.filterDate, this.period)
  }

  private setChart(series, period) {
    //console.log('setChart', title)


    Highcharts.chart('chart', {
      title: {
          text: 'By '+period
      },
      chart: {
          zoomType: 'x',
          type: 'column'
      },
      yAxis: [{
        tickInterval: 0.05
      }],
      xAxis: {
          // labels: {
          //   format: "{value:%Y %m}"
          // },
          //type: 'datetime',
          //tickInterval: (period === 'M' ? 30 : period === 'Y' ? 365 : 90) * 24 * 3600 * 1000,
          type: "datetime",
          labels: {
            formatter: function() {
              let format = (period === 'D' ? '%Y %b %e' : '%Y %b')
              return Highcharts.dateFormat(format, this.value) //https://api.highcharts.com/class-reference/Highcharts.Time
            }
          },
          startOnTick: true, //https://www.highcharts.com/forum/viewtopic.php?t=40059

          endOnTick: true,
          // tickPositioner: ,
          tickPosition: 'inside',
          minPadding:0.05,
          maxPadding:0.05,
          //offset: 40,
          alternateGridColor: 'rgb(240,240,240)',
          //gridLineWidth: 1
      },
      legend: {
          enabled: true
      },
      tooltip: {
        formatter: function () {
          const Y = this.y
          const X = new Date(this.x).toISOString().substring(0, (period === 'D' ? 10: 7))
          const name = this.point.series.name
          return `${name} [${X}] ${Y}%`
        }
      },
      series: series
    })
  }

  refreshData(filterSymbols, filterDate, period) {

    this.subscription = combineLatest(
        this.api.tfimeta$(filterSymbols),
        this.api.tfimonthly$(filterSymbols, filterDate, period)
    ).subscribe(([tfimetadata, tfimonthly]) => {
        this.tfimetadata = tfimetadata
        this.tfimonthly = tfimonthly
        this.tfimonthly.forEach((item, index) => {
          tfimonthly[index].name = tfimonthly[index].name+'|'+this.tfimetadata.filter(item => item.symbol === tfimonthly[index].name)[0].name
        })
        this.setChart(tfimonthly, period)
    })
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) this.subscription.unsubscribe()
  }
}
