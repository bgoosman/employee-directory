import React, { useState } from 'react'
import { EmployeeList } from './components/employee-list'
import { Filters } from './components/filters'
import { Container, Row, Col } from 'react-bootstrap'

function App () {
  const [filter, setFilter] = useState({
    name: '',
    email: '',
    title: '',
    department: ''
  })

  return <Container fluid>
    <Row>
      <Col><h1>Employee directory</h1></Col>
    </Row>
    <Row>
      <Col md="auto">
        <h2>Filters</h2>
        <Filters filterDefaults={filter} onChange={setFilter} />
      </Col>
      <Col><EmployeeList filter={filter} pageSize={25} /></Col>
    </Row>
  </Container>
}

export default App
