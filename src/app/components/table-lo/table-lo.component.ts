import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-table-lo',
  templateUrl: './table-lo.component.html',
  styleUrls: ['./table-lo.component.css']
})
export class TableLoComponent implements OnInit {
  @Input() fundsLO : Array<any> = []
  @Input() chartID : String
  @Input() highChart: typeof Highcharts = Highcharts

  constructor() { }

  ngOnInit() {
  }

}
