/* eslint-disable react/prop-types */
import React from 'react'
import { Spinner, Alert, Pagination } from 'react-bootstrap'
import { useQuery, gql, NetworkStatus } from '@apollo/client'

export const GET_EMPLOYEES_QUERY = gql`
  query getEmployees($filter: FilterInput, $first: Int, $after: String, $last: Int, $before: String) {
    employees(filter: $filter, first: $first, after: $after, last: $last, before: $before) {
      totalCount
      edges {
        node {
          id
          name
          email
          dob
          phone
          picture_thumbnail
          department
          title
        }
        cursor
      }
      pageInfo {
        endCursor
      }
    }
  }
`

export function EmployeeRow ({ employee: { name } }) {
  return <div>{name}</div>
}

export function EmployeeList ({ filter, pageSize }) {
  const { loading, error, data, refetch, networkStatus } = useQuery(GET_EMPLOYEES_QUERY, {
    variables: {
      filter,
      first: pageSize,
      after: undefined,
      last: undefined,
      before: undefined
    },
    notifyOnNetworkStatusChange: true
  })

  if (loading || networkStatus === NetworkStatus.refetch) {
    return (
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    )
  }

  if (error) {
    return <Alert variant="danger" dismissible>
      <Alert.Heading>Failed to fetch employees</Alert.Heading>
      <p>{error.message}</p>
    </Alert>
  }

  const fetchPreviousPage = () => {
    refetch({
      filter,
      first: undefined,
      after: undefined,
      last: pageSize,
      before: data.employees.edges[0].node.name
    })
  }

  const fetchNextPage = () => {
    refetch({
      filter,
      first: pageSize,
      after: data.employees.pageInfo.endCursor,
      last: undefined,
      before: undefined
    })
  }

  const totalCount = data.employees.totalCount
  const edgeCount = data.employees.edges.length
  return (
    <div>
      <h1>
        Displaying {edgeCount} of {totalCount} employees
      </h1>
      <div>
        {data.employees.edges.map((edge) => (
          <EmployeeRow key={edge.cursor} employee={edge.node} />
        ))}
      </div>
      <Pagination>
        <Pagination.Prev onClick={fetchPreviousPage} />
        <Pagination.Next onClick={fetchNextPage} />
      </Pagination>
    </div>
  )
}
