import React from 'react'
import { EmployeeList } from './components/employee-list'

function App () {
  const filter = {}
  const first = 25
  const after = ''
  return <EmployeeList filter={filter} first={first} after={after} />
}

export default App
