/**
 * @file PDF.tsx - ./frontend/src/components
 * @description Component to generate PDF reports from project and expense data.
 * @author tanujk
 * @date Created: 2024-10-02 | Last Modified: 2024-10-02
 * @version 1.0.0
 * @license MIT
 * @usage Pass in `report.projects` and `name` props to render a detailed expense report.
 * @dependencies
 *  - pdf-lib: ^1.17.1 // For creating and manipulating PDF documents
 *  - react: ^18.0.0 // React library for building user interfaces
 * @relatedFiles
 *  - types.ts: ../data/types // Type definitions for the project
 *  - results.ts: ../data/results // Data results for calculations
 *  - settingsService.ts: ../services/settingsService // Service for fetching settings
 */

import React, { useEffect, useState } from 'react'
import { ReportType } from '../data/types'
import {
  PDFDocument,
  rgb,
  degrees,
  StandardFonts,
  PDFPage,
  PDFFont,
  RGB,
  PDFImage,
} from 'pdf-lib'
import { sessionAttachments, total, breakdown } from '../data/results'
import settingsService from '../services/settingsService'
import ATECLogo from '/images/ATEC-pdf-logo.png'
import Button from './Button'
import { Subtitle, Title } from './Text'
import Container from './Container'
import { users } from '../data/users'

interface PDFProps {
  report: ReportType
}

const PDF: React.FC<PDFProps> = ({ report }) => {
  const [settings, setSettings] = useState({
    mileageRate: 0,
    perDiem: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
    },
  })

  useEffect(() => {
    settingsService
      .get()
      .then((response) => {
        setSettings(response)
      })
      .catch((error: unknown) => {
        console.log(error)
      })
  }, [])

  // Utility function to create a PDF from an image file
  const createPdfFromImage = async (
    imageBytes: ArrayBuffer,
    fileType: string
  ): Promise<Uint8Array> => {
    try {
      const pdfDoc = await PDFDocument.create()
      let image

      if (fileType === 'image/jpeg') {
        image = await pdfDoc.embedJpg(imageBytes)
      } else if (fileType === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes)
      } else {
        throw new Error('Unsupported image format')
      }

      const { width, height } = image
      const page = pdfDoc.addPage([width, height])
      page.drawImage(image, { x: 0, y: 0, width, height })

      return await pdfDoc.save()
    } catch (error) {
      console.error('Error creating PDF from image:', error)
      // Return an empty PDF or placeholder if an error occurs
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([600, 400]) // Arbitrary page size
      page.drawText('Unable to convert this file to PDF.', { x: 50, y: 350 })
      return pdfDoc.save()
    }
  }

  // Function to convert non-PDF files to PDF format
  const convertFileToPdf = async (file: File): Promise<Uint8Array> => {
    const fileBytes = await file.arrayBuffer()
    const fileType = file.type

    try {
      if (fileType.startsWith('image/')) {
        // If the file is an image, convert it to a PDF
        return await createPdfFromImage(fileBytes, fileType)
      } else {
        // For other file types, create a placeholder PDF
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([600, 400]) // Arbitrary page size

        page.drawText(`File: ${file.name}`, { x: 50, y: 350 })
        page.drawText('The file cannot be displayed here.', { x: 50, y: 300 })
        page.drawText('Please refer to the attached file.', { x: 50, y: 250 })

        return await pdfDoc.save()
      }
    } catch (error) {
      console.error('Error converting file to PDF:', error)
      // Return an empty PDF or placeholder if an error occurs
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([600, 400]) // Arbitrary page size
      page.drawText('Error processing this file.', { x: 50, y: 350 })
      return pdfDoc.save()
    }
  }

  const getCurrentDate = (): string => {
    const today = new Date()

    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDownloadPDF = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    settingsService
      .get()
      .then((response) => {
        setSettings(response)
      })
      .catch((error: unknown) => {
        console.log(error)
      })

    // Input Validation (Name)
    let alertText = ''
    if (!report.user.name) {
      //setIsNameInvalid(true);
      alertText += 'Invalid name field.\n'
    }

    // Input Validation (Expenses)
    report.projects.forEach((project, index) => {
      // Expenses present
      if (project.expenses.length === 0) {
        alertText +=
          `Required expenses in project: ${(index + 1).toString()}.` + '\n'
      }

      // Name
      if (project.name == '') {
        alertText +=
          `Required name in project: ${(index + 1).toString()}.` + '\n'
      }

      // Project Description
      else if (
        project.name === 'Sales/Proposals' ||
        project.name === 'Warranty'
      ) {
        if (project.description == undefined || project.description == '') {
          alertText +=
            `Required description in project: ${project.name}.` + '\n'
        }
      }

      project.expenses.forEach((expense, sub_index) => {
        // Category
        if (!expense.costCategory.trim()) {
          alertText +=
            `Required cost category for expense ${(
              sub_index + 1
            ).toString()} in project: ${project.name}.` + '\n'
        }

        // Date
        if (!expense.date.trim()) {
          alertText +=
            `Required date for expense ${(
              sub_index + 1
            ).toString()} in project: ${project.name}.` + '\n'
        }

        // Cost
        if (
          expense.costCategory != 'Mileage' &&
          expense.costCategory != 'Per Diem'
        ) {
          const cost = expense.cost
          if (
            !cost ||
            cost <= 0 ||
            !/^\d+(\.\d{1,2})?$/.test(cost.toString())
          ) {
            alertText +=
              `Invalid cost for expense ${(
                sub_index + 1
              ).toString()} in project: ${project.name}.` + '\n'
          }
        }

        // Expense Description
        if (
          expense.costCategory == 'Client Entertainment' ||
          expense.costCategory == 'Other' ||
          expense.costCategory == 'Wellness' ||
          expense.costCategory == 'Company Events' ||
          expense.costCategory == 'Relocation' ||
          expense.costCategory == 'Job Site Material'
        ) {
          if (!expense.description?.trim()) {
            alertText +=
              `Required description for expense ${(
                sub_index + 1
              ).toString()} in project: ${project.name}.` + '\n'
          }
        }

        // From + To
        if (expense.costCategory == 'Mileage') {
          if (!expense.mileage) {
            alertText +=
              `Required valid location addresses for expense ${(
                sub_index + 1
              ).toString()} in project: ${project.name}.` + '\n'
          }
          /*if (!expense.fromLocation?.trim()) {
            alertText +=
              `Required origin for expense ${(
                sub_index + 1
              ).toString()} in project: ${project.name}.` + '\n'
          }
          if (!expense.toLocation?.trim()) {
            alertText +=
              `Required destination for expense ${(
                sub_index + 1
              ).toString()} in project: ${project.name}.` + '\n'
          }*/
        }

        // Per Diem
        if (expense.costCategory == 'Per Diem') {
          if (
            (expense.breakfast === false || expense.breakfast === undefined) &&
            (expense.lunch === false || expense.lunch === undefined) &&
            (expense.dinner === false || expense.dinner === undefined)
          ) {
            alertText +=
              `Required at least 1 meal for expense ${(
                sub_index + 1
              ).toString()} in project: ${project.name}.` + '\n'
          }
        }
      })
    })

    // Alert bad input
    if (alertText != '') {
      alert(alertText)
      alertText = ''
      return
    }

    const pdfDoc = await PDFDocument.create()

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontSize = 12
    const lineHeight = fontSize + 4
    const pageMargin = 50

    let page = pdfDoc.addPage()
    let currentY = page.getSize().height - pageMargin

    const logoImageBytes = await fetch(ATECLogo).then((res) =>
      res.arrayBuffer()
    )
    const embeddedLogoImage = await pdfDoc.embedPng(logoImageBytes)

    total.value = 0
    breakdown.forEach((item) => {
      item.sum = 0
    })

    // Draw ATEC logo
    const drawTitleWithLogo = (
      page: PDFPage,
      logoImage: PDFImage,
      rightMargin: number
    ) => {
      const pageWidth = page.getSize().width

      // Image dimensions: 1883×785
      const logoWidth = 125.5
      const logoHeight = 52.3

      page.drawImage(logoImage, {
        x: pageWidth - rightMargin - logoWidth,
        y: currentY - logoHeight / 2,
        width: logoWidth,
        height: logoHeight,
      })

      currentY -= logoHeight / 2
    }

    // Print text with left and right indentation
    const drawTextWithAlignment = (
      page: PDFPage,
      leftText: string,
      rightText: string,
      x: number,
      y: number,
      fontSize: number,
      font: PDFFont,
      color: RGB,
      rightMargin: number
    ) => {
      // Draw the left-aligned text
      page.drawText(leftText, { x, y, size: fontSize, font, color })

      // Calculate the position for the right-aligned text
      const textWidth = font.widthOfTextAtSize(rightText, fontSize)
      const pageWidth = page.getSize().width
      const rightX = pageWidth - rightMargin - textWidth

      // Draw the right-aligned text
      page.drawText(rightText, { x: rightX, y, size: fontSize, font, color })
    }

    // Project loop
    report.projects.forEach((project, index) => {
      if (currentY < lineHeight + pageMargin) {
        page = pdfDoc.addPage()
        currentY = page.getSize().height - pageMargin
      }
      drawTitleWithLogo(page, embeddedLogoImage, pageMargin)
      currentY -= lineHeight

      drawTextWithAlignment(
        page,
        `Expense Report`,
        ``,
        pageMargin,
        currentY,
        fontSize,
        boldFont,
        rgb(0, 0, 0),
        pageMargin
      )
      drawTextWithAlignment(
        page,
        ``,
        getCurrentDate(),
        pageMargin,
        currentY,
        fontSize,
        font,
        rgb(0, 0, 0),
        pageMargin
      )
      currentY -= lineHeight
      drawTextWithAlignment(
        page,
        `Billable: ${
          project.name === 'Sales/Proposals' || project.name === 'Warranty'
            ? `${project.description}`
            : project.name
        } | ${project.number}`,
        ``,
        pageMargin,
        currentY,
        fontSize,
        boldFont,
        rgb(0, 0, 0),
        pageMargin
      )
      drawTextWithAlignment(
        page,
        ``,
        report.user.name || `Default User`,
        pageMargin,
        currentY,
        fontSize,
        font,
        rgb(0, 0, 0),
        pageMargin
      )
      currentY -= lineHeight * 3

      // Expense loop
      drawTextWithAlignment(
        page,
        `Expenses`,
        ``,
        pageMargin,
        currentY,
        fontSize,
        boldFont,
        rgb(0, 0, 0),
        pageMargin
      )
      currentY -= lineHeight * 2
      const userHasMonthlyCarAllowance = users.find(
        (user) => user.name === report.user.name
      )?.monthlyCarAllowance

      project.expenses.forEach((expense, index) => {
        // Mileage Calculation
        if (expense.costCategory === 'Mileage' && !userHasMonthlyCarAllowance) {
          const roundedMileage = Number(expense.mileage?.toFixed(1))
          if (expense.mileage) {
            if (expense.roundTrip) {
              total.value += 2 * roundedMileage * settings.mileageRate
            } else {
              total.value += roundedMileage * settings.mileageRate
            }
            const exp = breakdown.find(
              (b) => b.category === expense.costCategory
            )
            if (exp) {
              if (expense.roundTrip) {
                exp.sum += 2 * (roundedMileage * settings.mileageRate)
              } else {
                exp.sum += roundedMileage * settings.mileageRate
              }
            }
          }
          if (expense.roundTrip) {
            expense.cost = 2 * (roundedMileage * settings.mileageRate)
          } else {
            expense.cost = roundedMileage * settings.mileageRate
          }
        }
        // Per Diem Calculation
        else if (expense.costCategory === 'Per Diem') {
          expense.cost = 0
          if (expense.breakfast) {
            total.value += settings.perDiem.breakfast
            const exp = breakdown.find(
              (b) => b.category === expense.costCategory
            )
            if (exp) {
              exp.sum += settings.perDiem.breakfast
            }
            expense.cost += settings.perDiem.breakfast
          }
          if (expense.lunch) {
            total.value += settings.perDiem.lunch
            const exp = breakdown.find(
              (b) => b.category === expense.costCategory
            )
            if (exp) {
              exp.sum += settings.perDiem.lunch
            }
            expense.cost += settings.perDiem.lunch
          }
          if (expense.dinner) {
            total.value += settings.perDiem.dinner

            const exp = breakdown.find(
              (b) => b.category === expense.costCategory
            )
            if (exp) {
              exp.sum += settings.perDiem.dinner
            }
            expense.cost += settings.perDiem.dinner
          }
        }
        // Standard Cost Category Calculations
        else {
          if (
            expense.cost &&
            typeof expense.cost === 'number' &&
            expense.cost >= 0
          ) {
            total.value += expense.cost
            const exp = breakdown.find(
              (b) => b.category === expense.costCategory
            )
            if (exp) {
              exp.sum += Number(expense.cost)
            }
          } else {
            console.log('Invalid cost input')
          }
        }

        const description =
          (expense.costCategory || 'N/A') + ' | ' + (expense.costCode || 'N/A')
        const amount = `$${(expense.cost?.toFixed(2) ?? '0.00').replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ','
        )}`
        //Constuct expense sub description
        const subParts: string[] = []
        subParts.push(expense.date || '')
        subParts.push(expense.purpose ?? '')
        subParts.push(
          expense.costCategory === 'Per Diem'
            ? (expense.breakfast ? `Breakfast` : '') +
                (expense.lunch ? ` Lunch` : '') +
                (expense.dinner ? ` Dinner` : '')
            : ''
        )
        subParts.push(
          expense.costCategory === 'Mileage'
            ? 'From ' +
                (expense.fromLocation ?? 'N/A') +
                ' to ' +
                (expense.toLocation ?? 'N/A')
            : ''
        )
        subParts.push(
          expense.costCategory === 'Mileage'
            ? (Number(expense.mileage).toFixed(1) || 'N/A') + ' Miles'
            : ''
        )
        subParts.push(expense.description ?? '')
        let subDescription = ''
        for (let i = 0; i < subParts.length; i++) {
          if (subParts[i] != '') {
            subDescription += subParts[i]
            for (let j = i; j < subParts.length; j++) {
              if (i != j && subParts[j] != '') {
                subDescription += ' | '
                break
              }
            }
          }
        }

        // Draw the description and amount on the same line
        if (currentY < lineHeight + pageMargin) {
          page = pdfDoc.addPage()
          currentY = page.getSize().height - pageMargin
        }
        drawTextWithAlignment(
          page,
          description,
          amount,
          pageMargin,
          currentY,
          fontSize,
          font,
          rgb(0, 0, 0),
          pageMargin
        )
        currentY -= lineHeight

        //Sub description
        if (currentY < lineHeight + pageMargin) {
          page = pdfDoc.addPage()
          currentY = page.getSize().height - pageMargin
        }
        let subDescriptionLines = ''
        for (let i = 0; i < subDescription.length; i++) {
          subDescriptionLines += subDescription[i]
          if (i % 100 == 0 && i != 0) {
            if (currentY < lineHeight + pageMargin) {
              page = pdfDoc.addPage()
              currentY = page.getSize().height - pageMargin
            }
            if (i != subDescription.length && subDescription[i] != ' ') {
              subDescriptionLines += '-'
            }
            page.drawText(subDescriptionLines, {
              x: pageMargin,
              y: currentY,
              size: fontSize * 0.8,
              font,
              color: rgb(0.5, 0.5, 0.5), // Grey
            })
            currentY -= lineHeight
            subDescriptionLines = ''
          }
        }
        if (subDescriptionLines.length != 0) {
          if (currentY < lineHeight + pageMargin) {
            page = pdfDoc.addPage()
            currentY = page.getSize().height - pageMargin
          }
          page.drawText(subDescriptionLines, {
            x: pageMargin,
            y: currentY,
            size: fontSize * 0.8,
            font,
            color: rgb(0.5, 0.5, 0.5), // Grey
          })
          currentY -= lineHeight
        }

        // Expense divider line
        if (index !== project.expenses.length - 1) {
          if (currentY < lineHeight + pageMargin) {
            page = pdfDoc.addPage()
            currentY = page.getSize().height - pageMargin
          }
          const pageWidth = page.getSize().width
          page.drawLine({
            start: { x: pageMargin, y: currentY },
            end: { x: pageWidth - pageMargin, y: currentY },
            thickness: 1,
            color: rgb(0.00392156862, 0.32156862745, 0.63137254902), // ATEC Blue
          })
          currentY -= lineHeight
          currentY -= 0.5 * lineHeight
        }
      })

      //Print Total
      currentY -= lineHeight
      if (currentY < lineHeight + pageMargin) {
        page = pdfDoc.addPage()
        currentY = page.getSize().height - pageMargin
      }
      drawTextWithAlignment(
        page,
        `Total`,
        `$${project.expenses
          .reduce((sum, exp) => sum + (exp.cost ?? 0), 0)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`,
        pageMargin,
        currentY,
        fontSize,
        boldFont,
        rgb(0, 0, 0),
        pageMargin
      )
      currentY -= lineHeight

      // Breakdown
      if (currentY < lineHeight + pageMargin) {
        page = pdfDoc.addPage()
        currentY = page.getSize().height - pageMargin
      }
      currentY -= lineHeight
      drawTextWithAlignment(
        page,
        'Breakdown',
        ``,
        pageMargin,
        currentY,
        fontSize,
        font,
        rgb(0, 0, 0),
        pageMargin
      )
      currentY -= lineHeight

      if (currentY < lineHeight + pageMargin) {
        page = pdfDoc.addPage()
        currentY = page.getSize().height - pageMargin
      }
      const nonZeroItems = breakdown.filter((item) => item.sum !== 0)
      nonZeroItems.forEach((item) => {
        if (currentY < lineHeight + pageMargin) {
          page = pdfDoc.addPage()
          currentY = page.getSize().height - pageMargin
        }
        // Breakdown total category
        drawTextWithAlignment(
          page,
          item.category + (item.costCode ? ' | ' + item.costCode : ''),
          `$${(item.sum.toFixed(2) || '0.00').replace(
            /\d(?=(\d{3})+\.)/g,
            '$&,'
          )}`,
          pageMargin,
          currentY,
          fontSize * 0.8,
          font,
          rgb(0.5, 0.5, 0.5),
          pageMargin
        )
        currentY -= lineHeight
      })

      breakdown.forEach((item) => {
        item.sum = 0
      })

      // New page
      if (index !== report.projects.length - 1) {
        page = pdfDoc.addPage()
        currentY = page.getSize().height - pageMargin
      }
    })

    // Gather all attachment files from all expenses
    const allAttachments = report.projects.flatMap((project) =>
      project.expenses.flatMap((expense) => expense.attachments ?? [])
    )
    const filteredAttachments = sessionAttachments.filter((sessionAttachment) =>
      allAttachments.some(
        (dbAttachment) => dbAttachment.text === sessionAttachment.text
      )
    )

    // Process each attachment
    for (const attachment of filteredAttachments) {
      if (attachment.file) {
        try {
          const fileBytes = await attachment.file.arrayBuffer()
          const fileType = attachment.file.type

          let uploadedPdfDoc

          if (fileType === 'application/pdf') {
            // If the file is a PDF, load it directly
            uploadedPdfDoc = await PDFDocument.load(fileBytes, {
              ignoreEncryption: true,
            })
          } else {
            // Convert non-PDF files to PDF format
            const pdfBytes = await convertFileToPdf(attachment.file)
            uploadedPdfDoc = await PDFDocument.load(pdfBytes, {
              ignoreEncryption: true,
            })
          }

          // Copy pages from the attachment PDF to the main PDF document
          const copiedPages = await pdfDoc.copyPages(
            uploadedPdfDoc,
            uploadedPdfDoc.getPageIndices()
          )

          const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

          copiedPages.forEach((page) => {
            pdfDoc.addPage(page)

            // Add a "post-it note" annotation to the page
            const noteText = attachment.id || 'N/A'
            const { height } = page.getSize()
            const textSize = 12
            const padding = 5

            // Measure the width of the text
            const textWidth = font.widthOfTextAtSize(noteText, textSize)
            const textHeight = textSize

            const boxX = 25
            const boxY = height - 25

            // Draw semi-transparent background rectangle
            page.drawRectangle({
              x: boxX - padding,
              y: boxY - padding,
              width: textWidth + padding * 2,
              height: textHeight + padding * 2,
              color: rgb(0, 0, 0),
              opacity: 0.5, // 50% opacity for the background
            })

            page.drawText(noteText, {
              x: 25,
              y: height - 25,
              size: textSize,
              color: rgb(1, 1, 1), // White color for visibility
              rotate: degrees(0), // Rotation
            })
          })
        } catch (error) {
          console.error('Error processing attachment:', error)
        }
      }
    }

    // Save the combined PDF
    const mergedPdfBytes = await pdfDoc.save()
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    // Create a link element and trigger a download
    const link = document.createElement('a')
    link.href = url
    link.download =
      'Expense Report - ' + report.user.name + ' - ' + String(getCurrentDate()) // Add name reference
    link.click()
  }

  if (report.projects.length > 0)
    return (
      <div className="flex flex-col space-y-4">
        <Container>
          <div className="flex flex-col space-y-2 md:space-y-0">
            <Title text="Finished?" />
            <div className="flex flex-col md:flex-row justify-between items-center md:space-x-4 space-y-2">
              <Subtitle text="Save and email the generated report to your manager for approval." />
            </div>
          </div>
        </Container>

        {/* Download PDF button */}
        <Button
          text="Generate Report"
          onClick={(event) => {
            handleDownloadPDF(event).catch((error: unknown) => {
              console.error('Error while downloading PDF:', error)
            })
          }}
        />
      </div>
    )

  return null
}

export default PDF
