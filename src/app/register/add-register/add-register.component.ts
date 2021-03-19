import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-add-register',
  templateUrl: './add-register.component.html',
  styleUrls: ['./add-register.component.css']
})
export class AddRegisterComponent implements OnInit {
  data: String = ''
  result: String
  type: String = 'P' //purchase

  constructor(private api: ApiService) { }

  doTextareaValueChange(ev) {
    try {
      this.data = ev.target.value;
    } catch(e) {
      console.info('could not set textarea-value');
    }
  }

  saveData() {
    if (confirm('Are you sure? Type: '+this.type)) {
      console.log(this.data)
      let body = this.data
      this.api.postRegisters$(body, this.type).subscribe(result => {
        this.result = JSON.stringify(result)
      })
    }
  }

  ngOnInit() {

  }

}
