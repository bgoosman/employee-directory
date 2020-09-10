import * as React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { EmployeeModal } from '../employee-modal'
import { DEFAULT_EMPLOYEE } from '../employee-list'

const MOCK_EMPLOYEE = {
  id: '',
  name: 'name',
  email: 'email',
  phone: 'phone',
  picture_thumbnail: 'picture_thumbnail',
  dob: 'dob',
  title: 'title',
  department: 'department'
}

function renderUsage ({
  employee = DEFAULT_EMPLOYEE,
  onClose = () => {},
  onSubmit = () => {}
} = {}) {
  const utils = render(
    <EmployeeModal employee={employee} isVisible={true} onClose={onClose} onSubmit={onSubmit} />
  )

  return {
    ...utils,
    nameInput: utils.getByPlaceholderText('Name...'),
    emailInput: utils.getByPlaceholderText('Email...'),
    phoneInput: utils.getByPlaceholderText('Phone...'),
    pictureThumbnailInput: utils.getByPlaceholderText('Picture URL...'),
    dobInput: utils.getByPlaceholderText('Birthday...'),
    titleInput: utils.getByPlaceholderText('Title...'),
    departmentInput: utils.getByPlaceholderText('Department...'),
    submitButton: utils.getByText('Save')
  }
}

it('sets default form values', () => {
  const {
    nameInput,
    emailInput,
    phoneInput,
    pictureThumbnailInput,
    dobInput,
    titleInput,
    departmentInput
  } = renderUsage({ employee: MOCK_EMPLOYEE })

  expect(nameInput).toHaveValue(MOCK_EMPLOYEE.name)
  expect(emailInput).toHaveValue(MOCK_EMPLOYEE.email)
  expect(phoneInput).toHaveValue(MOCK_EMPLOYEE.phone)
  expect(pictureThumbnailInput).toHaveValue(MOCK_EMPLOYEE.picture_thumbnail)
  expect(dobInput).toHaveValue(MOCK_EMPLOYEE.dob)
  expect(titleInput).toHaveValue(MOCK_EMPLOYEE.title)
  expect(departmentInput).toHaveValue(MOCK_EMPLOYEE.department)
})

it('inputting text modifies the state', () => {
  const employee = Object.assign({}, MOCK_EMPLOYEE)
  const onSubmit = jest.fn()
  const {
    nameInput,
    emailInput,
    phoneInput,
    pictureThumbnailInput,
    dobInput,
    titleInput,
    departmentInput,
    submitButton
  } = renderUsage({ employee: DEFAULT_EMPLOYEE, onSubmit })

  fireEvent.change(nameInput, { target: { value: employee.name } })
  fireEvent.change(emailInput, { target: { value: employee.email } })
  fireEvent.change(phoneInput, { target: { value: employee.phone } })
  fireEvent.change(pictureThumbnailInput, { target: { value: employee.picture_thumbnail } })
  fireEvent.change(dobInput, { target: { value: employee.dob } })
  fireEvent.change(titleInput, { target: { value: employee.title } })
  fireEvent.change(departmentInput, { target: { value: employee.department } })
  fireEvent.click(submitButton)
  expect(onSubmit).toHaveBeenCalledWith(employee)
})
