import 'babel-polyfill'
import invariant from 'invariant'
import { isEmpty, isFunction, isNumber, isString } from 'lodash'
import React, {Component} from 'react'

export const withTimer = ({
  delay,
  onTimeout,
  options: {
    cancelPropName = 'cancelTimer',
    finishPropName = 'finishTimer',
    restartPropName = 'restartTimer',
    startPropName = 'startTimer'
  } = {}
}) => {
  invariant(isNumber(delay) && delay >= 0, `withTimer() delay argument must be >= 0. Current value: ${delay}`)
  invariant(isFunction(onTimeout), `withTimer() onTimeout argument must be a function. Current value: ${onTimeout}`)
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
      timeoutId = null;

      start = delayOverride => {
        if (!this.timeoutId) {
          delayOverride = delayOverride || delay
          this.timeoutId = setTimeout(this.timeout, delayOverride)
        }
      };

      cancel = () => {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      };

      restart = delay => {
        this.cancel()
        this.start(delay)
      };

      finish = () => {
        this.cancel()
        this.timeout()
      };

      timeout = () => {
        this.timeoutId = null
        onTimeout(this.props)
      };

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
