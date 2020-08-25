import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, Subscription } from 'rxjs'
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';

// class Fund {
//   symbol: string
//   date: Date
//   value: number
// }

// class Investment {
//   symbol: string
//   dateStart: Date
//   capital: number
// }

const CONST_TAX = 0.81

@Component({
  selector: 'app-funds',
  templateUrl: './funds.component.html',
  styleUrls: ['./funds.component.css']
})
export class FundsComponent implements OnInit {

  subscription: Subscription
  monthlyArr: Array<any> = []
  pivotArr: Array<any> = [[]]
  uniqueDates: Array<any>
  uniqueFunds: Array<any>
  // funds$: Observable<any>
  funds: Array<any>
  dicts: Array<any>
  //chartData : any[]
  Highcharts: typeof Highcharts = Highcharts
  HighchartsAKC: typeof Highcharts = Highcharts
  total: number = 0

  constructor(private api: ApiService) {}

  private setTable(investment, obs) {
      obs.map((item, index) => {
          let cumWsp = Math.round( (item.value - obs[0].value)/obs[0].value * 100 * 100) / 100
          let wsp = index>0 ? Math.round( (item.value - obs[index-1].value)/obs[index-1].value * 100 * 100) / 100: 0.0
          // return
          this.monthlyArr.push({
              ...item,
              capital: investment.capital,
              cumPercent: cumWsp,
              percent: wsp,
              cumInterests: cumWsp>0 ? Math.round( CONST_TAX * cumWsp/100 * investment.capital * 100) / 100 : Math.round( cumWsp/100 * investment.capital * 100) / 100,
              interests:  wsp>0 ? Math.round(CONST_TAX * wsp/100 * investment.capital * 100) / 100 : Math.round(wsp/100 * investment.capital * 100) / 100
          })
      })
      //this.monthlyArr.push(arr)
      //console.log('arr', investment.symbol, arr)
  }

  private dateFormat(date) {
    return new Date(date).toISOString().substring(0,10)
  }

  private pivotTable() {
    this.uniqueDates = [...new Set(this.monthlyArr.sort( (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(item => this.dateFormat(item.date)))]
    this.uniqueFunds = [...new Set(this.monthlyArr.sort( (a, b) => a.symbol >= b.symbol ? 1 : -1).map(item => item.symbol ))]

console.log(this.uniqueDates)

    this.uniqueFunds.forEach((ufund, r) => {
        this.pivotArr[ufund] = []
        this.pivotArr['SUM'] = []
        this.uniqueDates.forEach((udate, c) => {
            this.pivotArr[ufund][udate] = []
            this.pivotArr['SUM'][udate] = 0.0
        })
        this.pivotArr[ufund]['SUM']= 0.0
    })

    //totals
    this.total = 0
    this.monthlyArr.forEach(item=> {
        this.pivotArr[item.symbol][this.dateFormat(item.date)].push(item)
        this.pivotArr['SUM'][this.dateFormat(item.date)] += item.interests
        this.pivotArr[item.symbol]['SUM'] += item.interests
        this.total += item.interests
    })
    // console.log('this.pivotArr', this.pivotArr)
  }

  private setChartOBL(series) {
    Highcharts.chart('chart', {
      title: {
          text: 'Percentage change vs start date (BONDS)'
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      xAxis: {
          type: 'datetime',
          // labels: {
          //     format: '{value:%Y-%m-%d}'
          // }
      },
      legend: {
          enabled: false
      },
      // tooltip: {
      //   formatter: function () {
      //     const date = new Date(this.x)
      //     const Y = date.getFullYear()
      //     const M = date.getMonth()+1
      //     const V = this.y
      //     return `${Y}-${M}: ${V} zł`
      //   }
      // },
      // series : [{
      //     data: this.chartData,
      //     type: 'line',
      //     point: {
      //       events: {
      //           //click: this.barClickedFunction.bind(this)
      //       }
      //   }
      // }]
      series: series
  })
  }

  private setChartAKC(series) {
    Highcharts.chart('chartAKC', {
      title: {
          text: 'Percentage change vs start date (SHARES)'
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      xAxis: {
          type: 'datetime',
      },
      legend: {
          enabled: false
      },
      series: series
  })
  }

  private processInvestment(investment) {
      let obs = []
      let lastObs
      let arr = this.funds
          .filter( fund => fund.symbol === investment.symbol && new Date(fund.date).getTime() >= new Date(investment.dateStart).getTime())
          .sort( (a, b) => {
              return new Date(a.date).getTime() - new Date(b.date).getTime()
          })
          .map((fund, index, array)=> {
              //A. monthly table
              //(1) choose obsevations dates
              if (index === 0) {
                  lastObs = fund
                  obs.push(lastObs)
              } else {
// console.log('fund.date', fund.date, 'lastObs.date', lastObs.date)
                  if (new Date(fund.date).getMonth() !== new Date(lastObs.date).getMonth() && new Date(lastObs.date).getTime() !== new Date(obs[obs.length-1].date).getTime()) {
// console.log('push')
                      obs.push(lastObs)
                  }
                  lastObs = fund
                  if (index === array.length-1) {
                      obs.push(fund)
                  }
              }

              //B. percentage change
              return [
                  new Date(fund.date).getTime(),
                  Math.round( (fund.value - array[0].value)/array[0].value * 100 * 100 ) / 100, //versus first (start date)
                  // index===0 ? 0 : Math.round( (fund.value - arr[index-1].value)/arr[index-1].value * 100 * 100 ) / 100, //versus previous date
                  fund.value
              ]
          })

          //(2) calculate monthly table
          //console.log('obs', investment.symbol, obs)
          this.setTable(investment, obs)

      return {
          name: investment.symbol,
          data: arr
      }
  }

  getFundAolUrl(symbol) {
      //console.log(this.dicts.filter(f => f.symbol===symbol))
      return this.dicts.filter(f => f.symbol===symbol)[0].aolurl
  }

  ngOnInit() {
      this.subscription = combineLatest(
          this.api.dicts$(),
          this.api.funds$(),
          this.api.investments$()
      ).subscribe(([dicts, funds, investments]) => {
// console.log('funds', funds)
// console.log('investments', investments)
          this.dicts = dicts
          this.funds = funds.map(item => {
              return {
                  symbol: item.symbol,
                  date: item.date,
                  value: item.value
              }
          })

          //chart array
          let chartDataOBL = []
          investments.filter(inv => inv.type ==='OBL').forEach(inv => {
            chartDataOBL.push(this.processInvestment(inv))
          })
          this.setChartOBL(chartDataOBL)

          // console.log('chartData', chartData)
          this.pivotTable()

          //chart array
          let chartDataAKC = []
          investments.filter(inv => inv.type ==='AKC').forEach(inv => {
            chartDataAKC.push(this.processInvestment(inv))
          })
          this.setChartAKC(chartDataAKC)
      })
  }

  ngOnDestroy() {
      if (this.subscription) this.subscription.unsubscribe()
  }
}


//---------------------------------------------------------
//--unused

// public getProperties(arr) {
//   return Object.getOwnPropertyNames(arr).map(item => {
//       return [
//           item,
//           arr[item]
//       ]
//   }).filter(item => item)
// }

// if (false) this.funds$.subscribe(res => {
//   // console.log('funds$', res)

//   //chart
//   let arr = []
//   res.map( item => {
//       if (arr[item.symbol] === undefined) arr[item.symbol] = []
//       arr[item.symbol].push({
//         date: new Date(item.date).getTime(),
//         value: item.value
//       })
//   })
//   // console.log('arr', arr, arr.length)

//   let arr2 = []
//   arr2 = this.getProperties(arr).filter((item, index) => index > 0).map(item => {
//       return {
//           name: item[0],
//           data: item[1].map(pos => [
//                 pos.date,
//                 Math.round( (pos.value - item[1][0].value)/item[1][0].value * 100 * 100 ) / 100
//           ])
//       }
//   })
//   // console.log('arr2', arr2)

//   this.setChart(arr2)

// })
