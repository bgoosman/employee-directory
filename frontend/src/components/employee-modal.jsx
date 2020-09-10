/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'

export function EmployeeModal ({ employee, isVisible, onClose, onSubmit }) {
  const [formState, setFormState] = useState(employee)
  useEffect(() => {
    setFormState(employee)
  }, [employee])
  return <Modal show={isVisible} onHide={onClose}>
    <Modal.Header closeButton>
      <Modal.Title>Employee</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" placeholder="Name..." value={formState.name} onChange={e => setFormState({ ...formState, name: e.target.value })} />
        </Form.Group>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="Email..." value={formState.email} onChange={e => setFormState({ ...formState, email: e.target.value })} />
        </Form.Group>
        <Form.Group controlId="formPhone">
          <Form.Label>Phone</Form.Label>
          <Form.Control type="text" placeholder="Phone..." value={formState.phone} onChange={e => setFormState({ ...formState, phone: e.target.value })} />
        </Form.Group>
        <Form.Group controlId="formPictureThumbnail">
          <Form.Label>Picture URL</Form.Label>
          <Form.Control type="text" placeholder="Picture URL..." value={formState.picture_thumbnail} onChange={e => setFormState({ ...formState, picture_thumbnail: e.target.value })} />
        </Form.Group>
        <Form.Group controlId="formDateOfBirth">
          <Form.Label>Birthday</Form.Label>
          <Form.Control type="text" placeholder="Birthday..." value={formState.dob} onChange={e => setFormState({ ...formState, dob: e.target.value })} />
        </Form.Group>
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control type="text" placeholder="Title..." value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} />
        </Form.Group>
        <Form.Group controlId="formDepartment">
          <Form.Label>Department</Form.Label>
          <Form.Control type="text" placeholder="Department..." value={formState.department} onChange={e => setFormState({ ...formState, department: e.target.value })} />
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onClose}>
          Cancel
      </Button>
      <Button variant="primary" onClick={() => onSubmit(formState)}>
          Save
      </Button>
    </Modal.Footer>
  </Modal>
}
