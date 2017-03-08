import 'babel-polyfill';
import { greeting } from 'greeting';

console.log(greeting());

export const lambda = foo => console.log(foo);

@lambda
class Bar {
  instanceVar;

  constructor () {
    console.log('in constructor');
  }

  whoop = () => console.log(this.instanceVar);
}

const bar = new Bar();

console.log(bar);
