# react-with-timer-hoc

A React higher-order component (HOC) that simplifies setTimeout-based timers.

## Installation
```bash
npm i -S react-with-timer-hoc
```

## API

###`withTimer`

```js
withTimer(
  config?: {
    delay?: number,
    onTimeout?: (props: Object) => void,
    options?: {
      cancelPropName?: string = 'cancelTimer',
      finishPropName?: string = 'finishTimer',
      resetPropName?: string = 'resetTimer',
      startPropName?: string = 'startTimer'
    }
  }
) : HigherOrderComponent

```
Creates an HOC, optionally configured with a `config` object. This HOC
will pass up to four props to its wrapped instance (See below for a 
description of each prop). The timer will be canceled if the
`componentWillUnmount` lifecycle callback is invoked.

#### HOC configuration options

* delay: Optional. Number of milliseconds, after timer is started,
  before timer will expire. If omitted, must be passed in as a prop,
  or passed as an argument to `startTimer()`
* onTimeout: Optional. Function to be called when timer expires.
  Invoked with the current props object.
* options: Optional. An object with one or more of the following keys:
  * cancelPropName: Rename the `cancelTimer` prop. If omitted, prop
    will not be passed.
  * finishPropName: Rename the `finishTimer` prop. If omitted, prop
    will not be passed.
  * cancelPropName: Rename the `resetTimer` prop. If omitted, prop
    will not be passed.
  * cancelPropName: Rename the `startTimer` prop. If omitted, prop
    will not be passed.
  
Example:
```js
import {WonderfulComponent} from 'incredible-library'
...
const enhancer = withTimer({
  delay: 500,
  onTimeout: ({aProp}) => console.log(`Timer expired. Prop value: ${aProp}`)
})

const EnhancedComponent = enhancer(WonderfulComponent)
```

#### Props from parent
* delay: Optional. Number of milliseconds, after timer is started,
  before timer will expire. Overrides value passed into HOC function.
* onTimeout: Optional. Function to be called when timer expires.
  Invoked with the current props object. Overrides value passed into HOC
  function.
  
Example:
```js
import {withTimer} from 'react-with-timer-hoc'
import {FabulousComponent} from 'mind-blowing-library'
...
const EnhancedComponent = withTimer()(FabulousComponent)
...
render() {
  return (
    <EnhancedComponent delay={1000} onTimeout={someCallbackFunction} />
  )
}

```

#### Props passed to wrapped instance

* `startTimer(delay?)`: Starts the timer. Optionally accepts a delay.
* `cancelTimer()`: Cancels the timer. The `onTimeout` callback is not
  invoked.
* `resetTimer(delay?)`: Resets the timer to the beginning of its delay.
  Optionally accepts a new delay. The `onTimeout` callback is not invoked.
* `finishTimer()`: Cancels the timer and invokes the `onTimeout` callback.

###Complete example, using Mobx and Recompose:
```js
import {inject} from 'mobx'
import {branch, compose, lifecycle, renderNothing} from 'recompose'
import {withTimer} from 'react-with-timer-hoc'
...
const enhancer = compose(
  inject(({uiStore}) = ({
    isOpen: uiStore.isPopupOpen,
    setOpen: uiStore.setPopupOpen
  })),
  withTimer({
    delay: 5000,
    onTimeout: ({setOpen}) => setOpen(false),
    options: {
      startPropName: 'startTimer',
      finishPropName: 'onCloseButtonClick'
    }
  }),
  branch(
    ({isOpen}) => !isOpen,
    renderNothing
  ),
  lifecycle({
    componentWillMount() {
      this.props.startTimer()
    }
  })
)

const ModalPopup = ({onCloseButtonClick}) => (
  <div id="popupWindow">
    <button label="Close Window" onClick={onCloseButtonClick} />
  </div>
)

const EnhancedPopup = enhancer(ModalPopup)
...

```