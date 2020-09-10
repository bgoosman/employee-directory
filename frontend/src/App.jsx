import React from 'react'
import { EmployeeList } from './components/employee-list'

function App () {
  const filter = {}
  return <EmployeeList
    filter={filter}
    pageSize={25}
  />
}

export default App
