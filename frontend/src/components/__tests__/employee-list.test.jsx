import * as React from 'react'
import { fireEvent, render, waitForElementToBeRemoved } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EmployeeList, GET_EMPLOYEES_QUERY } from '../employee-list'
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

function renderUsage ({
  filter = {},
  pageSize = PAGE_SIZE,
  isError = false
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
    )
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
