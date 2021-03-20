import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';
import { Utils } from './../utils.js';

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
  // tfimeta2: Array<any>
  filterSymbols: String// = 'TFI6771,TFI8172,TFI112,TFI4562,TFI1,TFI4635,TFI616,TFI8344,TFI543,TFI167'
  filterDate: String  = new Date().toISOString().substring(0,10)

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router, public utils: Utils) { }

  ngOnInit() {
    console.log('ngOnInit')
    this.route.params.subscribe(params => {
//      console.log('symbols', symbols)
      this.filterSymbols = params['symbols']
      this.filterDate = params['date']
      this.refresh()
    })

  }

  refresh() {
    this.refreshData(this.filterSymbols, this.filterDate)
  }

  private setChart(series) {
    Highcharts.chart('chart', {
      title: {
          text: null
      },
      chart: {
          zoomType: 'x',
          type: 'line',
      },
      xAxis: {
          type: 'datetime',
      },
      yAxis: [{
        alternateGridColor: 'rgb(250,250,250)'
      },
      {
        linkedTo: 0,
        opposite: true
      }],
      legend: {
          enabled: true
      },
      series: series
    })
  }

  refreshData(filterSymbols, filterDate) {

    let includeCbonds = filterSymbols.indexOf('*') > -1
    // console.log('includeCbonds', includeCbonds)
    this.subscription = combineLatest(
        this.api.tfimeta$(filterSymbols),
        this.api.tfivalues$(filterSymbols),
        includeCbonds ? this.api.cbondsData$(filterDate) : new Promise(async function(resolve, reject) {resolve(null)})
        //this.api.tfimeta$(symbol2),
        //this.api.tfivalues$(symbol2),
    ).subscribe(([tfimetadata, tfivalues, cbonds/*, tfimeta2, tfivalues2*/]) => {
        // console.log('filterDate', filterDate)
        // console.log('cbonds', cbonds)
        this.tfimetadata = tfimetadata
        if (includeCbonds) filterSymbols = filterSymbols.replace(',*','')
        let symbols = filterSymbols.split(',').map(item => {return {symbol: item}})


        // filter to given period
        let startDate = new Date(filterDate)


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
        if (includeCbonds) cbonds.forEach(cbond => tfivalues.push(cbond))

        //add trends
        symbols.map((element, index)=> {
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


        this.setChart(tfivalues)
    })
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) this.subscription.unsubscribe()
  }
}
