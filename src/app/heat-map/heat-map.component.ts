import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { ApiService } from '../api.service';
import { TFI_all } from '../tfismeta/tfi-all.js';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-heat-map',
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.css']
})
export class HeatMapComponent implements OnInit {
  subscription: Subscription
  heatMap: any
  pivotArr: Array<any>
  ready: Boolean = false
  filterText: String
  pivotArrFiltered: Array<any>

  constructor(private api: ApiService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      //      console.log('symbols', symbols)
        let dateFrom = params['date']
        let symbols = params['symbols']

        this.subscription = combineLatest(
            [this.api.getHeatMap$(symbols, dateFrom)]
        ).subscribe(([heatMap]) => {
            this.heatMap = heatMap

            //add fund name
            this.heatMap.pivotArrPlain = this.heatMap.pivotArrPlain.map(row => {
                row[0] = row[0]+' '+TFI_all.find(item => item.symbol === row[0]).name
                return row
            })

            //columns headers - title: dates and total
            this.heatMap.uniqueX = this.heatMap.uniqueX.map(date => ({
                title: date,
                asc: true
            }))
            this.heatMap.uniqueX.push({
              title: 'Total',
              asc: true
            })

            //array for filtering
            this.pivotArrFiltered = this.heatMap.pivotArrPlain

            //view is ready
            this.ready = true
        })

    })
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) this.subscription.unsubscribe()
  }

  sortTable(colIndex) {
      this.pivotArrFiltered = this.pivotArrFiltered.sort( (a,b) => this.heatMap.uniqueX[colIndex].asc ? a[colIndex+1].change - b[colIndex+1].change : b[colIndex+1].change - a[colIndex+1].change)
      this.heatMap.uniqueX[colIndex].asc = !this.heatMap.uniqueX[colIndex].asc
  }

  filterTable() {
      let filterTextUC = this.filterText.toUpperCase()
      //if separated by comma (,) then filter by array of symbols
      if (filterTextUC.indexOf(',') > -1) {
          let arr = filterTextUC.split(',')
          this.pivotArrFiltered = this.heatMap.pivotArrPlain.filter(row => arr.findIndex( a => a === row[0]) > -1)
      } else if (filterTextUC.indexOf('|') > -1) {
          let convSearch = filterTextUC.split('|').map(frase=>"(?=.*"+frase+")").join('')
          var regex = new RegExp(convSearch, "gi")
          this.pivotArrFiltered = this.heatMap.pivotArrPlain.filter(row => Boolean(row[0].toUpperCase().match(regex)))
      } else {
          this.pivotArrFiltered = this.heatMap.pivotArrPlain.filter(row => row[0].toUpperCase().indexOf(filterTextUC) > -1 || filterTextUC === '')
      }
      //@@@
      // } else if (filterTextUC.indexOf('#') > -1) {
      //     let tag = filterTextUC.substr(1)
      //     //console.log('tag', tag)
      //     this.pivotArrFiltered = this.heatMap.pivotArrPlain.filter(row => tfi.metadata.tags.indexOf(tag) >-1 )
      // }
  }

}
