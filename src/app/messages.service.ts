import { Injectable } from '@angular/core';
import { Utils } from './utils'

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

    socket: WebSocket

    constructor(private utils: Utils) {
    }

    private wsSend(message) {
        if (this.socket.readyState === 1) { //https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
            this.socket.send(JSON.stringify(message))
        } else {
            alert(' WebSocket is already in CONNECTING, CLOSING or CLOSED state.')
        }
    }

    public sendWssMessage(action, value) {
        const message = {
            action: action,
            value: value,
        };
        this.wsSend(message)
    }

    public connectWss(token, callbackOnOpen, callbackOnMessage, callbackOnClose) {
        this.socket = new WebSocket(this.utils.httpToWs()+"?token="+token)

        this.socket.onopen = function(e) {
            callbackOnOpen()
        }

        this.socket.onmessage = function (message) {
              let obj = JSON.parse(message.data)
              callbackOnMessage(obj)
        }

        this.socket.onclose = function(event) {
            callbackOnClose()
            let msg
            if (event.wasClean) {
                msg = `[client]  Connection closed cleanly, code=${event.code} reason=${event.reason}`
                alert(msg)
                console.log(msg);
                //###redirect home this.router.navigate(['/']);
            } else {
                // e.g. server process killed or network down
                // event.code is usually 1006 in this case
                msg = '[close] Connection died'
                alert(msg)
                console.log(msg);
                //###redirect home this.router.navigate(['/']);
            }
        }

        this.socket.onerror = function(error) {
            console.log('[error]', JSON.stringify(error))
        }
    }

  public disconnectWss() {
      if (this.socket) {
          this.socket.close(1000, 'Web Socket connection closed manually')
      }
  }

}
