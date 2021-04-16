import { Component, OnInit, Input, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-total-table',
  templateUrl: './total-table.component.html',
  styleUrls: ['./total-table.component.css']
})
export class TotalTableComponent implements OnInit {
  @Input() table : Array<any> = []
  totalCapital: number
  totalY: number
  totalValn: number
  totalY2: number
  totalGain: number
  totalY3: number
  totalYield: number

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
      //console.log('ngOnChanges', this.table.length)
      if(changes.table) {
          if (this.table === undefined) return
          this.totalValn = Math.round( this.table.reduce((t,i)=>t+i.sumValn,0)* 100)/100
          this.totalCapital = Math.round( this.table.reduce((t,i)=>t+i.sumCapital,0)* 100)/100
          this.totalY = Math.round( this.table.reduce((t,i)=>t+i.y,0)* 100)/100
          this.totalY2 = Math.round( this.table.reduce((t,i)=>t+i.y2,0)* 100)/100
          this.totalGain = Math.round( (this.totalValn - this.totalCapital)* 100)/100
          this.totalY3 = Math.round( this.table.reduce((t,i)=>t+i.y3,0)* 100)/100
          this.totalYield = Math.round( (this.totalValn - this.totalCapital)/this.totalCapital *100 * 100)/100
      }
  }
}
