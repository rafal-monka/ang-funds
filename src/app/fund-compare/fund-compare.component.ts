import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription, Observable } from 'rxjs'
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';
import { Utils } from './../utils';

@Component({
  selector: 'app-fund-compare',
  templateUrl: './fund-compare.component.html',
  styleUrls: ['./fund-compare.component.css'],
  providers: [Utils]
})
export class FundCompareComponent implements OnInit {
  subscription: Subscription
  Highcharts: typeof Highcharts = Highcharts
  tfimetadata: Array<any>
  tficompared: Array<any>
  sumData: Array<any>
  // tfimeta2: Array<any>
  chartType: String
  filterSymbols: String
  filterDate: String  = new Date().toISOString().substring(0,10)
  period: String
  method: string
  whetherAddLR: Boolean
  mAShortTerm: number = 30
  mALongTerm: number = 100

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router, public utils: Utils) { }

  ngOnInit() {
    console.log('ngOnInit')
    this.route.params.subscribe(params => {
//      console.log('symbols', symbols)
      this.filterSymbols = params['symbols']
      this.filterDate = params['date']
      this.method = params['method']
      this.period = params['period']
      this.chartType = (['CHANGE','VALUE'].indexOf(this.method)>-1) ? 'line' : 'column'
      this.refresh()
    })

  }

  refresh() {
    this.refreshData(this.filterSymbols, this.filterDate, this.method, this.period)
  }

  private setChartFull(type, series) {
    Highcharts.chart('chart', {
      chart: {
          type: type,
          zooming: {
              type: 'xy'
          }
      },
      title: {
          text: '...'
      },
      series: series
    }
    )
  }

  private setChart(series, period, type) {
    //console.log('setChart', series)

    Highcharts.chart('chart', {
      title: {
          text: null
      },
      chart: {
          zooming: {
              type: 'x'
          },
          type: type
      },
      yAxis: [{
        tickInterval: 0.05,
        plotBands: [{
          from: 0,
          to: 200,
          color: 'rgba(0, 255, 0, 0.1)'
        },{
          from: -100,
          to: 0,
          color: 'rgba(255, 0, 0, 0.1)'
        }]
      }],
      xAxis: period === 'NA' ? {} : {
          // labels: {
          //   format: "{value:%Y %m}"
          // },
          //type: 'datetime',
          //tickInterval: (period === 'M' ? 30 : period === 'Y' ? 365 : 90) * 24 * 3600 * 1000,
          type: "datetime",
          /*labels: {
            formatter: function() {
              let format = (period === 'D' ? '%Y %b %e' : '%Y %b')
              return Highcharts.dateFormat(format, this.value) //https://api.highcharts.com/class-reference/Highcharts.Time
            }
          },*/
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

  refreshData(filterSymbols, filterDate, method, period) {

    //let includeCbonds = filterSymbols.indexOf('*') > -1
    // console.log('includeCbonds', includeCbonds)

    // let compDataQuery: Observable<Array<any>>
    // switch (method) {
    //     case 'CHANGE': compDataQuery = ; break;
    //     case 'AMPL': compDataQuery = this.api.compare$(filterSymbols, filterDate, period); break;
    // }

    let symbols = filterSymbols.split(',').map(item => {return {symbol: item}})
    // filter to given period
    let startDate = new Date(filterDate)

    switch (method) {
        case 'VALUE':
          this.subscription = combineLatest(
              this.api.tfimeta$(filterSymbols),
              this.api.tfivalues$(filterSymbols)
              //includeCbonds ? this.api.cbondsData$(filterDate) : new Promise(async function(resolve, reject) {resolve(null)})
              //this.api.tfimeta$(symbol2),
              //this.api.tfivalues$(symbol2),
          ).subscribe(([tfimetadata, tfivalues/*, tficompared , cbonds, tfimeta2, tfivalues2*/]) => {
              this.tfimetadata = tfimetadata
              let tfivaluesFullData = JSON.parse(JSON.stringify(tfivalues))

              tfivalues.forEach((item, index) => {
                tfivalues[index].symbol = tfivalues[index].name
                tfivalues[index].name = tfivalues[index].name+'|'+this.tfimetadata.filter(item => item.symbol === tfivalues[index].name)[0].name
              })

              //iterate
              symbols.forEach((element, index) => {
                // console.log('element', this.tfimetadata.filter(item => item.symbol === element.symbol))
                  try {
                    tfivalues[index].data = tfivalues[index].data.filter(item => {
                        return item[0] >= startDate
                    })
                  } catch (e) {
                      console.log('Error', element, e)
                  }
              })

              //add moving avarages
              let CONST_DAYS = [this.mAShortTerm, this.mALongTerm]
              let termArrDays = CONST_DAYS.map(item => item * 24*60*60*1000)

              tfivalues.forEach((item, tfi_ind) => {
                  //short term
                  tfivalues.push( {
                      name: 'MA-'+CONST_DAYS[0]+'-'+tfi_ind,
                      color: 'green',
                      data: tfivalues[tfi_ind].data.map((item, inx) => {
                          let prevArr = tfivaluesFullData[tfi_ind].data.filter(itemFull => ((itemFull[0] >= item[0]-termArrDays[0]) && (itemFull[0] <= item[0])) )
                          return [
                              item[0],
                              //item[1]*0.99
                              Math.round( prevArr.reduce((total, val) => total+val[1], 0) / prevArr.length * 100)/100
                          ]
                    })
                  })
                  //long term
                  tfivalues.push( {
                      name: 'MA-'+CONST_DAYS[1]+'-'+tfi_ind,
                      color: 'red',
                      data: tfivalues[tfi_ind].data.map((item, inx) => {
                          let prevArr = tfivaluesFullData[tfi_ind].data.filter(itemFull => ((itemFull[0] >= item[0]-termArrDays[1]) && (itemFull[0] <= item[0])) )
                          return [
                              item[0],
                              Math.round( prevArr.reduce((total, val) => total+val[1], 0) /prevArr.length * 100)/100
                          ]
                    })
                  })
              })

              this.setChart(tfivalues, period, this.chartType)
          })
          break;

        case 'CHANGE':
          this.subscription = combineLatest(
            this.api.tfimeta$(filterSymbols),
            this.api.tfivalues$(filterSymbols)
            //includeCbonds ? this.api.cbondsData$(filterDate) : new Promise(async function(resolve, reject) {resolve(null)})
            //this.api.tfimeta$(symbol2),
            //this.api.tfivalues$(symbol2),
          ).subscribe(([tfimetadata, tfivalues/*, tficompared , cbonds, tfimeta2, tfivalues2*/]) => {

            this.tfimetadata = tfimetadata

            tfivalues.forEach((item, index) => {
              tfivalues[index].symbol = tfivalues[index].name
              tfivalues[index].name = tfivalues[index].name+'|'+this.tfimetadata.filter(item => item.symbol === tfivalues[index].name)[0].name
            })

            //iterate
            symbols.forEach((element, index) => {
              // console.log('element', this.tfimetadata.filter(item => item.symbol === element.symbol))
                try {
                  tfivalues[index].data = tfivalues[index].data.filter(item => {
                      return item[0] >= startDate
                  })
                } catch (e) {
                    console.log('Error', element, e)
                }
            });

            //convert values to % diff
            symbols.forEach((element, index1) => {
                try {
                    tfivalues[index1].data = tfivalues[index1].data.map((item, index) => {
            // if (index < 10) console.log(index, new Date(item[0]), item[1], 100*(item[1]-tfivalues[0].data[0][1])/tfivalues[0].data[0][1])
                        return [
                            item[0],
                            Math.round(100*(item[1]-tfivalues[index1].data[0][1])/tfivalues[index1].data[0][1] * 100)/100
                        ]
                    })
                } catch (e) {
                    console.log('Error', element, e)
                }
            })

            //include cbonds (*)
            //if (includeCbonds) cbonds.forEach(cbond => tfivalues.push(cbond))

            //add trends
            if (this.whetherAddLR) symbols.map((element, index)=> {
                let data = tfivalues[index].data
                let trend_lr = this.utils.calcLR(data)
                //console.log(tfivalues[index].name, trend_lr)
                let y0 = Math.round( (trend_lr.a * data[0][0] + trend_lr.b) *100)/100
                let yn = Math.round( (trend_lr.a * data[data.length-1][0] + trend_lr.b) *100)/100

                let trend_lr_data = [{
                        x: data[0][0],
                        y: y0
                    },
                    {
                        x: data[data.length-1][0],
                        y: yn
                    }]

                let days = (data[data.length-1][0] - data[0][0])/this.utils.CONST_ONE_DAY
                tfivalues.push( {
                    name: 'LR-'+tfivalues[index].symbol+' '+Math.round( (yn-y0)/days *365 *100)/100+'%',
                    data: trend_lr_data,
                    marker: {enabled: false},
                    lineWidth: 1,
                    color: 'red'
                })
            })

            this.setChart(tfivalues, period, this.chartType)
          })
        break;

        case 'AMPL':
          this.subscription = combineLatest(
            this.api.tfimeta$(filterSymbols),
            this.api.compare$(filterSymbols, filterDate, period)
          ).subscribe(([tfimetadata, tfivalues]) => {
            let series = []
            this.tfimetadata = tfimetadata
            this.tficompared = tfivalues.chartData
            this.sumData = tfivalues.sumData

            this.tficompared.forEach(compared => series.push(compared))

            console.log(series)
            this.setChart(series, period, this.chartType)
          })
        break;

        case 'DAYS':
          this.subscription = combineLatest(
            this.api.tfimeta$(filterSymbols),
            this.api.daysOfMonth$(filterSymbols, filterDate)
          ).subscribe(([tfimetadata, daysOfMonth]) => {
            this.tfimetadata = tfimetadata
            let cum = daysOfMonth.daysOfMonth.map(fund => {
                return {
                  name: fund.name,
                  data: fund.data.map((item, index) => [
                      item[0],
                      item[1]//fund.data.reduce( (total, item, inx) => total + (inx <= index ? item[1]: 0.0), 0)
                  ])
                }
            })
            this.setChart(cum, 'NA', 'line')
            //this.setChartFull('scatter', daysOfMonth.dataByDays)
          })
          break;

          case 'DAYSAMM':
          this.subscription = combineLatest(
            this.api.tfimeta$(filterSymbols),
            this.api.daysOfMonth$(filterSymbols, filterDate)
          ).subscribe(([tfimetadata, daysOfMonth]) => {
            this.tfimetadata = tfimetadata
            let cum = daysOfMonth.daysOfMonthAMM.map(fund => {
                return {
                  name: fund.name,
                  data: fund.data.map((item, index) => [
                      item[0],
                      item[1]//fund.data.reduce( (total, item, inx) => total + (inx <= index ? item[1]: 0.0), 0)
                  ])
                }
            })
            this.setChart(cum, 'NA', 'line')
          })
          break;
    }

  }

  ngOnDestroy() {
    if (this.subscription !== undefined) this.subscription.unsubscribe()
  }
}
