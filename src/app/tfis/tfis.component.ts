import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs'
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';
import { Utils } from './../utils';

@Component({
  selector: 'app-tfis',
  templateUrl: './tfis.component.html',
  styleUrls: ['./tfis.component.css'],
  providers: [Utils]
})
export class TfisComponent implements OnInit {
  subscription: Subscription
  Highcharts: typeof Highcharts = Highcharts
  chart1: any
  chart2: any
  tfimeta: Array<any>
  symbol: String
  looks: any

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router, public utils: Utils) { }

  private setChart(series, title, tfiLooks) {
    console.log('tfiLooks', tfiLooks)


    function afterSetExtremes(event) {
      Highcharts.charts[0].xAxis[0].setExtremes(event.min, event.max)
    }

    Highcharts.chart('chart', {
      title: {
          text: title
      },
      chart: {
          zooming: {
              type: 'x'
          },
          type: 'line',
          events: {
            load: function() {
              var chart = this, points = chart.series[0].points

              //let lookDate = tfiLook ? new Date(tfiLook.lookDate).getTime() : null

              tfiLooks.forEach(tfiLook => {
                  let lookPoint = []
                  let lookDate = new Date(tfiLook.lookDate).getTime()
                  lookPoint = points.filter( point => point.x === lookDate)
                  console.log('lookPoint', lookPoint)
                  if (lookPoint.length>0) {
                      lookPoint[0].update({
                          marker: {
                            enabled: true,
                            symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)'
                          }
                      })
                  }

              });
            }
          }
      },
      xAxis: {
          events: { afterSetExtremes: afterSetExtremes },
          type: 'datetime',
      },
      legend: {
          enabled: true
      },
      series: series
    })

    //Highcharts.charts[1].series[0].addPoint([lookDate-5*24*60*60*1000, lookDate*tfiLook.lra+tfiLook.lrb])


  }

  private setChart2(series, title) {
    function afterSetExtremes(event) {
        Highcharts.charts[1].xAxis[0].setExtremes(event.min, event.max)
    }
    this.chart2 = Highcharts.chart('chart2', {
      title: {
          text: title
      },
      chart: {
          zooming: {
              type: 'x'
          }//,
          //type: 'line'
      },
      xAxis: {
          events: { afterSetExtremes: afterSetExtremes },
          type: 'datetime',
      },
      legend: {
          enabled: true
      },
      series: series
    })
  }

  addTrend(name, series, lra, lrb) {
      let trendSeries = null
      if (lra !== undefined && lrb !== undefined) {
          trendSeries = {
              name: 'LR-'+name,
              color: 'red',
              data: series.map(item => [
                  item[0],
                  Math.round( (lra * item[0] + lrb)*100)/100
              ])
          }
      }
      return trendSeries
  }

  private addDiffeence(series) {
      //console.log('addDiffeence, series', series)
      let data = series[0].data.map((item, index) => [
          item[0],
          Math.round( (series[0].data[index][1] - series[1].data[index][1]) * 100) / 100 //percentage diff
      ])
      let diff = {
          name: 'DIFF',
          data: data,
          // chart: {
            type: 'column',
            color: 'grey'
          // },
      }
      return diff
  }

  setChartData(series, metadata, tfiLooks) {
      let lr = this.addTrend(series[0].name, series[0].data, metadata.lra, metadata.lrb)
      if (lr != null) {
          series.push(lr)

          let diff = this.addDiffeence(series)
          let series2 = []
          series2.push(diff)

          let diff2lr = diff.data.filter((item, index) => index>=Math.max(0, diff.data.length-metadata.CONST_LAST_PERIOD))
          let lrdiff = this.addTrend('DIFF', diff2lr, metadata.diff_lra, metadata.diff_lrb)
          series2.push(lrdiff)

          this.setChart2(series2, 'Difference[%] a='+this.utils.getLRAPercent(metadata.diff_lra)/*+', b='+(Math.round(metadata.diff_lrb*100)/100)*/+' (last '+metadata.CONST_LAST_PERIOD+')')
      }
      this.setChart(series, 'Value [%] a='+this.utils.getLRAPercent(metadata.lra)/*+', b='+(Math.round(metadata.lrb*100)/100)*/+' (last '+metadata.CONST_LAST_PERIOD_VALUE+')', tfiLooks)
  }

  refreshData(symbol) {
    this.subscription = combineLatest(
        this.api.tfimeta$(symbol),
        this.api.tfivalues$(symbol),
        this.api.tfilook$(symbol)
    ).subscribe(([tfimeta, tfivalues, tfilooks]) => {
        this.tfimeta = tfimeta
        let metadata = tfimeta.filter(item => item.symbol === symbol)
        this.looks = tfilooks

        //filter to given period
        tfivalues[0].data = tfivalues[0].data.filter((item, index) => {
            return index>=Math.max(0, tfivalues[0].data.length-metadata[0].CONST_LAST_PERIOD_VALUE)
        })
        //convert values to % diff
        tfivalues[0].data = tfivalues[0].data.map((item, index) => {
// if (index < 10) console.log(index, new Date(item[0]), item[1], 100*(item[1]-tfivalues[0].data[0][1])/tfivalues[0].data[0][1])
            return [
                item[0],
                Math.round(100*(item[1]-tfivalues[0].data[0][1])/tfivalues[0].data[0][1] * 100)/100
            ]
        })

        this.setChartData(tfivalues, metadata[0], tfilooks)
    })
  }

  ngOnInit() {
      console.log('ngOnInit')
      this.route.params.subscribe(params => {
          let symbol = params['symbol']
          console.log('symbol', symbol)
          this.refreshData(symbol)
      })
  }

  ngOnDestroy() {
      if (this.subscription !== undefined) this.subscription.unsubscribe()
  }
}

