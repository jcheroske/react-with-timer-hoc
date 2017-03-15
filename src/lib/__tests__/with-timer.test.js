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

test('withTimer undefined delay arg, prop, and override', t => {
  const Wrapped = withTimer({
    onTimeout: () => null,
    options: {
      passedProps: ['start']
    }
  })(t.context.ComponentSpy)

  mount(<Wrapped/>)

  t.throws(
    () => t.context.ComponentSpy.lastCall.args[0].startTimer(),
    Error,
    'Undefined delay did not throw on startTimer()'
  )
})

test('withTimer undefined onTimeout arg and prop', t => {
  const {ComponentSpy} = t.context

  const Wrapped = withTimer({
    delay: 0,
    options: {
      passedProps: ['start']
    }
  })(ComponentSpy)

  mount(<Wrapped />)

  t.throws(
    () => ComponentSpy.lastCall.args[0].startTimer(),
    Error,
    'Undefined onTimeout did not throw on startTimer()'
  )
})

test('withTimer startTimer works with args', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy,
    options: {
      passedProps: ['start']
    }

  })(ComponentSpy)

  mount(<Wrapped />)

  const {startTimer} = ComponentSpy.lastCall.args[0]
  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  startTimer()
  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  clock.tick(100)
  t.true(timeoutSpy.calledOnce, 'onTimeout not called')
})

test('withTimer startTimer works with props', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    options: {
      passedProps: ['start']
    }
  })(ComponentSpy)

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
    onTimeout: timeoutSpy,
    options: {
      passedProps: ['cancel', 'start']
    }

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
    onTimeout: timeoutSpy,
    options: {
      passedProps: ['reset', 'start']
    }

  })(ComponentSpy)

  mount(<Wrapped />)

  const {startTimer, resetTimer} = ComponentSpy.lastCall.args[0]

  startTimer()
  clock.tick(50)
  resetTimer()
  clock.tick(75)
  t.true(timeoutSpy.notCalled, 'onTimeout called before it should be')
  clock.tick(50)
  t.true(timeoutSpy.calledOnce, 'onTimeout not called')
})

test('withTimer finishTimer works', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy,
    options: {
      passedProps: ['finish', 'start']
    }

  })(ComponentSpy)

  mount(<Wrapped />)

  const {startTimer, finishTimer} = ComponentSpy.lastCall.args[0]

  startTimer()
  clock.tick(50)
  t.true(timeoutSpy.notCalled, 'onTimeout called too early')
  finishTimer()
  t.true(timeoutSpy.calledOnce, 'onTimeout not called on finishTimer')
  clock.tick(100)
  t.true(timeoutSpy.calledOnce, 'onTimeout called more than once')
})

test('withTimer unmounting component stops timer', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy,
    options: {
      passedProps: ['start']
    }

  })(ComponentSpy)

  const wrapper = mount(<Wrapped />)

  const {startTimer} = ComponentSpy.lastCall.args[0]

  startTimer()
  t.true(timeoutSpy.notCalled, 'onTimeout called')
  clock.tick(50)
  t.true(timeoutSpy.notCalled, 'onTimeout called')
  wrapper.unmount()
  clock.tick(100)
  t.true(timeoutSpy.notCalled, 'onTimeout called')
})
