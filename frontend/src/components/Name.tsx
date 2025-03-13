/**
 * @file Name.tsx - ./frontend/src/components
 * @description The `Name` component is a functional React component that renders an input field for users to enter their full name. It utilizes a prop function `setName` to update the parent component's state whenever the input value changes. This component enhances form usability by providing clear labeling and structured styling.
 * @author matthewb
 * @date Created: 2024-09-30 | Last Modified: 2025-03-13
 * @version 1.0.0
 * @license MIT
 * @usage The `Name` component should be used within a form or user input section where capturing the user's full name is required. It requires a `setName` function as a prop to handle updates to the name state in the parent component. Example usage:
 *        `<Name setName={setNameFunction} />`
 * @dependencies
 *  - React for building the component.
 * @relatedFiles Related components may include other input components or forms that gather user information, such as `Email.tsx` or `Address.tsx`.
 */

import React from 'react'
import { ReportType, UserType } from '../data/types'
import { Title } from './Text'
import Container from './Container'
import { users } from '../data/users'

interface NameProps {
  report: ReportType
  handleReportChange: (updatedReport: ReportType) => void
}

const Name: React.FC<NameProps> = ({ report, handleReportChange }) => {
  const handleNameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedUser: UserType = {
      ...report.user,
      name: event.target.value,
    }

    const updatedReport: ReportType = {
      ...report,
      user: updatedUser,
    }

    handleReportChange(updatedReport)
  }

  const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Container>
      <Title text="User Information" />
      <div className="flex flex-col w-full items-start space-y-2">
        <select
          className="p-2 w-full border-grey-300 border-b-2"
          id="projectName"
          value={report.user.name}
          onChange={handleNameChange}
        >
          <option disabled value="">
            Select your name
          </option>

          {sortedUsers.map((user) => (
            <option key={user.name} value={user.name}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
    </Container>
  )
}

export default Name
