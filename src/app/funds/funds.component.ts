import { Component, OnInit} from '@angular/core';
import { Subscription } from 'rxjs'
import { ApiService } from '../api.service';

import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-funds',
  templateUrl: './funds.component.html',
  styleUrls: ['./funds.component.css']
})
export class FundsComponent implements OnInit {

  monthlyArrOBL: Array<any> = []
  monthlyArrAKC: Array<any> = []
  pivotArr: Array<any> = [[]]
  uniqueDates: Array<any>
  uniqueFunds: Array<any>
  fundsLOValuesAKC: Array<any>
  fundsLOValuesOBL: Array<any>

  trailingStop: Array<any> = [] //###temp

  funds: Array<any>
  dicts: Array<any>

  Highcharts: typeof Highcharts = Highcharts
  HighchartsAKC: typeof Highcharts = Highcharts
  HighchartsTS: typeof Highcharts = Highcharts
  HighchartsLO_OBL: typeof Highcharts = Highcharts
  HighchartsLO_AKC: typeof Highcharts = Highcharts

  total: number = 0
  totalNet: number = 0

  reloadButtonLabel = 'Reload'
  refreshButtonLabel = 'Refresh'

  constructor(private api: ApiService) {}

  private setChartLO(id, title, series, yAxisTickInterval) {
    Highcharts.chart(id, {
      title: {
          text: title
      },
      chart: {
          height: '30%',
          zoomType: 'x',
          type: 'line'
      },
      yAxis: [{
        tickInterval: yAxisTickInterval,
        alternateGridColor: 'rgb(250,250,250)'
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


  private setChartTS(series) {
    Highcharts.chart('chartTS', {
      title: {
          text: 'Trailing stop'
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      yAxis: {
        tickInterval: 0.5,
      },
      xAxis: {
          type: 'datetime',
          tickInterval: 30 * 24 * 3600 * 1000,
          gridLineWidth: 1
      },
      legend: {
          enabled: true
      },
      series: series
    })
  }

  private setChartOBL(series) {
    Highcharts.chart('chart', {
      title: {
          text: 'Bonds'
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      yAxis: [{
        tickInterval: 0.5,
        alternateGridColor: 'rgb(250,250,250)'
      },
      {
        linkedTo: 0,
        opposite: true
      }],
      xAxis: {
          type: 'datetime',
          tickInterval: 30 * 24 * 3600 * 1000,
          gridLineWidth: 1,
          //alternateGridColor: 'rgb(250,250,250)'
          // labels: {
          //     format: '{value:%Y-%m-%d}'
          // }
      },

      legend: {
          enabled: true
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
          text: 'Stocks'
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      yAxis: [{
        tickInterval: 1.0,
        alternateGridColor: 'rgb(250,250,250)'
      },
      {
        linkedTo: 0,
        opposite: true
      }],
      xAxis: {
          type: 'datetime',
          tickInterval: 30 * 24 * 3600 * 1000,
          gridLineWidth: 1
      },
      legend: {
          enabled: true
      },
      series: series
  })
  }

  getFundAolUrl(symbol) {
      return this.dicts.filter(f => f.symbol===symbol)[0].aolurl
  }

  reload() {
      this.reloadButtonLabel = 'Reloading...'
      this.api.perform$().subscribe(val =>
          setTimeout( () =>
              location.reload(),
              4000)
        )
  }

  ngOnInit() {
      this.api.fundsData$().subscribe(results => {

        //bonds
        this.dicts = results.dict
        let chartDataOBL = results.chartDataOBL

        console.log('results.monthlyArrOBL', results.monthlyArrOBL)
        console.log('results.chartDataOBL', results.chartDataOBL)

        this.setChartOBL(chartDataOBL)
        this.monthlyArrOBL = results.monthlyArrOBL

        //shares
        let chartDataAKC = results.chartDataAKC
        this.setChartAKC(chartDataAKC)
        this.monthlyArrAKC = results.monthlyArrAKC

        //trailing stop
        this.setChartTS(results.trailingStop)
        // console.log(results.fundsLOValuesOBL)
//this.trailingStop = results.trailingStop
        //console.log(results.fundsLastMonth)
        this.fundsLOValuesOBL = results.fundsLOValuesOBL//fundsLOValues.filter(el => el.type === 'OBL')
        this.fundsLOValuesAKC = results.fundsLOValuesAKC//fundsLOValues.filter(el => el.type === 'AKC')

        this.setChartLO('chartLO_OBL', 'Bonds -2%', this.fundsLOValuesOBL, 0.25)
        this.setChartLO('chartLO_AKC', 'Stocks -7%', this.fundsLOValuesAKC, 1.0)

        // setTimeout(
        //   () => window.dispatchEvent(new Event('resize')),
        //   150
        // )

      })
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

//OLD-------------------------------------------------------------
// ngOnInit[---ORY---]() {
//   this.subscription = combineLatest(
//       this.api.dicts$(),
//       this.api.funds$(),
//       this.api.investments$()
//   ).subscribe(([dicts, funds, investments]) => {
// // console.log('funds', funds)
// // console.log('investments', investments)
//       this.dicts = dicts
//       this.funds = funds.map(item => {
//           return {
//               symbol: item.symbol,
//               date: item.date,
//               value: item.value
//           }
//       })

//       //chart array
//       let chartDataOBL = []
//       investments.filter(inv => inv.type ==='OBL' && (inv.dateEnd === null || inv.dateEnd === undefined)).forEach(inv => {
//           chartDataOBL.push(this.processInvestment(inv, this.monthlyArrOBL))
//       })

//       let chartDataLR = []
//       chartDataOBL.forEach(fundSeries => chartDataLR.push(this.fLR(fundSeries)))
//       chartDataLR.forEach(lr => chartDataOBL.push(lr))

//       this.setChartOBL(chartDataOBL)

//       // console.log('chartData', chartData)
//       this.pivotTable(this.monthlyArrOBL)

//       //chart array
//       let chartDataAKC = []
//       investments.filter(inv => inv.type ==='AKC' && (inv.dateEnd === null || inv.dateEnd === undefined)).forEach(inv => {
//         chartDataAKC.push(this.processInvestment(inv, this.monthlyArrAKC))
//       })
//       this.setChartAKC(chartDataAKC)
//       //this.pivotTable(this.monthlyArrAKC)

//       //https://stackoverflow.com/questions/16330237/highcharts-full-width-issue/36158314

//   })
// }

// private processInvestment(investment, monthlyArr) {
//   let obs = []
//   let lastObs
//   let arr = this.funds
//       .filter( fund => fund.symbol === investment.symbol && new Date(fund.date).getTime() >= new Date(investment.dateStart).getTime() )
//       .sort( (a, b) => {
//           return new Date(a.date).getTime() - new Date(b.date).getTime()
//       })
//       .map((fund, index, array)=> {
//           //A. monthly table
//           //(1) choose obsevations dates
//           if (index === 0) {
//               lastObs = fund
//               obs.push(lastObs)
//           } else {
// // console.log('fund.date', fund.date, 'lastObs.date', lastObs.date)
//               if (new Date(fund.date).getMonth() !== new Date(lastObs.date).getMonth() && new Date(lastObs.date).getTime() !== new Date(obs[obs.length-1].date).getTime()) {
// // console.log('push')
//                   obs.push(lastObs)
//               }
//               lastObs = fund
//               if (index === array.length-1) {
//                   obs.push(fund)
//               }
//           }

//           //B. percentage change
//           return [
//               new Date(fund.date).getTime(),
//               Math.round( (fund.value - array[0].value)/array[0].value * 100 * 100 ) / 100, //versus first (start date)
//               // index===0 ? 0 : Math.round( (fund.value - arr[index-1].value)/arr[index-1].value * 100 * 100 ) / 100, //versus previous date
//               fund.value
//           ]
//       })

//       //(2) calculate monthly table
//      //console.log('investment.symbol', investment.symbol)
//       this.setTable(investment, obs, monthlyArr)

//   return {
//       name: investment.symbol,
//       marker: {
//         enabled: false,
//         symbol: 'circle'
//       },
//       //color: this.fundColor(investment.symbol),
//     data: arr
// }
// }

// private setTable(investment, obs, monthlyArr) {
//   obs.map((item, index) => {
//       let cumWsp =  (item.value - obs[0].value)/obs[0].value * 100
//       let wsp = index>0 ?  (item.value - obs[index-1].value)/obs[index-1].value * 100 : 0.0
//       // return
//       /*this.*/monthlyArr.push({
//           ...item,
//           capital: investment.capital,
//           cumPercent: Math.round(cumWsp * 100)/100,
//           percent: Math.round(wsp * 100)/100,
//           cumInterests: Math.round(cumWsp/100 * investment.capital * 100)/100,
//           interests:  Math.round(wsp/100 * investment.capital * 100)/100
//       })
//   })
//   //this.monthlyArr.push(arr)
//   //console.log('arr', investment.symbol, arr)
// }


// private pivotTable(monthlyArr) {
//   this.uniqueDates = [...new Set(/*this.*/monthlyArr.sort( (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(item => this.dateFormat(item.date)))]
//   this.uniqueFunds = [...new Set(/*this.*/monthlyArr.sort( (a, b) => a.symbol >= b.symbol ? 1 : -1).map(item => item.symbol ))]

// // console.log(this.uniqueDates)

//   this.uniqueFunds.forEach((ufund, r) => {
//       this.pivotArr[ufund] = []
//       this.pivotArr['SUM'] = []
//       this.uniqueDates.forEach((udate, c) => {
//           this.pivotArr[ufund][udate] = []
//           this.pivotArr['SUM'][udate] = 0.0
//       })
//       this.pivotArr[ufund]['SUM']= 0.0
//       this.pivotArr[ufund]['SUMNET']= 0.0
//   })

//   //totals
//   this.total = 0
//   /*this.*/monthlyArr.forEach(item=> {
//       this.pivotArr[item.symbol][this.dateFormat(item.date)].push(item)
//       this.pivotArr['SUM'][this.dateFormat(item.date)] += item.interests
//       this.pivotArr[item.symbol]['SUM'] += item.interests

//       this.total += item.interests
//   })
//   // console.log('this.pivotArr', this.pivotArr)

//   //netto
//   this.totalNet = 0
//   this.uniqueFunds.forEach((ufund, r) => {
//       let interestsNet = this.pivotArr[ufund]['SUM'] * (this.pivotArr[ufund]['SUM'] > 0 ? CONST_TAX : 1)
//       this.pivotArr[ufund]['SUMNET'] = interestsNet
//       this.totalNet += interestsNet
//   })
// }

// fLR(series) {
//   // console.log(series)
//   let trendSeries
//   //series.forEach(item => {
//   let avg = {
//       x: Math.round(series.data.reduce((total, item) => total+item[0], 0) / series.data.length * 100) / 100,
//       y: Math.round(series.data.reduce((total, item) => total+item[1], 0) / series.data.length * 100) / 100
//   }
//   let sumCounter = series.data.reduce((total, item) => total + (item[0] - avg.x)*(item[1] - avg.y), 0)
//   let sumDenominator = series.data.reduce((total, item) => total + Math.pow( (item[0] - avg.x), 2), 0)
//   let a = sumCounter / sumDenominator
//   let lr = {
//       a: a,
//       b: avg.y - a * avg.x
//   }

//   trendSeries = {
//       name: 'LR-'+series.name+'/'+Math.round(lr.a*CONST_ONE_YEAR*100)/100+'%',
//       marker: {
//         enabled: false
//       },
//       color: 'lightgrey', //series.color
//       data: series.data.map(item => [
//           item[0],
//           Math.round( (lr.a * item[0] + lr.b)*100)/100
//       ])
//   }
//   return trendSeries

//       //difference between value and trend
//       // series.push({
//       //   name: 'DIFF-'+item.symbol,
//       //   data: item.data.map(item => [
//       //       item[0],
//       //       Math.round( 100* 100*(item[1] - (this.lr.a * item[0] + this.lr.b)) / item[1] ) / 100
//       //   ])
//       // })
//   //})
// }

// private dateFormat(date) {
//   return new Date(date).toISOString().substring(0,10)
// }

// private fundColor(symbol) {
//   let color
//   switch (symbol) {
//       case 'NN-OBL': color = 'orange'; break;
//       case 'SAN-OBLP': color = 'green'; break;
//       case 'SAN-OBL': color = 'green'; break;
//       case 'PEK-OBL': color = 'red'; break;
//       case 'SKB-OBL': color = 'grey'; break;
//       default: 'lightgrey'
//   }
//   return color;
// }

// subscription: Subscription

// const CONST_TAX = 0.81
// const CONST_ONE_DAY = 24*60*60*1000
// const CONST_ONE_YEAR = 365 * CONST_ONE_DAY

// ngOnDestroy() {
//   if (this.subscription) this.subscription.unsubscribe()
// }
