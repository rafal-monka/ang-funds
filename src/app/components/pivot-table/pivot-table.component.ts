import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs'

const CONST_TAX = 0.81

@Component({
  selector: 'app-pivot-table',
  templateUrl: './pivot-table.component.html',
  styleUrls: ['./pivot-table.component.css']
})
export class PivotTableComponent implements OnInit {
  @Input() monthlyArr : Array<any> = []
  @Input() dicts : Array<any> = []
  pivotArr: Array<any> = [[]];
  uniqueFunds : Array<any>;
  fundDict : Array<any> = [];
  uniqueDates : Array<any>;
  uniqueDates2 : Array<any>;
  total: number = 0
  totalNet: number = 0
  totalValue: number = 0
  totalCapital: number = 0

  private dateFormat(date) {
    return new Date(date).toISOString().substring(0,10)
  }

  getFundDict(symbol) {
    try {
        return this.dicts ? this.dicts.filter(f => f.symbol===symbol)[0] : ''
    } catch (e) {
        return 'ERR:'+symbol
    }
}

  private pivotTable(monthlyArr) {
    if (monthlyArr === undefined) return
    this.uniqueDates = [...new Set(/*this.*/monthlyArr.sort( (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(item => this.dateFormat(item.date)))]
    this.uniqueDates2 = this.uniqueDates.filter(date=>date!=='9999-12-31')
    this.uniqueFunds = [...new Set(/*this.*/monthlyArr.sort( (a, b) => a.symbol >= b.symbol ? 1 : -1).map(item => item.symbol ))]

    this.uniqueFunds.forEach((ufund, r) => {
        this.pivotArr[ufund] = []
        this.fundDict[r] = this.getFundDict(ufund)
        this.pivotArr['SUM'] = []
        this.uniqueDates.forEach((udate, c) => {
            this.pivotArr[ufund][udate] = []
            this.pivotArr['SUM'][udate] = 0.0
        })
        this.pivotArr[ufund]['SUM']= 0.0
        this.pivotArr[ufund]['SUMNET']= 0.0
        this.pivotArr[ufund]['CAPITAL']= 0.0
        this.pivotArr[ufund]['VALUE']= 0.0
    })

    //totals
    this.total = 0
    /*this.*/monthlyArr.forEach(item=> {
        this.pivotArr[item.symbol][this.dateFormat(item.date)].push(item)
        if (item.date !== '9999-12-31') {
            this.pivotArr['SUM'][this.dateFormat(item.date)] += item.interests
        }
        this.pivotArr[item.symbol]['SUM'] += item.interests

        this.total += item.interests

    })
    // console.log('this.pivotArr', this.pivotArr)

    //netto
    this.totalNet = 0
    this.totalValue = 0
    this.uniqueFunds.forEach((ufund, r) => {
        let interestsNet = this.pivotArr[ufund]['SUM'] * (this.pivotArr[ufund]['SUM'] > 0 ? CONST_TAX : 1)
        this.pivotArr[ufund]['SUMNET'] = interestsNet
        try {
          this.pivotArr[ufund]['CAPITAL'] = this.pivotArr[ufund]['9999-12-31'].reduce((total,val)=>total+val.capital,0)
          this.pivotArr[ufund]['VALUE'] = this.pivotArr[ufund]['9999-12-31'].reduce((total,val)=>total+val.valn,0)
        } catch (e) {
          null
        }
        this.totalCapital += this.pivotArr[ufund]['CAPITAL']
        this.totalValue += this.pivotArr[ufund]['VALUE']
        this.totalNet += interestsNet
    })
  }

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    //console.log('ngOnChanges', this.monthlyArr)
    if(changes.monthlyArr && changes.dicts){
        setTimeout(() => {
          //this.monthlyArr = JSON.parse(JSON.stringify(changes.monthlyArr.currentValue))
          //this.dicts = JSON.parse(JSON.stringify(changes.dicts.currentValue))
          // console.log('ngOnChanges.length', this.monthlyArr.length)
          this.pivotTable(this.monthlyArr)

          //https://stackoverflow.com/questions/16330237/highcharts-full-width-issue/36158314
          window.dispatchEvent(new Event('resize'))

        }, 50)
    }

  }
}

