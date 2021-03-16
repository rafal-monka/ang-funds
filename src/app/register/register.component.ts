import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';
import { TFI_all } from '../tfismeta/tfi-all.js';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  subscription: Subscription
  Highcharts: typeof Highcharts = Highcharts

  unique_registers: Array<any>
  groupedUR: Array<any> = [[]]
  groupedArr: Array<any> = [[]]

  message: any
  fundClasses : Array<any> = ['A','B','C']

  loading: Boolean

  //line of defence
  lineOfDefence: Array<any> = [[]]

  constructor(private api: ApiService) { }

  private setChart(chartID, series) {
    Highcharts.chart(chartID, {
      title: {
          text: null
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      yAxis: [{
        tickInterval: 0.5,
        alternateGridColor: 'rgb(250,250,250)',
        plotBands: [{
          from: 0,
          to: 200,
          color: 'rgba(0, 255, 0, 0.1)'
        },{
          from: -100,
          to: 0,
          color: 'rgba(255, 0, 0, 0.1)'
        }]
      },
      {
        linkedTo: 0,
        opposite: true
      }],
      xAxis: {
          type: 'datetime',
          tickInterval: 30 * 24 * 3600 * 1000,
          gridLineWidth: 1,
      },

      legend: {
          enabled: true
      },
      series: series
    })
  }

  private setChartLO(chartID, title, series, yAxisTickInterval) {
    Highcharts.chart(chartID, {
      title: {
          text: title
      },
      chart: {
          //height: '50%',
          zoomType: 'x',
          type: 'line'
      },
      yAxis: [{
        tickInterval: yAxisTickInterval,
        alternateGridColor: 'rgb(250,250,250)',
        plotBands: [{
          from: 0,
          to: 200,
          color: 'rgba(0, 255, 0, 0.1)'
        },{
          from: -100,
          to: 0,
          color: 'rgba(255, 0, 0, 0.1)'
        }]
      },
      {
        linkedTo: 0,
        opposite: true
      }],
      xAxis: {
          type: 'datetime',
          tickInterval: 1 * 24 * 3600 * 1000,
          gridLineWidth: 1
      },
      legend: {
          enabled: true
      },
      series: series
    })
  }

  ngOnInit() {
      const URL_ANALIZY_ONLINE = 'https://www.analizy.pl'
      const PIVOT_TABLE_PERIOD = 'M' //default monhtly

      this.loading = true
      this.message = "Fetching data...please wait"
      this.subscription = combineLatest(
          this.api.getRegisters$(PIVOT_TABLE_PERIOD)
      ).subscribe(([registers]) => {
          if (registers.status !== 'OK') this.message = JSON.stringify(registers.error)

          this.message = "Processing..."
          //combine symbol with fund metadata
          this.unique_registers = registers.unique_registers.map(ur => {
              let tfi = TFI_all.find(item => item.symbol === ur.symbol)
              return {
                symbol: ur.symbol,
                name: ur.name,
                fundClass: ur.fundClass,
                aolurl: URL_ANALIZY_ONLINE+tfi.href,
                type: tfi.type
              }
          })
          //console.log(this.unique_registers)

          //set chart data and data for pivot table
          if (registers.chartSeries.length > 0) {
              //this.fundClasses = [...new Set(this.unique_registers.map(reg => reg.fundClass))].sort((a,b)=>a > b ? 1 : -1)

              for (let c=0; c < this.fundClasses.length; c++) {
                  //chart
                  let series = registers.chartSeries.filter(reg => reg.fundClass === this.fundClasses[c])
                  this.setChart('chart'+this.fundClasses[c], series)

                  //data for pivot table
                  this.groupedUR[c] = this.unique_registers.filter(reg => reg.fundClass === this.fundClasses[c])
                  this.groupedArr[c] = registers.groupedArr.filter(reg => reg.fundClass === this.fundClasses[c])

                  //line of defence
                  this.lineOfDefence[c] = registers.lineOfDefence.filter(reg => reg.fundClass === this.fundClasses[c])
                  this.setChartLO('chartLO'+this.fundClasses[c], 'Threshold '+this.lineOfDefence[c][0].threshold, this.lineOfDefence[c], 0.25)
              }
              this.message = ""
              this.loading = false
          } else {
              this.message = "No data"
          }
      })
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) this.subscription.unsubscribe()
  }

}
