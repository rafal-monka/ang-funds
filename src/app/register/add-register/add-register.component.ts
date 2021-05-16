import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-add-register',
  templateUrl: './add-register.component.html',
  styleUrls: ['./add-register.component.css']
})
export class AddRegisterComponent implements OnInit {
  data: string = ''
  result: string
  //type: string = 'P' //purchase

  constructor(private api: ApiService) { }

  doTextareaValueChange(ev) {
    try {
      this.data = ev.target.value;

    } catch(e) {
      console.info('could not set textarea-value');
    }
  }

  saveData() {
    let type = JSON.parse(this.data).redemption !== undefined ? "R" : "P"
    if (confirm('Are you sure? Type: '+type)) {
      console.log(this.data)
      let body = this.data
      this.api.postRegisters$(body, type).subscribe(result => {
        this.result = result
      })
    }
  }

  ngOnInit() {

  }

}
