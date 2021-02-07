import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, Subscription } from 'rxjs'
import { ApiService } from '../api.service';
import { MessagesService } from '../messages.service'
import { TFI_all } from './tfi-all.js';
import { Utils } from './../utils.js';

const CONST_ARCHEO_DATE = new Date("1920-01-01")

@Component({
  selector: 'app-tfismeta',
  templateUrl: './tfismeta.component.html',
  styleUrls: ['./tfismeta.component.css'],
  providers: [Utils]
})
export class TfismetaComponent implements OnInit {
  subscription : Subscription
  tfimeta : Array<any> = []
  TFIs : Array<any> = []
  TFIs_filtered : Array<any> = []
  filterInitialized: Boolean = false
  filterMyTFI: Boolean = true
  filterName: String = ''
  filterLook: Boolean = false
  selectedTFI: Array<any> = []
  checkFilteredTFI: Boolean = false
  MY_TFI: Array<String> = ['SKR54','SKR23','SKR36','ARK01','ARK11','ARK23','ALL14','ALL75','ING04','PIO54']
  imgStatuses = [
    ['DONE', 'DONE.png'],
    ['CALC-STARTED', 'spinner.gif'],
    ['OK', 'OK.jpg'],
    ['ERROR', 'ERROR.jpg'],
    ['NEW', 'NEW.png'],
    ['RUNNING', 'spinner.gif']
  ]

  wssIsActive: Boolean

  constructor(private api: ApiService, private messanger: MessagesService, public utils: Utils) { }

  getImgStatus(status: String) {
      try {
          return '../assets/images/'+this.imgStatuses.filter(item => item[0]===status)[0][1]
      } catch (e) {
          return '../assets/images/void.png'
      }
  }

  getSelectedTFIs() {
      let selectedArr = []
      Object.getOwnPropertyNames(this.selectedTFI).map((item, index) => {
          if (index > 0) {
            if (this.selectedTFI[item]) selectedArr.push(item)
            //console.log('item', item, this.selectedTFI[item])
          }
      })
      console.log('selectedArr', selectedArr)
      return selectedArr
  }

  loadValueTFI(symbol) {
      if (symbol === '') {
          let selectedArr = this.getSelectedTFIs()
          if (selectedArr.length === 0) {
              alert('No TFI is selected')
              return
          }
          if (confirm('Are you sure to update all '+selectedArr.length+' TFI?')) this.sendWssMessage('LOADVALUE-INIT', selectedArr)
      } else {
          this.sendWssMessage('LOADVALUE-INIT', [symbol])
      }
  }

  calcLR(symbol) {
// console.log('calcLR', symbol)

      if (symbol === '') {
          let selectedArr = this.getSelectedTFIs()
          if (selectedArr.length === 0) {
              alert('No TFI is selected')
              return
          }
          if (confirm('Are you sure to calc LR for all '+selectedArr.length+' TFI?')) this.sendWssMessage('CALCLR-INIT', selectedArr)
      } else {
          this.sendWssMessage('CALCLR-INIT', [symbol])
      }
  }

  private refreshMetadata(event, symbol, data) {
      let index = this.TFIs_filtered.findIndex(tfi => tfi.symbol === symbol)
      if (index > -1) {
        this.TFIs_filtered[index].metadata = data
      }
  }

  selectedTFIChange(symbol){
      if (this.selectedTFI[symbol]){
          this.selectedTFI[symbol] = false;
      } else{
          this.selectedTFI[symbol] = true;
      }
  }

  checkFilteredTFIChange() {
    this.checkFilteredTFI = this.checkFilteredTFI ? false : true
    this.TFIs_filtered.map(tfi => this.selectedTFI[tfi.symbol] = this.checkFilteredTFI)
  }

  refresh() {
//      console.log('filterInitialized', this.filterInitialized)
      let filterNameUC = this.filterName.toUpperCase()
      this.TFIs.map(tfi => (tfi.symbol==='TFI5142') ? console.log(tfi.symbol, tfi.metadata.initDate, CONST_ARCHEO_DATE): null)
      this.TFIs_filtered = this.TFIs.filter(tfi => this.filterInitialized && (tfi.metadata.initDate!==undefined && tfi.metadata.initDate!==null && new Date(tfi.metadata.initDate).getFullYear()!==CONST_ARCHEO_DATE.getFullYear()) || this.filterInitialized===false)
      this.TFIs_filtered = this.TFIs_filtered.filter(tfi => this.filterName !== '' && (tfi.name.toUpperCase().indexOf(filterNameUC) >-1 || tfi.symbol.toUpperCase().indexOf(filterNameUC) >-1) || this.filterName === '')
      //###@@@TODO
      this.TFIs_filtered = this.TFIs_filtered.filter(tfi => this.filterMyTFI && (this.MY_TFI.indexOf(tfi.symbol) >-1) || this.filterMyTFI===false)
      this.TFIs_filtered = this.TFIs_filtered.filter(tfi => this.filterLook && (tfi.metadata.look > 0) || this.filterLook===false)

      this.TFIs_filtered = this.TFIs_filtered.sort((a,b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1: -1)
  }

  ngOnInit() {
    this.connectWss()

    this.TFIs = TFI_all.map(item => { return {...item, metadata: {} } }).sort((a,b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1: -1)

    this.subscription = this.api.tfimeta$('*').subscribe(res => {
        this.tfimeta = res
        this.tfimeta.forEach(tfimeta => {
            let index = this.TFIs.findIndex(tfi => tfi.symbol === tfimeta.symbol)
            if (index > -1) this.TFIs[index].metadata = tfimeta
        })
        this.refresh()
    })
  }

  ngOnDestroy() {
    this.disconnectWss()
    if (this.subscription !== undefined) this.subscription.unsubscribe()
  }

  //ws
  sendWssMessage(action, value) {
    this.messanger.sendWssMessage(action, value)
  }

  connectWss() {
    if (this.wssIsActive) {
        alert('ERROR. Already connected')
        return
    }
    this.messanger.connectWss('TOKEN_UNUSED',
        () => {
            this.wssIsActive = true
        },
        (obj) => {
            // console.log('WSS', JSON.stringify(obj))
            console.log('WSS', obj.payload.symbol, JSON.stringify(obj.payload.status))
            switch (obj.event) {

                case 'CONNECTION':
                  console.log('WSS.CONNECTION', obj.payload)
                  break

                case 'TEST':
                    console.log('WSS.TEST', 'TEST TEST TEST')
                    break

                default:
                    //console.log('WSS.default', JSON.stringify(obj.payload))
                    this.refreshMetadata(obj.event, obj.symbol, obj.payload)
            }
        },
        () => {
            this.wssIsActive = false
        }
    )
  }

  disconnectWss() {
      this.messanger.disconnectWss()
  }

}
