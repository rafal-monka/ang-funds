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
  sumTotalCapital: number
  sumTotalValn: number
  sumTotalYClass: number
  sumTotalY2Class: number
  sumTotalYFund: number
  sumTotalY2Fund: number

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

              //total
              this.sumTotalValn = 0
              this.sumTotalCapital = 0
              let totalPositionsClass = this.fundClasses.map(item => ({name: item, y:0, totalCapital: 0, totalValn: 0}))
              let totalPositionsFund = this.unique_registers.map(item => ({...item, y:0, totalCapital: 0, totalValn: 0}))
              registers.groupedArr.filter(reg => reg.date === "9999-12-31").forEach(position => {
                  let posClass = totalPositionsClass.find(ureg => ureg.name === position.fundClass)
                  let posFund = totalPositionsFund.find(ureg => ureg.symbol === position.symbol)
                  posClass.totalCapital += position.capital
                  posClass.totalValn += position.valn

                  posFund.totalCapital += position.capital
                  posFund.totalValn += position.valn

                  this.sumTotalValn += position.valn
                  this.sumTotalCapital += position.capital
              })
              let totalClass = totalPositionsClass
              let totalFund = totalPositionsFund.sort((a,b) => (a.fundClass === b.fundClass) ? (b.totalValn - a.totalValn) : (a.fundClass > b.fundClass ? 1 : -1) )

              this.dataTotalClass = totalClass.map(tot => ({
                  name: tot.name,
                  y: Math.round( tot.totalValn / this.sumTotalValn * 100 * 100)/100,
                  y2: Math.round( tot.totalCapital / this.sumTotalCapital * 100 * 100)/100,
                  totalValn: Math.round( tot.totalValn * 100)/100,
                  totalCapital: Math.round( tot.totalCapital * 100)/100,
                  gain: Math.round( (tot.totalValn-tot.totalCapital) * 100)/100,
                  yield: Math.round( (tot.totalValn-tot.totalCapital)/tot.totalValn*100 * 100)/100,
              })).sort( (a,b) => b.y - a.y)
              this.sumTotalYClass = this.dataTotalClass.reduce((t,i)=>t+i.y,0)
              this.sumTotalY2Class = this.dataTotalClass.reduce((t,i)=>t+i.y2,0)

              this.dataTotalFund = totalFund.map(tot => ({
                name: tot.name,
                fundClass: tot.fundClass,
                y: Math.round( tot.totalValn / this.sumTotalValn * 100 * 100)/100,
                y2: Math.round( tot.totalCapital / this.sumTotalCapital * 100 * 100)/100,
                totalValn: Math.round( tot.totalValn * 100)/100,
                totalCapital: Math.round( tot.totalCapital * 100)/100,
                gain: Math.round( (tot.totalValn-tot.totalCapital) * 100)/100,
                yield: Math.round( (tot.totalValn-tot.totalCapital)/tot.totalValn*100 * 100)/100,
              })).sort( (a,b) => b.y - a.y)
              this.sumTotalYFund = this.dataTotalFund.reduce((t,i)=>t+i.y,0)

//              console.log(dataTotalFund)

              let totalSeries = [{
                  name: 'Class',
                  type: 'pie',
                  center: [300, 150],
                  size: 250,
                  data: this.dataTotalClass
                },
                {
                  name: 'Fund',
                  type: 'pie',
                  center: [1000, 150],
                  size: 250,
                  data: this.dataTotalFund
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
