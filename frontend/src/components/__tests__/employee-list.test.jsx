import * as React from 'react'
import { fireEvent, render, waitForElementToBeRemoved } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EmployeeList, DEFAULT_EMPLOYEE, GET_EMPLOYEES_QUERY, DELETE_EMPLOYEE_QUERY, UPDATE_EMPLOYEE_QUERY, CREATE_EMPLOYEE_QUERY } from '../employee-list'
import { randomEmployees } from 'fixtures/random-employees'
import { act } from 'react-dom/test-utils'

const PAGE_SIZE = 25
const PREVIOUS_PAGE = randomEmployees.slice(0, PAGE_SIZE)
const CURRENT_PAGE = randomEmployees.slice(PAGE_SIZE + 1, PAGE_SIZE * 2 + 1)
const NEXT_PAGE = randomEmployees.slice(PAGE_SIZE * 2 + 1, PAGE_SIZE * 3 + 1)
const ERROR_TEXT = 'error during fetch'

function makeMockGetEmployeesQuery (variables, isError, page) {
  return {
    request: {
      query: GET_EMPLOYEES_QUERY,
      variables
    },
    error: isError ? new Error(ERROR_TEXT) : null,
    result: () => {
      return {
        data: {
          employees: {
            totalCount: randomEmployees.length,
            edges: page.map(employee => {
              return {
                node: employee,
                cursor: employee.name
              }
            }),
            pageInfo: {
              endCursor: page[page.length - 1].name
            }
          }
        }
      }
    }
  }
}

function makeMockDeleteEmployeeQuery (variables) {
  return {
    request: {
      query: DELETE_EMPLOYEE_QUERY,
      variables
    },
    result: () => {
      return {
        data: {
          deleteEmployee: {
            count: 1
          }
        }
      }
    }
  }
}

function makeMockCreateEmployeeQuery (employeeToCreate, createdEmployee) {
  delete employeeToCreate.id
  return {
    request: {
      query: CREATE_EMPLOYEE_QUERY,
      variables: {
        input: employeeToCreate
      }
    },
    result: () => {
      return {
        data: {
          createEmployee: createdEmployee
        }
      }
    }
  }
}

function makeMockUpdateEmployeeQuery (updatedEmployee) {
  return {
    request: {
      query: UPDATE_EMPLOYEE_QUERY,
      variables: {
        input: updatedEmployee
      }
    },
    result: () => {
      return {
        data: {
          updateEmployee: updatedEmployee
        }
      }
    }
  }
}

function renderUsage ({
  filter = {},
  pageSize = PAGE_SIZE,
  isError = false,
  idToDelete = '',
  employeeToCreate = {},
  createdEmployee = {},
  updatedEmployee = {}
} = {}) {
  const queryMocks = [
    makeMockGetEmployeesQuery(
      {
        filter,
        first: pageSize,
        after: undefined,
        last: undefined,
        before: undefined
      },
      isError,
      CURRENT_PAGE
    ),
    makeMockGetEmployeesQuery(
      {
        filter,
        first: undefined,
        after: undefined,
        last: pageSize,
        before: CURRENT_PAGE[0].name
      },
      isError,
      PREVIOUS_PAGE
    ),
    makeMockGetEmployeesQuery(
      {
        filter,
        first: pageSize,
        after: CURRENT_PAGE[CURRENT_PAGE.length - 1].name,
        last: undefined,
        before: undefined
      },
      isError,
      NEXT_PAGE
    ),
    makeMockDeleteEmployeeQuery(
      {
        input: {
          id: idToDelete
        }
      }
    ),
    makeMockGetEmployeesQuery(
      {
        filter,
        first: pageSize,
        after: undefined,
        last: undefined,
        before: undefined
      },
      isError,
      CURRENT_PAGE
    ),
    makeMockCreateEmployeeQuery(employeeToCreate, createdEmployee),
    makeMockUpdateEmployeeQuery(updatedEmployee)
  ]
  const utils = render(
    <MockedProvider mocks={queryMocks} addTypename={false}>
      <EmployeeList filter={filter} pageSize={pageSize} />
    </MockedProvider>
  )
  return {
    ...utils,
    loadingSpinner: utils.getByRole('status'),
    waitForLoading: () => waitForElementToBeRemoved(() => utils.getByText('Loading...'))
  }
}

it('renders a loading spinner', () => {
  const { loadingSpinner } = renderUsage()

  expect(loadingSpinner).toBeDefined()
})

it('renders a list of employees', async () => {
  const { getByText, waitForLoading } = renderUsage()

  await waitForLoading()

  const header = getByText(`Displaying ${PAGE_SIZE} of ${randomEmployees.length} employees`)
  expect(header).toBeDefined()

  CURRENT_PAGE.forEach(employee => {
    expect(getByText(employee.name)).toBeDefined()
  })
})

it('renders an error', async () => {
  const { getByText, waitForLoading } = renderUsage({ isError: true })

  await waitForLoading()

  expect(getByText('Failed to fetch employees')).toBeDefined()
  expect(getByText(ERROR_TEXT)).toBeDefined()
})

it('fetches the previous page', async () => {
  const { getByText, waitForLoading } = renderUsage()

  await waitForLoading()

  const previousButton = getByText('Previous')
  expect(previousButton).toBeDefined()
  await act(async () => {
    fireEvent.click(previousButton)
  })

  PREVIOUS_PAGE.forEach(employee => {
    expect(getByText(employee.name)).toBeDefined()
  })
})

it('fetches the next page', async () => {
  const { getByText, waitForLoading } = renderUsage()

  await waitForLoading()

  const nextButton = getByText('Next')
  expect(nextButton).toBeDefined()
  await act(async () => {
    fireEvent.click(nextButton)
  })

  NEXT_PAGE.forEach(employee => {
    expect(getByText(employee.name)).toBeDefined()
  })
})

it('deletes an employee and reloads the page', async () => {
  const { getByText, getAllByText, waitForLoading } = renderUsage({
    idToDelete: CURRENT_PAGE[0].id
  })

  await waitForLoading()

  const deleteButtons = getAllByText('Delete')
  expect(deleteButtons).toBeDefined()
  await act(async () => {
    fireEvent.click(deleteButtons[0])
  })

  expect(getByText('Deleted 1 employee(s)')).toBeDefined()
})

it('updates an employee and reloads the page', async () => {
  const updatedEmployee = CURRENT_PAGE[0]
  const { getByText, getAllByText, waitForLoading } = renderUsage({
    updatedEmployee
  })

  await waitForLoading()

  const updateButtons = getAllByText('Edit')
  expect(updateButtons).toBeDefined()
  await act(async () => {
    fireEvent.click(updateButtons[0])
  })

  const submitButton = getByText('Save')
  expect(submitButton).toBeDefined()
  await act(async () => {
    fireEvent.click(submitButton)
  })

  expect(getByText(`Updated employee ${updatedEmployee.name}`)).toBeDefined()
})

it('creates an employee and reloads the page', async () => {
  const name = 'Antwerp'
  const id = 'id'
  const createdEmployee = Object.assign({}, { ...DEFAULT_EMPLOYEE, name, id })
  const employeeToCreate = Object.assign({}, DEFAULT_EMPLOYEE)
  const { getByText, waitForLoading } = renderUsage({
    employeeToCreate,
    createdEmployee
  })

  await waitForLoading()

  const createButton = getByText('New Employee')
  expect(createButton).toBeDefined()
  await act(async () => {
    fireEvent.click(createButton)
  })

  const submitButton = getByText('Save')
  expect(submitButton).toBeDefined()
  await act(async () => {
    fireEvent.click(submitButton)
  })

  expect(getByText(`Created employee ${name} with id ${id}`)).toBeDefined()
})

it('does not crash if the modal is closed', async () => {
  const name = 'Antwerp'
  const id = 'id'
  const createdEmployee = Object.assign({}, { ...DEFAULT_EMPLOYEE, name, id })
  const employeeToCreate = Object.assign({}, DEFAULT_EMPLOYEE)
  const { getByText, waitForLoading } = renderUsage({
    employeeToCreate,
    createdEmployee
  })

  await waitForLoading()

  const createButton = getByText('New Employee')
  expect(createButton).toBeDefined()
  await act(async () => {
    fireEvent.click(createButton)
  })

  const closeButton = getByText('Cancel')
  expect(closeButton).toBeDefined()
  fireEvent.click(closeButton)
})
