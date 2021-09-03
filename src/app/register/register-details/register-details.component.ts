import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';

import { ApiService } from '../../api.service';

@Component({
  selector: 'app-register-details',
  templateUrl: './register-details.component.html',
  styleUrls: ['./register-details.component.css']
})
export class RegisterDetailsComponent implements OnInit {
  subscription: Subscription
  registersActive: Array<any>

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.subscription = combineLatest(
        [this.api.getRegistersFull$('*')]
    ).subscribe(([registers]) => {
      this.registersActive = registers.registersActive.sort((a,b) => a.symbol > b.symbol ? 1 : -1)
    })
  }

}
