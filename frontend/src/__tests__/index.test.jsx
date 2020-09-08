import * as React from 'react'
import { render } from '@testing-library/react'
import App from '../App'

jest.mock('components/employee-list', () => {
  return {
    EmployeeList: () => null
  }
})

it('renders App', () => {
  render(
    <App />
  )
})
