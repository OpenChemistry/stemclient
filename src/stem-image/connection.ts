import openSocket from 'socket.io-client';
import { MultiSubjectProducer, IObserver } from './subject';

export class StreamConnection extends MultiSubjectProducer {
  socket: any = null;

  connect(url: string, room: string) : [Promise<{}>, Promise<{}>] {
    this.disconnect();

    const socket = openSocket(url, {transports: ['websocket']});

    const connectPromise = new Promise((resolve, _reject) => {
      socket.on('connect', () => {
        socket.emit('subscribe', room);
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
