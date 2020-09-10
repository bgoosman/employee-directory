/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'

export function Filters ({ filterDefaults, onChange }) {
  const [filter, setFilter] = useState(filterDefaults)

  useEffect(() => {
    onChange(filter)
  }, [filter])

  return <Form>
    <Form.Group controlId="formName">
      <Form.Label>Name</Form.Label>
      <Form.Control type="text" placeholder="Name..." value={filter.name} onChange={e => setFilter({ ...filter, name: e.target.value })} />
    </Form.Group>
    <Form.Group controlId="formEmail">
      <Form.Label>Email</Form.Label>
      <Form.Control type="email" placeholder="Email..." value={filter.email} onChange={e => setFilter({ ...filter, email: e.target.value })} />
    </Form.Group>
    <Form.Group controlId="formTitle">
      <Form.Label>Title</Form.Label>
      <Form.Control type="text" placeholder="Title..." value={filter.title} onChange={e => setFilter({ ...filter, title: e.target.value })} />
    </Form.Group>
    <Form.Group controlId="formDepartment">
      <Form.Label>Department</Form.Label>
      <Form.Control type="text" placeholder="Department..." value={filter.department} onChange={e => setFilter({ ...filter, department: e.target.value })} />
    </Form.Group>
  </Form>
}
