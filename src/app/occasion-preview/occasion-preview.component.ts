import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';

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
  symbol: String
  occasion: String

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    console.log('ngOnInit')
    this.route.params.subscribe(params => {
      this.symbol = params['symbol']
      this.refresh()
    })
  }

  refresh() {
    this.refreshData(this.symbol)
  }

  private setChart(series, title) {
    this.chart = Highcharts.chart('chart', {
      title: {
          text: title
      },
      chart: {
          zoomType: 'x',
          type: 'line'
      },
      xAxis: {
          type: "datetime",
      },
      legend: {
          enabled: true
      },
      series: series
    })
  }

  refreshData(symbol) {
    this.subscription = combineLatest(
        this.api.getOccasion$('*') //@@@
    ).subscribe(([occasions]) => {
        this.occasions = occasions.map(occasion => ({
            symbol: occasion.symbol,
            run_date: new Date(occasion.run_date).toISOString().substring(0,10),
            minTFIValuesDate: new Date(occasion.minTFIValuesDate).toISOString().substring(0,10),
            run_params: JSON.parse(occasion.run_params),
            finding: JSON.parse(occasion.finding),
            _id: occasion._id
        }))
    })
  }

  loadOccasion(item) {
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
              lineWidth: 4,
              name: 'O-'+item.run_date.substr(0,10),
              data: []
          }
          let label = JSON.stringify({
              finding: item.finding,
              params: item.run_params
          }, null, 2)
          occasion.data.push({
              name: label,
              x: item.finding.c.date,
              y: item.finding.c.change
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
          if (item.finding.trend_lr !== null) {
              let trend_lr = {
                marker: {enabled: false},
                color: 'red',
                lineWidth: 1,
                name: 'LR',
                data: [{
                      x: item.finding.trend_lr.x0,
                      y: item.finding.trend_lr.y0
                  },
                  {
                      x: item.finding.trend_lr.xn,
                      y: item.finding.trend_lr.yn
                  }]
              }
              series.push(trend_lr)
          }

          this.setChart(series, item.symbol+'/'+item.run_date+' ('+item.finding.max_cur_diff+', '+item.finding.max_cur_level+')')
      })
  }


  ngOnDestroy() {
    if (this.subscription !== undefined) this.subscription.unsubscribe()
  }
}
