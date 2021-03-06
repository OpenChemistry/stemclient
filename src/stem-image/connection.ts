import openSocket from 'socket.io-client';
import { MultiSubjectProducer, IObserver } from './subject';

export class StreamConnection extends MultiSubjectProducer {
  socket: any = null;

  connect(url: string, namespace: string) : [Promise<unknown>, Promise<unknown>] {
    this.disconnect();

    const socket = openSocket(`${url}/${namespace}`, {transports: ['websocket']});

    const connectPromise = new Promise((resolve, _reject) => {
      socket.on('connect', () => {
        this.reconnectSocketToSubjects(socket);
        resolve();
      });
    });

    const disconnectPromise = new Promise((resolve, _reject) => {
      socket.on('disconnect', () => {
        socket.destroy();
        resolve();
      });
    });

    socket.on('error', (msg: any) => {
      console.log("SOCKET ERROR", msg);
    });

    this.socket = socket;

    return [connectPromise, disconnectPromise];
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  socketEmit(event: string, message: any) {
    if (this.socket) {
      this.socket.emit(event, message);
    }
  }

  subscribe(event: string, observer: IObserver) {
    if (!(event in this.subjects)) {
      if (this.socket) {
        this.socket.on(event, (message: any) => {
          this.emit(event, message);
        });
      }
    }
    super.subscribe(event, observer);
  }

  private reconnectSocketToSubjects(newSocket: any) {
    for (let event in this.subjects) {
      newSocket.on(event, (message: any) => {
        this.emit(event, message);
      });
    }
  }
}
