import * as React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { Filters } from '../filters'

const FILTER_DEFAULTS = {
  name: 'name',
  email: 'email',
  title: 'title',
  department: 'department'
}

function renderUsage ({
  filterDefaults = FILTER_DEFAULTS,
  onChange
} = {}) {
  const utils = render(
    <Filters filterDefaults={filterDefaults} onChange={onChange} />
  )

  return {
    ...utils,
    nameInput: utils.getByPlaceholderText('Name...'),
    emailInput: utils.getByPlaceholderText('Email...'),
    titleInput: utils.getByPlaceholderText('Title...'),
    departmentInput: utils.getByPlaceholderText('Department...')
  }
}

it('sets default filter values', () => {
  const {
    nameInput,
    emailInput,
    titleInput,
    departmentInput
  } = renderUsage({ filterDefaults: FILTER_DEFAULTS, onChange: jest.fn() })

  expect(nameInput).toHaveValue(FILTER_DEFAULTS.name)
  expect(emailInput).toHaveValue(FILTER_DEFAULTS.email)
  expect(titleInput).toHaveValue(FILTER_DEFAULTS.title)
  expect(departmentInput).toHaveValue(FILTER_DEFAULTS.department)
})

it('inputting text modifies the state and also calls the callback', () => {
  const onChange = jest.fn()
  const {
    nameInput,
    emailInput,
    titleInput,
    departmentInput
  } = renderUsage({ filterDefaults: FILTER_DEFAULTS, onChange })

  const newName = 'new name'
  fireEvent.change(nameInput, { target: { value: newName } })
  expect(onChange).toHaveBeenCalledWith({
    ...FILTER_DEFAULTS,
    name: newName
  })

  const newTitle = 'new title'
  fireEvent.change(titleInput, { target: { value: newTitle } })
  expect(onChange).toHaveBeenCalledWith({
    ...FILTER_DEFAULTS,
    name: newName,
    title: newTitle
  })

  const newEmail = 'new email'
  fireEvent.change(emailInput, { target: { value: newEmail } })
  expect(onChange).toHaveBeenCalledWith({
    ...FILTER_DEFAULTS,
    name: newName,
    title: newTitle,
    email: newEmail
  })

  const newDepartment = 'new department'
  fireEvent.change(departmentInput, { target: { value: newDepartment } })
  expect(onChange).toHaveBeenCalledWith({
    ...FILTER_DEFAULTS,
    name: newName,
    title: newTitle,
    email: newEmail,
    department: newDepartment
  })
})
