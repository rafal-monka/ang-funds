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

  dataTotalClass: Array<any>
  dataTotalFund: Array<any>
  dataTotalTFI: Array<any>
  sumTotalCapital: number
  sumTotalValn: number
  sumTotalGain: number

  // sumTotalYClass: number
  // sumTotalY2Class: number
  // sumTotalYFund: number
  // sumTotalY2Fund: number

  message: any
  fundClasses : Array<any> = ['A','A+','B','C','D']

  loading: Boolean

  //line of defence
  lineOfDefence: Array<any> = [[]]

  constructor(private api: ApiService) { }

  private setPieChart(chartID, series) {
      Highcharts.chart(chartID, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Value'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>, {point.totalValn}/{point.totalCapital}'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                }
            }
        },
        series: series
    })
  }

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

      function calc(tot, sumTotalCapital, sumTotalValn, sumTotalGain) {
          return {
              name: (tot.fundClass!==undefined?'['+tot.fundClass+'] ':'')+tot.name,
              y:  tot.sumValn / sumTotalValn * 100,
              y2: tot.sumCapital / sumTotalCapital * 100,
              y3: (tot.sumValn-tot.sumCapital) / sumTotalGain * 100,
              sumValn:  tot.sumValn,
              sumCapital:  tot.sumCapital,
              gain:  Math.round( (tot.sumValn-tot.sumCapital) * 100)/100,
              yield:  Math.round( (tot.sumValn-tot.sumCapital)/tot.sumValn*100 * 100)/100,
          }
      }
      const URL_ANALIZY_ONLINE = 'https://www.analizy.pl'
      const PIVOT_TABLE_PERIOD = 'M' //default monhtly

      this.loading = true
      this.message = "Fetching data...please wait"
      this.subscription = combineLatest(
          [this.api.getRegisters$(PIVOT_TABLE_PERIOD)]
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
              //###DYNAMIC??? this.fundClasses = [...new Set(this.unique_registers.map(reg => reg.fundClass))].sort((a,b)=>a > b ? 1 : -1)

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

              //calculate total (gropued by 3 separete criteria: class, TFI, fund)
              let unique_TFI = [...new Set(this.unique_registers.map(item => item.name.substring(0, item.name.indexOf(' '))))]
              //add name
              registers.groupedArr = registers.groupedArr.map(item => ({
                ...item,
                name: this.unique_registers.find(ur => ur.symbol === item.symbol).name
              }))

              this.sumTotalValn = 0
              this.sumTotalCapital = 0
              this.sumTotalGain = 0
              let totalPositionsClass = this.fundClasses.map(item => ({name: item, y:0, sumCapital: 0, sumValn: 0}))
              let totalPositionsFund = this.unique_registers.map(item => ({...item, y:0, sumCapital: 0, sumValn: 0}))
// console.log(totalPositionsFund)
              let totalPositionsTFI = unique_TFI.map(item => ({name: item, y:0, sumCapital: 0, sumValn: 0}))
              registers.groupedArr.filter(reg => reg.date === "9999-12-31").forEach(position => {
                  let posClass = totalPositionsClass.find(tp => tp.name === position.fundClass)
                  let posFund = totalPositionsFund.find(tp => tp.symbol === position.symbol)
                  let posTFI = totalPositionsTFI.find(tp => tp.name === position.name.substring(0, position.name.indexOf(' ')))
                  posClass.sumCapital += position.capital
                  posClass.sumValn += position.valn

                  posFund.sumCapital += position.capital
                  posFund.sumValn += position.valn

                  posTFI.sumCapital += position.capital
                  posTFI.sumValn += position.valn

                  this.sumTotalCapital += position.capital
                  this.sumTotalValn += position.valn
                  this.sumTotalGain += (position.valn - position.capital)
              })

              //per class, fund, TFI
              this.dataTotalClass = totalPositionsClass.map(tot => calc(tot, this.sumTotalCapital, this.sumTotalValn, this.sumTotalGain)).sort( (a,b) => b.y - a.y)
              this.dataTotalFund = totalPositionsFund.map(tot => calc(tot,  this.sumTotalCapital, this.sumTotalValn, this.sumTotalGain)).sort( (a,b) => b.y - a.y)
              this.dataTotalTFI = totalPositionsTFI.map(tot => calc(tot,  this.sumTotalCapital, this.sumTotalValn, this.sumTotalGain)).sort( (a,b) => b.y - a.y)

//              console.log(dataTotalFund)

              let totalSeries = [{
                  name: 'Class',
                  type: 'pie',
                  center: [150, 150],
                  size: 120,
                  data: this.dataTotalClass
                },
                {
                  name: 'Fund',
                  type: 'pie',
                  center: [700, 150],
                  size: 200,
                  data: this.dataTotalFund
                },
                {
                  name: 'TFI',
                  type: 'pie',
                  center: [1300, 150],
                  size: 120,
                  data: this.dataTotalTFI
              }]

              this.setPieChart('totalValueChart', totalSeries)

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
