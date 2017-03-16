# react-with-timer-hoc

A React higher-order component (HOC) that simplifies setTimeout-based timers.

Transpiled using `babel-preset-env` with the following settings:

```json
{
  "targets": {
    "browsers": "last 2 versions"
  }
}
```

This is my first npm module. Comments very welcome!

## Installation
```bash
npm i -S react-with-timer-hoc
```

## API

### `withTimer`

```js
withTimer(
  config?: {
    delay?: number,
    onTimeout?: (props: Object) => void,
    options?: {
      startOnMount?: boolean = false
    }
  }
) : HigherOrderComponent

```
Creates an HOC, optionally configured with a `config` object. This HOC
will pass props to its wrapped instance (See below for a 
description of each prop). The timer will be canceled if the
`componentWillUnmount` lifecycle callback is invoked.

#### HOC configuration options

* `delay`: Optional. Number of milliseconds, after timer is started,
  before timer will expire. If omitted, must be passed in as a prop,
  or passed as an argument to `startTimer()`
* `onTimeout`: Optional. Function to be called when timer expires.
  Invoked with the current props object.
* `options`: Optional. An object with zero or more of the following keys:
  * `startOnMount`: If true, the timer will be started when
    `componentWillMount()` is called.
  
Example:
```jsx harmony
import {FooComponent} from 'foo-component'
const enhancer = withTimer({
  delay: 500,
  onTimeout: ({barProp}) => console.log(`Timer expired. Prop value: ${barProp}`)
})

export default enhancer(FooComponent) // FooComponent will receive props
                                      // that control the timer. See below.
```

#### Props from parent

The following props may be optionally passed in from the parent:

* `delay`: Optional. Number of milliseconds, after timer is started,
  before timer will expire. Overrides value passed into HOC function.
* `onTimeout`: Optional. Function to be called when timer expires.
  Invoked with the current props object. Overrides value passed into HOC
  function.
  
Example:
```jsx harmony
import {withTimer} from 'react-with-timer-hoc'
import {FooComponent} from 'foo-component'

const EnhancedComponent = withTimer()(FooComponent)

class BarComponent {
  render() {
    return (
      <EnhancedComponent delay={1000} onTimeout={someCallbackFunction} />
    )
  }
}
```

#### Props passed to wrapped instance

The following props are functions passed to the wrapped instance that
control the timer. All of them may be renamed or omitted by using the 
options object.

* `startTimer(delay?)`: Starts the timer. Optionally accepts a delay.
* `stopTimer()`: Cancels the timer. The `onTimeout` callback is not
  invoked.
* `resetTimer(delay?)`: Starts the timer over from the beginning.
  Optionally accepts a new delay. The `onTimeout` callback is not invoked
  until the timer expires.
* `finishTimer()`: Cancels the timer and invokes the `onTimeout` callback.
* `pauseTimer()`: Pauses the timer. Call `resumeTimer()` to continue.
* `resumeTimer()`: Resumes a paused timer.

### Complete example, using Mobx and Recompose:


Assume there is an observable Mobx store called `uiStore` that has 
properties `isPopupOpen` and `setPopupOpen`.

```js
import {inject} from 'mobx'
import {branch, compose, renderNothing} from 'recompose'
import {withTimer} from 'react-with-timer-hoc'

const enhancer = compose(
  inject(({uiStore}) = ({
    isOpen: uiStore.isPopupOpen,
    setOpen: uiStore.setPopupOpen
  })),
  branch(
    ({isOpen}) => !isOpen,
    renderNothing
  ),
  withTimer({
    delay: 5000,
    onTimeout: ({setOpen}) => setOpen(false),
    options: {
      startOnMount: true
    }
  })
)

const ModalPopup = ({finishTimer}) => (
  <div id="popupWindow">
    <button label="Close Window" onClick={finishTimer} />
  </div>
)

export default enhancer(ModalPopup)

```