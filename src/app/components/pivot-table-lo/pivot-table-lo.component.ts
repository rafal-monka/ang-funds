import { Component, OnInit, Input, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-pivot-table-lo',
  templateUrl: './pivot-table-lo.component.html',
  styleUrls: ['./pivot-table-lo.component.css']
})
export class PivotTableLoComponent implements OnInit {
  @Input() arr : Array<any> = []
  pivotArr: Array<any> = [[]]
  uniqueCols : Array<any>;
  uniqueRows : Array<any>;
  ready : Boolean
  constructor() { }

  ngOnInit() {
  }

  private pivotTable(arr) {
    if (arr === undefined) return
    this.ready = false
    this.uniqueCols = [...new Set(arr.sort( (a, b) => a.date >= b.date ? 1 : -1).map(item => item.date))]
    this.uniqueRows = [...new Set(arr.sort( (a, b) => a.symbol >= b.symbol ? 1 : -1).map(item => item.symbol))]

    //initialize empty
    this.uniqueRows.forEach((uRow, r) => {
        this.pivotArr[uRow] = []
        this.uniqueCols.forEach((uCol, c) => {
            this.pivotArr[uRow][uCol] = []
        })
    })

    arr.forEach(item=> {
      this.pivotArr[item.symbol][item.date].push(item)
    })
    this.ready = true
  }

  ngOnChanges(changes: SimpleChanges) {
    //console.log('ngOnChanges', this.monthlyArr)
    if(changes.arr){
        // setTimeout(() => {
        //   //this.monthlyArr = JSON.parse(JSON.stringify(changes.monthlyArr.currentValue))
        //   //this.dicts = JSON.parse(JSON.stringify(changes.dicts.currentValue))
        //   // console.log('ngOnChanges.length', this.monthlyArr.length)
        //   this.pivotTable(this.arr)
        // }, 500)
    }
  }
}
