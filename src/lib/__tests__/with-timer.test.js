import test from 'ava'
import {mount} from 'enzyme'
import React from 'react'
import sinon from 'sinon'
import {withTimer} from '../with-timer'

test.beforeEach(t => {
  t.context = {
    clock: sinon.useFakeTimers(),
    ComponentSpy: sinon.spy(() => null),
    timeoutSpy: sinon.spy(() => null)
  }
})

test.afterEach(t => {
  t.context.clock.restore()
})

test('withTimer argument checks', t => {
  t.throws(
    () =>
      withTimer({
        delay: -1,
        onTimeout: () => {}
      }),
    Error,
    'Negative delay did not throw'
  )

  t.throws(
    () =>
      withTimer({
        delay: 0,
        onTimeout: 'not a function'
      }),
    Error,
    'String onTimeout did not throw'
  )
})

test('withTimer null delay arg, prop, and override', t => {
  const Wrapped = withTimer({
    onTimeout: () => null
  })(t.context.ComponentSpy)

  mount(<Wrapped/>)

  t.throws(
    () => t.context.ComponentSpy.lastCall.args[0].startTimer(),
    Error,
    'Null delay did not throw on startTimer()'
  )
})

test('withTimer null onTimeout arg and prop', t => {
  const {ComponentSpy} = t.context

  const Wrapped = withTimer({
    delay: 0
  })(ComponentSpy)

  mount(<Wrapped />)

  t.throws(
    () => ComponentSpy.lastCall.args[0].startTimer(),
    Error,
    'Null onTimeout did not throw on startTimer()'
  )
})

test('withTimer startTimer works with args', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy
  })(ComponentSpy)

  mount(<Wrapped />)

  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  ComponentSpy.lastCall.args[0].startTimer()
  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  clock.tick(100)
  t.true(timeoutSpy.calledOnce, 'onTimeout not called')
})

test('withTimer startTimer works with props', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer()(ComponentSpy)

  mount(<Wrapped delay={100} onTimeout={timeoutSpy} />)

  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  ComponentSpy.lastCall.args[0].startTimer()
  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  clock.tick(100)
  t.true(timeoutSpy.calledOnce, 'onTimeout not called')
})

test('withTimer cancelTimer works', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy
  })(ComponentSpy)

  mount(<Wrapped />)

  const {startTimer, cancelTimer} = ComponentSpy.lastCall.args[0]
  startTimer()
  clock.tick(50)
  cancelTimer()
  clock.tick(100)
  t.true(timeoutSpy.notCalled, 'onTimeout called when canceled')
})

test('withTimer resetTimer works', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy
  })(ComponentSpy)

  mount(<Wrapped />)

  const {startTimer, cancelTimer} = ComponentSpy.lastCall.args[0]

})
