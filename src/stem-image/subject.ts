export interface IObserver{
  (message: any): void;
}

export class SubjectProducer {
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

export class MultiSubjectProducer {
  subjects: {[eventName: string]: SubjectProducer} = {};

  subscribe(event: string, observer: IObserver) {
    if (!(event in this.subjects)) {
      this.subjects[event] = new SubjectProducer();
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
