/**
 * @file Mileage.tsx - ./frontend/src/components/expenses
 * @description This component allows users to enter and manage mileage-related information for an expense. It includes fields for selecting the purpose of the trip, entering 'From' and 'To' locations with Google Places Autocomplete, and a round trip checkbox. It also calculates the distance between the two locations using the Google Distance Matrix API and updates the expense with the calculated mileage value. This component is part of the expense tracking system, designed to handle travel-related costs more efficiently by automating mileage calculations based on input locations and providing round-trip options when necessary. It uses Google Maps APIs for autocomplete and distance calculations, enhancing the user experience with location-based inputs and data processing in real-time.
 * @author matthewb
 * @date Created: 2024-09-30 | Last Modified: 2024-10-02
 * @version 1.0.0
 * @license MIT
 * @usage Import and use the `Mileage` component in forms related to travel expenses where users need to log trip details. This component requires passing an `ExpenseType` object and a handler to manage state updates.
 *        Example usage:
 *        `<Mileage expense={expense} handleExpenseChange={updateExpense} />`
 * @dependencies React, `ExpenseType` from `../../data/types`, `@react-google-maps/api` for Google Maps Autocomplete and Distance Matrix APIs.
 * @relatedFiles Parent components like `ExpenseForm.tsx`, and types file `types.ts` for `ExpenseType`.
 */

import React, { ChangeEvent, useEffect, useState } from 'react'
import { ExpenseType } from '../../data/types'
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api'
import { Libraries } from '@react-google-maps/api/dist/utils/make-load-script-url'

interface MileageProps {
  expense: ExpenseType
  handleExpenseChange: (updatedExpense: ExpenseType) => void
}

const libraries: Libraries = ['places']

const Mileage: React.FC<MileageProps> = ({ expense, handleExpenseChange }) => {
  const [fromAutocomplete, setFromAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null)
  const [toAutocomplete, setToAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Update here
    libraries,
  })

  useEffect(() => {
    const updatedExpense: ExpenseType = {
      ...expense,
      purpose: 'Business',
    }

    handleExpenseChange(updatedExpense)
  }, [])

  const calculateMileage = (expense: ExpenseType) => {
    if (!expense.fromLocation || !expense.toLocation) {
      return
    }

    if (!fromAutocomplete || !toAutocomplete) {
      return
    }

    const fromLocation = expense.fromLocation
    const toLocation = expense.toLocation

    const service = new google.maps.DistanceMatrixService()

    service
      .getDistanceMatrix({
        origins: [fromLocation],
        destinations: [toLocation],
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((response) => {
        const distanceElement = response.rows[0]?.elements[0]

        const distanceInMeters = distanceElement.distance.value
        if (distanceInMeters) {
          const distanceInMiles = distanceInMeters / 1609.34 // Convert meters to miles

          const updatedExpense: ExpenseType = {
            ...expense,
            mileage: distanceInMiles,
          }
          handleExpenseChange(updatedExpense)
        } else {
          console.error('Distance value is not available.')
        }
      })
      .catch((error: unknown) => {
        console.error('An error occurred while calculating mileage:', error)
      })
  }

  const onFromPlaceChanged = () => {
    if (fromAutocomplete) {
      const place = fromAutocomplete.getPlace()
      const updatedExpense: ExpenseType = {
        ...expense,
        fromLocation: place.formatted_address ?? '',
      }
      handleExpenseChange(updatedExpense)
      calculateMileage(updatedExpense)
    } else {
      const updatedExpense: ExpenseType = {
        ...expense,
        mileage: undefined,
      }
      handleExpenseChange(updatedExpense)
    }
  }

  const onToPlaceChanged = () => {
    if (toAutocomplete) {
      const place = toAutocomplete.getPlace()
      const updatedExpense: ExpenseType = {
        ...expense,
        toLocation: place.formatted_address,
      }
      handleExpenseChange(updatedExpense)
      calculateMileage(updatedExpense)
    }
  }

  const handlePurposeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const updatedExpense: ExpenseType = {
      ...expense,
      purpose: event.target.value,
    }
    handleExpenseChange(updatedExpense)
  }

  const handleRoundTripChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedExpense: ExpenseType = {
      ...expense,
      roundTrip: event.target.checked,
    }
    handleExpenseChange(updatedExpense)
  }

  const [mileageEntry, setMileageEntry] = useState<string>('Calculated')

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="flex flex-col w-full items-start space-y-2">
        <label>Purpose</label>
        <select
          className="p-2 w-full border-grey-300 border-b-2"
          id="purpose"
          value={expense.purpose}
          onChange={handlePurposeChange}
        >
          <option value="" disabled>
            Select a category
          </option>
          <option value="Business">Business</option>
          <option value="Personal">Personal</option>
        </select>
      </div>

      <div className="flex flex-col w-full items-start space-y-2">
        <label>Mileage Entry</label>
        <select
          className="p-2 w-full border-grey-300 border-b-2"
          id="mileageEntry"
          value={mileageEntry}
          onChange={(event) => {
            setMileageEntry(event.target.value)
          }}
        >
          <option value="" disabled>
            Select a category
          </option>
          <option value="Calculated">Calculated</option>
          <option value="Manual">Manual</option>
        </select>
      </div>

      {mileageEntry === 'Calculated' ? (
        <>
          <div className="flex flex-col w-full items-start space-y-2">
            <label>From</label>
            <Autocomplete
              className="w-full"
              onLoad={(autocomplete) => {
                setFromAutocomplete(autocomplete)
              }}
              onPlaceChanged={onFromPlaceChanged}
            >
              <input
                className="p-2 w-full border-grey-300 border-b-2"
                type="text"
                id="from"
                value={expense.fromLocation ?? ''}
                onChange={(event) => {
                  handleExpenseChange({
                    ...expense,
                    fromLocation: event.target.value,
                  })
                }}
              />
            </Autocomplete>
          </div>

          <div className="flex flex-col w-full items-start space-y-2">
            <label>To</label>
            <Autocomplete
              className="w-full"
              onLoad={(autocomplete) => {
                setToAutocomplete(autocomplete)
              }}
              onPlaceChanged={onToPlaceChanged}
            >
              <input
                className="p-2 w-full border-grey-300 border-b-2"
                type="text"
                id="to"
                value={expense.toLocation}
                onChange={(event) => {
                  handleExpenseChange({
                    ...expense,
                    toLocation: event.target.value,
                    mileage: undefined,
                  })
                }}
              />
            </Autocomplete>
          </div>

          <div className="flex w-full justify-between text-gray-500">
            <label>Mileage</label>
            <div>
              {expense.mileage
                ? (
                    Number(expense.mileage) *
                    (expense.roundTrip != undefined && expense.roundTrip
                      ? 2
                      : 1)
                  ).toFixed(0)
                : 0}{' '}
              miles
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col w-full items-start space-y-2">
          <label>Mileage</label>
          <input
            className="p-2 w-full border-grey-300 border-b-2"
            type="text"
            id="mileage"
            placeholder="Enter mileage"
            value={expense.mileage ?? ''}
            onChange={(event) => {
              handleExpenseChange({
                ...expense,
                mileage: Number(event.target.value),
              })
            }}
          />
        </div>
      )}

      <div className="flex w-full items-center justify-between">
        <label className="text-gray-600 text-nowrap">Round Trip</label>
        <input
          type="checkbox"
          id="roundTrip"
          checked={expense.roundTrip}
          onChange={handleRoundTripChange}
        />
      </div>
    </>
  )
}

export default Mileage
