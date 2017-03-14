import invariant from 'invariant'
import { isEmpty, isFunction, isNumber, isString, isUndefined, toPairs } from 'lodash'
import * as React from 'react'

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
    options = {
      cancelPropName: 'cancelTimer',
      finishPropName: 'finishTimer',
      resetPropName: 'resetTimer',
      startPropName: 'startTimer'
    }
  } = config

  const {cancelPropName, finishPropName, resetPropName, startPropName} = options

  checkDelay(delayArg, false)
  checkOnTimeout(onTimeoutArg, false)
  checkPropName(cancelPropName, 'cancelPropName')
  checkPropName(finishPropName, 'finishPropName')
  checkPropName(resetPropName, 'resetPropName')
  checkPropName(startPropName, 'startPropName')

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

    PROP_NAME_OPTION_TO_CALLBACK_MAP = {
      cancelPropName: this.cancel,
      finishPropName: this.finish,
      resetPropName: this.reset,
      startPropName: this.start
    }

    getCallbackProps = () =>
      toPairs(this.PROP_NAME_OPTION_TO_CALLBACK_MAP).reduce(
        (props, [propNameOption, callback]) => {
          if (options[propNameOption]) {
            props[ options[propNameOption] ] = callback
          }
          return props
        }, {}
      )

    componentWillUnmount () {
      this.cancel()
    }

    render () {
      const newProps = {
        ...this.getCallbackProps(),
        ...this.props
      }
      return <BaseComponent {...newProps} />
    }
  }
}
