import invariant from 'invariant'
import {
  defaults,
  isBoolean,
  isFunction,
  isNumber,
  isUndefined
} from 'lodash'
import * as React from 'react'
import warning from 'warning'

const OPERATIONS = Object.freeze([
  'finish',
  'pause',
  'reset',
  'resume',
  'start',
  'stop'
])

const DEFAULT_OPTIONS = Object.freeze({
  startOnMount: false
})

const checkDelay = (delay, isRequired) =>
  invariant((!isRequired && isUndefined(delay)) || (isNumber(delay) && delay >= 0),
    `withTimer() delay must be a number >= 0. Current value: ${delay}`)

const checkOnTimeout = (onTimeout, isRequired) =>
  invariant((!isRequired && isUndefined(onTimeout)) || isFunction(onTimeout),
    `withTimer() onTimeout must be a function. Current value: ${onTimeout}`)

const checkBooleanOption = (optionValue, optionName) =>
  invariant(isBoolean(optionValue),
    `withTimer() ${optionName} option is not a boolean. Current value: ${optionValue}`)

const operationUnavailable = (op, state) => () => {
  warning(`withTimer() operation ${op} is not available from state ${state}`)
}

export const withTimer = (config = {}) => {
  const {
    delay: delayArg,
    onTimeout: onTimeoutArg,
    options: optionsArg = {}
  } = config

  const options = Object.freeze(defaults({}, optionsArg, DEFAULT_OPTIONS))

  checkDelay(delayArg, false)
  checkOnTimeout(onTimeoutArg, false)
  checkBooleanOption(options.startOnMount, 'startOnMount')

  return BaseComponent => class WithTimer extends React.Component {
    static propTypes = {
      delay: React.PropTypes.number,
      onTimeout: React.PropTypes.func
    }

    callbackProps = OPERATIONS.reduce(
      (memo, op) => {
        memo[`${op}Timer`] = (...args) => this.currentState[op](...args)
        return memo
      },
      {}
    )
    currentState = undefined

    constructor ({delay, onTimeout}) {
      super()
      checkDelay(delay, false)
      checkOnTimeout(onTimeout, false)
      this.enterStoppedState()
    }

    stateTransition = newState => (this.currentState = newState)

    enterStoppedState = timeoutId => {
      clearTimeout(timeoutId)
      this.stateTransition({
        name: 'stopped',
        finish: operationUnavailable('finish', 'stopped'),
        pause: operationUnavailable('pause', 'stopped'),
        reset: operationUnavailable('reset', 'stopped'),
        resume: operationUnavailable('resume', 'stopped'),
        start: this.enterStartedState,
        stop: operationUnavailable('stop', 'stopped')
      })
    }

    enterStartedState = delayOverride => {
      const delay = delayOverride || this.props.delay || delayArg
      const onTimeout = this.props.onTimeout || onTimeoutArg

      checkDelay(delay, true)
      checkOnTimeout(onTimeout, true)

      const startTime = Date.now()

      const timeoutId = setTimeout(
        () => {
          this.enterStoppedState()
          onTimeout(this.props)
        },
        delay
      )

      this.stateTransition({
        name: 'started',
        finish: () => {
          this.enterStoppedState(timeoutId)
          this.invokeOnTimeout()
        },
        pause: () => this.enterPausedState({startTime, delay, timeoutId}),
        reset: delayOverride => {
          this.enterStoppedState(timeoutId)
          this.enterStartedState(delayOverride || delay)
        },
        resume: operationUnavailable('resume', 'started'),
        start: operationUnavailable('start', 'started'),
        stop: () => this.enterStoppedState(timeoutId)
      })
    }

    enterPausedState = ({startTime, delay, timeoutId}) => {
      clearTimeout(timeoutId)
      const resumeDelay = delay - (Date.now() - startTime)
      this.stateTransition({
        name: 'paused',
        finish: () => {
          this.enterStoppedState()
          this.invokeOnTimeout()
        },
        pause: operationUnavailable('pause', 'paused'),
        reset: () => this.enterStartedState(delay),
        resume: () => this.enterStartedState(resumeDelay),
        start: operationUnavailable('start', 'paused'),
        stop: this.enterStoppedState
      })
    }

    invokeOnTimeout = () => (this.props.onTimeout || onTimeoutArg)(this.props)

    componentWillMount () {
      if (options.startOnMount) {
        this.currentState.start()
      }
    }

    componentWillUnmount () {
      if (this.currentState.name !== 'stopped') {
        this.currentState.stop()
      }
    }

    render () {
      const newProps = {
        ...this.callbackProps,
        ...this.props
      }
      return <BaseComponent {...newProps} />
    }
  }
}
