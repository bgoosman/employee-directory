import * as React from 'react'
import { render, waitForElementToBeRemoved } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EmployeeList, GET_EMPLOYEES_QUERY } from '../employee-list'
import { randomEmployees } from 'fixtures/random-employees'

const PAGE_SIZE = 25
const FIRST_PAGE = randomEmployees.slice(0, PAGE_SIZE)
const ERROR_TEXT = 'error during fetch'

function makeMockGetEmployeesQuery (filter, first, after, isError) {
  return {
    request: {
      query: GET_EMPLOYEES_QUERY,
      variables: { filter, first, after }
    },
    error: isError ? new Error(ERROR_TEXT) : null,
    result: () => {
      const index = after ? randomEmployees.findIndex(employee => employee.name.startsWith(after)) + 1 : 0
      const page = randomEmployees.slice(index, first)
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
  first = PAGE_SIZE,
  after = '',
  isError = false
} = {}) {
  const queryMocks = [makeMockGetEmployeesQuery(filter, first, after, isError)]
  const utils = render(
    <MockedProvider mocks={queryMocks} addTypename={false}>
      <EmployeeList filter={filter} first={first} after={after} isError={isError} />
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

  FIRST_PAGE.forEach(employee => {
    expect(getByText(employee.name)).toBeDefined()
  })
})

it('renders an error', async () => {
  const { getByText, waitForLoading } = renderUsage({ isError: true })

  await waitForLoading()

  expect(getByText('Failed to fetch employees')).toBeDefined()
  expect(getByText(ERROR_TEXT)).toBeDefined()
})
