/* eslint-disable react/prop-types */
import React from 'react'
import { Spinner, Alert } from 'react-bootstrap'
import { useQuery, gql } from '@apollo/client'

export const GET_EMPLOYEES_QUERY = gql`
  query getEmployees($filter: FilterInput, $first: Int, $after: String) {
    employees(filter: $filter, first: $first, after: $after) {
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

export function EmployeeList ({ filter, first, after }) {
  const { loading, error, data } = useQuery(GET_EMPLOYEES_QUERY, {
    variables: { filter, first, after }
  })

  if (loading) {
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

  return (
    <div>
      <h1>
        Displaying {first} of {data.employees.totalCount} employees
      </h1>
      <div>
        {data &&
          data.employees.edges.map((edge) => (
            <EmployeeRow key={edge.cursor} employee={edge.node} />
          ))}
      </div>
    </div>
  )
}
