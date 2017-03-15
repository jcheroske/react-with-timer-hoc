import invariant from 'invariant'
import {
  defaults,
  isEmpty,
  isFunction,
  isNumber,
  isString,
  isUndefined
} from 'lodash'
import * as React from 'react'

const CALLBACK_METHODS = Object.freeze([
  'cancel',
  'finish',
  'reset',
  'start'
])

const DEFAULT_OPTIONS = Object.freeze({
  cancelPropName: 'cancelTimer',
  finishPropName: 'finishTimer',
  passedProps: CALLBACK_METHODS,
  resetPropName: 'resetTimer',
  startOnMount: false,
  startPropName: 'startTimer'
})

const checkDelay = (delay, isRequired) =>
  invariant((!isRequired && isUndefined(delay)) || (isNumber(delay) && delay >= 0),
    `withTimer() delay must be >= 0. Current value: ${delay}`)

const checkOnTimeout = (onTimeout, isRequired) =>
  invariant((!isRequired && isUndefined(onTimeout)) || isFunction(onTimeout),
    `withTimer() onTimeout must be a function. Current value: ${onTimeout}`)

const checkPropName = (propName, displayName) => {
  invariant(isEmpty(propName) || isString(propName),
    `withTimer() ${displayName} argument must be of type string. Current value: ${propName}`)
}

export const withTimer = (config = {}) => {
  const {
    delay: delayArg,
    onTimeout: onTimeoutArg,
    options: optionsArg = {}
  } = config

  const options = defaults(optionsArg, DEFAULT_OPTIONS)

  checkDelay(delayArg, false)
  checkOnTimeout(onTimeoutArg, false)
  checkPropName(options.cancelPropName, 'cancelPropName')
  checkPropName(options.finishPropName, 'finishPropName')
  checkPropName(options.resetPropName, 'resetPropName')
  checkPropName(options.startPropName, 'startPropName')

  return BaseComponent => class WithTimer extends React.Component {
    static propTypes = {
      delay: React.PropTypes.number,
      onTimeout: React.PropTypes.func
    }

    timeoutId = undefined

    constructor ({delay, onTimeout}) {
      super()
      checkDelay(delay, false)
      checkOnTimeout(onTimeout, false)
    }

    start = (delayOverride) => {
      if (!this.timeoutId) {
        const delay = delayOverride || this.props.delay || delayArg
        const onTimeout = this.props.onTimeout || onTimeoutArg

        checkDelay(delay, true)
        checkOnTimeout(onTimeout, true)

        this.timeoutId = setTimeout(this.timeout, delay)
      }
    }

    cancel = () => {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }

    reset = (delayOverride) => {
      this.cancel()
      this.start(delayOverride)
    }

    finish = () => {
      this.cancel()
      this.timeout()
    }

    timeout = () => {
      this.timeoutId = undefined
      const onTimeout = this.props.onTimeout || onTimeoutArg
      onTimeout(this.props)
    }

    getCallbackProps = () =>
      CALLBACK_METHODS.reduce(
        (memo, cb) => {
          const isPropPassed = options.passedProps.includes(cb)
          if (isPropPassed) {
            const propName = options[`${cb}PropName`]
            memo[propName] = this[cb]
          }
          return memo
        }, {}
      )

    componentWillMount () {
      if (options.startOnMount) {
        this.start()
      }
    }

    componentWillUnmount () {
      this.cancel()
    }

    render () {
      console.log(this.getCallbackProps())
      const newProps = {
        ...this.getCallbackProps(),
        ...this.props
      }
      return <BaseComponent {...newProps} />
    }
  }
}
