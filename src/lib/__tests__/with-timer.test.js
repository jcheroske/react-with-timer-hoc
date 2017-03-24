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
    onTimeout: () => null
  })(t.context.ComponentSpy)

  mount(<Wrapped />)

  t.throws(
    () => t.context.ComponentSpy.lastCall.args[0].startTimer(),
    Error,
    'Undefined delay did not throw on startTimer()'
  )
})

test('withTimer undefined onTimeout arg and prop', t => {
  const {ComponentSpy} = t.context

  const Wrapped = withTimer({
    delay: 0
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
    onTimeout: timeoutSpy
  })(ComponentSpy)

  mount(<Wrapped />)

  const {startTimer} = ComponentSpy.lastCall.args[0]
  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  startTimer()
  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  clock.tick(99)
  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  clock.tick(1)
  t.true(timeoutSpy.calledOnce, 'onTimeout not called')
})

test('withTimer startTimer works with props', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
  })(ComponentSpy)

  mount(<Wrapped delay={100} onTimeout={timeoutSpy} />)

  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  ComponentSpy.lastCall.args[0].startTimer()
  t.true(timeoutSpy.notCalled, 'onTimeout called early')
  clock.tick(100)
  t.true(timeoutSpy.calledOnce, 'onTimeout not called')
})

test('withTimer stopTimer works', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy
  })(ComponentSpy)

  mount(<Wrapped />)

  const {startTimer, stopTimer} = ComponentSpy.lastCall.args[0]
  startTimer()
  clock.tick(50)
  stopTimer()
  clock.tick(100)
  t.true(timeoutSpy.notCalled, 'onTimeout called when stopped')
})

test('withTimer resetTimer works', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy
  })(ComponentSpy)

  mount(<Wrapped />)

  const {startTimer, resetTimer} = ComponentSpy.lastCall.args[0]

  startTimer()
  clock.tick(50)
  resetTimer(200)
  clock.tick(175)
  t.true(timeoutSpy.notCalled, 'onTimeout called before it should be')
  clock.tick(25)
  t.true(timeoutSpy.calledOnce, 'onTimeout not called')
})

test('withTimer finishTimer works', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy
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
    onTimeout: timeoutSpy
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

test('withTimer starts on mount', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy,
    options: {
      startOnMount: true
    }
  })(ComponentSpy)

  mount(<Wrapped />)

  clock.tick(50)
  t.true(timeoutSpy.notCalled, 'onTimeout called')
  clock.tick(100)
  t.true(timeoutSpy.calledOnce, 'onTimeout not called')
})

test('withTimer pauses, resumes, and completes on time', t => {
  const {clock, ComponentSpy, timeoutSpy} = t.context

  const Wrapped = withTimer({
    delay: 100,
    onTimeout: timeoutSpy
  })(ComponentSpy)

  mount(<Wrapped />)

  const {startTimer, pauseTimer, resumeTimer} = ComponentSpy.lastCall.args[0]

  t.true(timeoutSpy.notCalled, 'onTimeout called')
  startTimer()
  clock.tick(25)
  t.true(timeoutSpy.notCalled, 'onTimeout called')
  pauseTimer()
  t.true(timeoutSpy.notCalled, 'onTimeout called')
  clock.tick(100)
  t.true(timeoutSpy.notCalled, 'onTimeout called')
  resumeTimer()
  t.true(timeoutSpy.notCalled, 'onTimeout called')
  clock.tick(74)
  t.true(timeoutSpy.notCalled, 'onTimeout called')
  clock.tick(1)
  t.true(timeoutSpy.calledOnce, 'onTimeout not called')
})
