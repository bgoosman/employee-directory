/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { Button, Spinner, Alert, Pagination, Table } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { useQuery, useMutation, gql, NetworkStatus } from '@apollo/client'
import { EmployeeModal } from './employee-modal'

export const DEFAULT_EMPLOYEE = {
  id: '',
  name: '',
  email: '',
  dob: '',
  phone: '',
  picture_thumbnail: '',
  department: '',
  title: ''
}

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

export const CREATE_EMPLOYEE_QUERY = gql`
  mutation createEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      id
      name
      email
      dob
      phone
      picture_thumbnail
      department
      title
    }
  }
`

export const UPDATE_EMPLOYEE_QUERY = gql`
  mutation updateEmployee($input: UpdateEmployeeInput!) {
    updateEmployee(input: $input) {
      id
      name
      email
      dob
      phone
      picture_thumbnail
      department
      title
    }
  }
`

export const DELETE_EMPLOYEE_QUERY = gql`
  mutation deleteEmployee($input: DeleteEmployeeInput!) {
    deleteEmployee(input: $input) {
      count
    }
  }
`

export function EmployeeRow ({ employee: { id, name, email, department, title, picture_thumbnail }, employee, onDelete, onEdit }) {
  return <tr>
    <td><motion.img src={picture_thumbnail} whileHover={{ scale: 1.5 }} className="profile" /></td>
    <td>{name}</td>
    <td>{email}</td>
    <td>{department}</td>
    <td>{title}</td>
    <td>
      <Button variant="outline-primary" size="sm" onClick={() => onEdit(employee)} block>Edit</Button>
      <Button variant="outline-danger" size="sm" onClick={() => onDelete(id)} block>Delete</Button>
    </td>
  </tr>
}

export function EmployeeList ({ filter, pageSize }) {
  const [showModal, setShowModal] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState(DEFAULT_EMPLOYEE)
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
  const [createEmployee, createResponse] = useMutation(CREATE_EMPLOYEE_QUERY)
  const [updateEmployee, updateResponse] = useMutation(UPDATE_EMPLOYEE_QUERY)
  const [deleteEmployee, deleteResponse] = useMutation(DELETE_EMPLOYEE_QUERY)

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

  const onDelete = async (id) => {
    await deleteEmployee({
      variables: {
        input: {
          id
        }
      }
    })
    refetch()
  }

  const onEdit = (employee) => {
    setCurrentEmployee(employee)
    setShowModal(true)
  }

  const onCreate = () => {
    setCurrentEmployee(DEFAULT_EMPLOYEE)
    setShowModal(true)
  }

  const onModalClose = () => {
    setShowModal(false)
  }

  const onModalSubmit = async (employee) => {
    setShowModal(false)
    if (employee.id === '') {
      delete employee.id
      await createEmployee({
        variables: {
          input: employee
        }
      })
      refetch()
    } else {
      delete employee.__typename
      await updateEmployee({
        variables: {
          input: employee
        }
      })
      refetch()
    }
  }

  const totalCount = data.employees.totalCount
  const edgeCount = data.employees.edges.length
  return (
    <div>
      <h2>
        Displaying {edgeCount} of {totalCount} employees {' '}
        <Button variant="primary" onClick={onCreate}>New Employee</Button>
      </h2>
      {createResponse && createResponse.called && createResponse.data && createResponse.data.createEmployee &&
        <Alert variant="success">
          Created employee {createResponse.data.createEmployee.name} with id {createResponse.data.createEmployee.id}
        </Alert>}
      {updateResponse && updateResponse.called && updateResponse.data && updateResponse.data.updateEmployee &&
        <Alert variant="success">
          Updated employee {updateResponse.data.updateEmployee.name}
        </Alert>}
      {deleteResponse && deleteResponse.called && deleteResponse.data && deleteResponse.data.deleteEmployee &&
        <Alert variant="success">
          Deleted {deleteResponse.data.deleteEmployee.count} employee(s)
        </Alert>}
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Title</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.employees.edges.map((edge) => (
            <EmployeeRow key={edge.cursor} employee={edge.node} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </tbody>
      </Table>
      <Pagination>
        <Pagination.Prev onClick={fetchPreviousPage} />
        <Pagination.Next onClick={fetchNextPage} />
      </Pagination>
      <EmployeeModal
        employee={currentEmployee}
        isVisible={showModal}
        onSubmit={onModalSubmit}
        onClose={onModalClose}
      />
    </div>
  )
}
