import test from 'ava'
import {mount} from 'enzyme'
import React from 'react'
import sinon from 'sinon'
import {withTimer} from '../with-timer'

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

test('withTimer prop handling', t => {

})
