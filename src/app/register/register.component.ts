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
  groupedArr: Array<any> = []
  message: any

  constructor(private api: ApiService) { }

  private setChartOBL(series) {
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
      },

      legend: {
          enabled: true
      },
      series: series
    })
  }

  ngOnInit() {
      this.message = "Fetching data...please wait"
      this.subscription = combineLatest(
        this.api.getRegisters$('Q')
      ).subscribe(([registers]) => {
          if (registers.status !== 'OK') this.message = JSON.stringify(registers.error)

          this.message = "Processing..."
            this.unique_registers = registers.unique_registers.map(symbol => {
                let tfi = TFI_all.find(item => item.symbol === symbol)
                return {
                  symbol: tfi.symbol,
                  name: tfi.name,
                  aolurl: 'https://www.analizy.pl'+tfi.href,
                }
            })
            //console.log(this.unique_registers)

            for (let i=0; i<registers.chartSeries.length; i++) {
                let tfi = this.unique_registers.find(item => item.symbol === registers.chartSeries[i].name)
                registers.chartSeries[i].name = tfi.symbol+' '+tfi.name
            }

            if (registers.chartSeries.length > 0) {
                registers.chartSeries = registers.chartSeries

                this.setChartOBL(registers.chartSeries)
                this.groupedArr = registers.groupedArr
                this.message = ""
            } else {
                this.message = "No data"
            }


      })
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) this.subscription.unsubscribe()
  }

}
