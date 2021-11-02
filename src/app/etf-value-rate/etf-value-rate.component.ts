import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs'
import { Router, ActivatedRoute, ParamMap } from '@angular/router';;
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';


@Component({
  selector: 'app-etf-value-rate',
  templateUrl: './etf-value-rate.component.html',
  styleUrls: ['./etf-value-rate.component.css']
})
export class EtfValueRateComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts
  subscription: Subscription
  etfValues: Array<any>
  currencyRates: Array<any>
  combinedArray: Array<any>


  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router, ) { }

  private setChart(series) {
    //console.log('setChart', series)

    Highcharts.chart('chart', {
      title: {
          text: null
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      yAxis: [{
        tickInterval: 0.5,
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
      xAxis: {
          type: "datetime",
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
      tooltip: {
        formatter: function () {
          const Y = this.y
          const X = new Date(this.x).toISOString().substring(0, 10)
          const rate = this.point.name
          return `[${X}] ${rate}, ${Y}%`
        }
      },
      legend: {
          enabled: true
      },
      series: series
    })
  }

  ngOnInit() {
    //@@@multiple
    this.route.params.subscribe(params => {
        let symbols = params['symbols']
        let date = params['date']
        let today = new Date().toISOString().substring(0,10)
        console.log('symbols', symbols)
        let scope = symbols.split(',').map(s => s.split(':'))
        console.log('scope', scope)
        console.log('date', date)
        console.log('today', today)
        this.subscription = combineLatest(
          [
            this.api.tfivaluesDate$(scope[0][0],date), //SWDA.LSE
            this.api.getCurrencyRates$(scope[0][1], date, today) //GBP
          ]
        ).subscribe(([etfValues, currencyRates]) => {
            let etfValuesData = []
            let ratesData = []
            let valuesXData = []

            this.etfValues = etfValues
            this.currencyRates = currencyRates
            let rate0 = currencyRates.rates[0].mid
            let valueX0 = Math.round(etfValues[0].data[0][1] * rate0 *100)/100
            //@@@multiple: GBP, EUR
            this.combinedArray = etfValues[0].data.map(e => {
                let date = e[3].substring(0,10)
                let rates = currencyRates.rates.filter(r => r.effectiveDate <= date)
                let rate = rates[rates.length-1].mid
                let valueX = Math.round(e[1] * rate *100)/100

                //ETF values
                let date2 = new Date(e[3])
                let index = etfValuesData.findIndex(e => e.x == date2)
                if (index == -1) etfValuesData.push({
                  x: date2,
                  y: e[2],
                  name: e[1]
                })
                //rates
                index = ratesData.findIndex(e => e.x == date2)
                if (index == -1) ratesData.push({
                  x: date2,
                  y: Math.round( (rate-rate0)/rate0 * 100 * 100)/100,
                  name: rate
                })
                //ETF Value * rate
                index = valuesXData.findIndex(e => e.x == date2)
                if (index == -1) valuesXData.push({
                  x: date2,
                  y: Math.round( (valueX-valueX0)/valueX0 * 100 * 100)/100,
                  name: valueX
                })

                return {
                  date: date,
                  valueEtf: e[1],
                  changeEtf: e[2],
                  valueRate: rate,
                  changeRate: Math.round( (rate-rate0)/rate0 * 100 * 100)/100,
                  valueX: valueX,
                  changeX: Math.round( (valueX-valueX0)/valueX0 * 100 * 100)/100
                }
            })

            //data for chart
            let chartLines: Array<any> = []
            chartLines.push( {
                name: scope[0][0],//'IS3N.XETRA',//'SWDA.LSE',
                data: etfValuesData,
                marker: {enabled: false},
                lineWidth: 1,
                color: 'blue'
            } )
            chartLines.push( {
                name: scope[0][1],//'EUR',//'GBP',
                data: ratesData,
                marker: {enabled: false},
                lineWidth: 1,
                color: 'green'
            } )
            chartLines.push( {
                name: scope[0][0]+'x'+scope[0][1], //IS3N.XETRAxEUR',//'SWDA.LSExGBP',
                data: valuesXData,
                marker: {enabled: false},
                lineWidth: 1,
                color: 'red'
            } )
            //set chart
            this.setChart(chartLines)
            //console.log(chartLines)
        })

    })
  }

}
