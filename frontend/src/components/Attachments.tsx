/**
 * @file Attachments.tsx - ./frontend/src/components
 * @description The `Attachments` component allows users to upload multiple file attachments related to an expense, such as receipts or documents. It manages the state of the attached files, enabling users to add new attachments and delete existing ones. The component uses the `Attachment` sub-component to render individual attachment details, displaying their file names and providing a delete option for each attachment. This component is particularly useful in expense tracking or reimbursement forms where multiple receipts may be required.
 * @author matthewb
 * @date Created: 2024-09-30 | Last Modified: 2024-10-02
 * @version 1.0.0
 * @license MIT
 * @usage Use this component to render an interface for managing expense attachments. For example:
 *        `<Attachments expense={expense} handleExpenseChange={handleExpenseChange} />`
 *        Where `expense` is an object containing expense details and `handleExpenseChange` is a function to update the expense state.
 * @dependencies React, `AttachmentType`, `ExpenseType` from `../data/types`, and `uuid` for generating unique IDs.
 * @relatedFiles This component is often used in conjunction with `ExpenseForm.tsx` or other components that manage expenses and their details.
 */

import React, { ChangeEvent } from "react";
import { AttachmentType, ExpenseType } from "../data/types";
import { v4 as uuidv4 } from "uuid";
import Attachment from "./Attachment";

interface AttachmentsProps {
  expense: ExpenseType & { attachments?: AttachmentType[] };
  handleExpenseChange: (updatedExpense: ExpenseType) => void;
}

const Attachments: React.FC<AttachmentsProps> = ({
  expense,
  handleExpenseChange,
}) => {
  const handleAddAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) {
      console.log("No files");
      return;
    }

    const newAttachments: AttachmentType[] = Array.from(files).map((file) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      id: uuidv4(),
      file,
      text: "TEST TEXT", //Change to attachment text
    }));

    const updatedExpense: ExpenseType = {
      ...expense,
      attachments: expense.attachments
        ? [...expense.attachments, ...newAttachments]
        : newAttachments,
    };
    handleExpenseChange(updatedExpense);
  };

  const handleDeleteAttachment = (id: string) => {
    const updatedExpense: ExpenseType = {
      ...expense,
      attachments: expense.attachments?.filter(
        (attachment) => attachment.id !== id
      ),
    };
    handleExpenseChange(updatedExpense);
  };

  return (
    <>
      {/* File Upload */}
      <div className="flex flex-col items-start space-y-2">
        <label className="text-gray-600 text-nowrap" htmlFor="costCategory">
          Receipts
        </label>
        <input
          type="file"
          multiple
          accept=".pdf, .png, .jpg, .jpeg"
          onChange={handleAddAttachment}
        />
      </div>

      {/* List of Attachments */}
      <div className="flex flex-col space-y-2">
        {expense.attachments?.map((attachment) => (
          <div
            className="w-full flex justify-between items-start"
            key={attachment.id}
          >
            <Attachment attachment={attachment} />
            <button
              className="text-red-500 text-nowrap transform transition-transform duration-300 ease-in-out hover:scale-105"
              onClick={() => {
                handleDeleteAttachment(attachment.id);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Attachments;
