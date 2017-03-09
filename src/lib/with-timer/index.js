import 'babel-polyfill'
import invariant from 'invariant'
import { isEmpty, isFunction, isNumber, isString } from 'lodash'
import React, {Component, PropTypes} from 'react'

export const withTimer = ({
  delay: delayArg,
  onTimeout: onTimeoutArg,
  options: {
    cancelPropName = 'cancelTimer',
    finishPropName = 'finishTimer',
    restartPropName = 'restartTimer',
    startPropName = 'startTimer'
  } = {}
}) => {
  invariant(isNumber(delayArg) && delayArg >= 0, `withTimer() delay argument must be >= 0. Current value: ${delayArg}`)
  invariant(isFunction(onTimeoutArg), `withTimer() onTimeout argument must be a function. Current value: ${onTimeoutArg}`)
  invariant(isString(cancelPropName) && !isEmpty(cancelPropName),
    `withTimer() cancelPropName argument must be a non-empty string. Current value: ${cancelPropName}`)
  invariant(isString(finishPropName) && !isEmpty(finishPropName),
    `withTimer() finishPropName argument must be a non-empty string. Current value: ${finishPropName}`)
  invariant(isString(restartPropName) && !isEmpty(restartPropName),
    `withTimer() restartPropName argument must be a non-empty string. Current value: ${restartPropName}`)
  invariant(isString(startPropName) && !isEmpty(startPropName),
    `withTimer() startPropName argument must be a non-empty string. Current value: ${startPropName}`)

  return BaseComponent => {
    const factory = React.createFactory(BaseComponent)

    return class WithTimer extends Component {
      static propTypes = {
        delay: PropTypes.number,
        onTimeout: PropTypes.func
      }

      timeoutId = null

      start = delayOverride => {
        if (!this.timeoutId) {
          const delay = delayOverride || this.props.delay || delayArg
          invariant(isNumber(delay) && delay >= 0, `withTimer() delay must be >= 0. Current value: ${delayArg}`)
          this.timeoutId = setTimeout(this.timeout, delay)
        }
      }

      cancel = () => {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      }

      restart = delayOverride => {
        this.cancel()
        this.start(delayOverride)
      }

      finish = () => {
        this.cancel()
        this.timeout()
      }

      timeout = () => {
        this.timeoutId = null

        const onTimeout = this.props.onTimeout || onTimeoutArg
        invariant(isFunction(onTimeout), `withTimer() onTimeout must be a function. Current value: ${onTimeout}`)
        onTimeout(this.props)
      }

      componentWillUnmount () {
        this.cancel()
      }

      render () {
        const newProps = {
          [cancelPropName]: this.cancel,
          [finishPropName]: this.finish,
          [restartPropName]: this.restart,
          [startPropName]: this.start,
          ...this.props
        }
        return factory(newProps)
      }
    }
  }
}
