import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';
import { TFI_all } from './../tfismeta/tfi-all.js';

@Component({
  selector: 'app-occasion-preview',
  templateUrl: './occasion-preview.component.html',
  styleUrls: ['./occasion-preview.component.css']
})
export class OccasionPreviewComponent implements OnInit {
  subscription: Subscription
  Highcharts: typeof Highcharts = Highcharts
  chart: any
  occasions: Array<any>
  selectedSymbol: String
  symbols: String
  mode: String //S=simulation, R-real
  uniqueFunds: Array<any>
  occasion: String
  currentID : String

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    console.log('ngOnInit')
    this.route.params.subscribe(params => {
      this.symbols = params['symbols']
      this.mode = params['mode']
      this.refresh()
    })
  }

  refresh() {
    this.refreshData(this.mode, this.symbols) //@@@ simulation / real
  }

  private setChart(series, title) {
    function afterSetExtremes(event) {
      console.log('afterSetExtremes', event.min, event.max)
      //, this.chart.yAxis[0].getExtremes().min, this.chart.yAxis[0].getExtremes().max
      //this.chart.yAxis[0].setExtremes(event.min, event.max)
      let yExtremes = [this.chart.series[0].dataMin, this.chart.series[0].dataMax]
      console.log('yExtremes', yExtremes)
      this.chart.yAxis[0].setExtremes(yExtremes[0], yExtremes[1])
    }

    this.chart = Highcharts.chart('chart', {
      title: {
          text: title
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      xAxis: {
          events: { afterSetExtremes: afterSetExtremes },
          type: "datetime",
      },
      legend: {
          enabled: true
      },
      series: series
    })
  }

  refreshData(mode, symbols) {
    this.subscription = combineLatest(
        this.api.getOccasions$(mode, symbols)
    ).subscribe(([occasions]) => {
        this.occasions = occasions.map(occasion => ({
            symbol: occasion.symbol,
            name: TFI_all.filter(tfi => tfi.symbol === occasion.symbol)[0].name,
            run_date: new Date(occasion.run_date).toISOString().substring(0,10),
            minTFIValuesDate: new Date(occasion.minTFIValuesDate).toISOString().substring(0,10),
            run_params: JSON.parse(occasion.run_params),
            finding: JSON.parse(occasion.finding),
            _id: occasion._id
        }))
        //unique funds
        this.uniqueFunds = []
        this.occasions.forEach(occ => {
          let pos = this.uniqueFunds.findIndex(f => f.symbol === occ.symbol)
          if (pos === -1) {
              this.uniqueFunds.push({
                symbol: occ.symbol,
                name: occ.name,
                count: 1
              })
          } else {
              this.uniqueFunds[pos].count++
          }
        })
        this.uniqueFunds = this.uniqueFunds.sort((a,b) => a.symbol > b.symbol ? 1 : -1)
    })
  }

  loadOccasion(item) {
      // console.log(obj)
      this.currentID = item._id
      this.occasion = item
      this.subscription = combineLatest(
          this.api.tfivaluesDate$(item.symbol, item.minTFIValuesDate)
      ).subscribe(([values]) => {
          let series = []

          //changes %
          let changes = {
            name: item.symbol,
            data: values[0].data
                    .map(item => [
                        item[0], //datetime
                        item[2] //% changes
                    ])
          }
          series.push(changes)

          //occasion
          let occasion = {
              marker: { symbol: 'circle' },
              color: 'green',
              lineWidth: 4,
              name: 'O ['+item.run_date.substr(0,10)+', '+item.finding.min.date2+']',
              data: []
          }
          let label = JSON.stringify({
              finding: item.finding,
              params: item.run_params
          }, null, 2)
          occasion.data.push({
              name: label,
              x: item.finding.cur.date,
              y: item.finding.cur.change
          })
          //min
          occasion.data.push({
            name: label,
            x: item.finding.min.date,
            y: item.finding.min.change
          })
          //max
          occasion.data.push({
            name: label,
            x: item.finding.max.date,
            y: item.finding.max.change
          })
          series.push(occasion)

          //long term trend linear regression
          if (item.finding.trend.lr !== null) {
              let trend_lr = {
                marker: {enabled: false},
                color: 'red',
                lineWidth: 1,
                name: 'LR',
                data: [{
                      x: item.finding.trend.lr.x0,
                      y: item.finding.trend.lr.y0
                  },
                  {
                      x: item.finding.trend.lr.xn,
                      y: item.finding.trend.lr.yn
                  }]
              }
              series.push(trend_lr)
          }

          this.setChart(series, item.name+' ('+item.finding.stat.max_cur_diff+', '+item.finding.stat.max_cur_level+')')
      })
  }

  onFundSelectChange(selectedSymbol) {
      alert(selectedSymbol)
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) this.subscription.unsubscribe()
  }
}
