export interface IObserver{
  (message: any): void;
}

export class Subject {
  observers: IObserver[] = [];

  subscribe(observer: IObserver){
    this.observers.push(observer);
  }

  unsubscribe(observer: IObserver) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  emit(message: any) {
    this.observers.forEach((observer) => {observer(message)});
  }
}

export class MultiSubject {
  subjects: {[eventName: string]: Subject} = {};

  subscribe(event: string, observer: IObserver) {
    if (!(event in this.subjects)) {
      this.subjects[event] = new Subject();
    }
    this.subjects[event].subscribe(observer);
  }

  unsubscribe(event: string, observer: IObserver) {
    if (!(event in this.subjects)) {
      return;
    }
    this.subjects[event].unsubscribe(observer);
  }

  emit(event: string, message: any) {
    if (event in this.subjects) {
      this.subjects[event].emit(message);
    }
  }
}
