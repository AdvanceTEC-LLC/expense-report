import React, { ChangeEvent, useEffect, useState } from "react";
import { costCategories } from "../Data/costCategories";
import ReimbursableGas from "./Expense Components/ReimbursableGas";
import Description from "./Expense Components/Description";
import PerDiem from "./Expense Components/PerDiem";
import Milage from "./Expense Components/Milage";
import {
  Attachment as AttachmentType,
  Expense as ExpenseType,
} from "../Data/Types";
import { v4 as uuidv4 } from "uuid";

interface ExpenseProps {
  expense: ExpenseType;
  updateExpense: (updatedExpense: ExpenseType) => void;
}

const CATEGORY_COMPONENT_MAP: {
  [key: string]: React.FC<{ onUpdate: (updatedData: any) => void }>;
} = {
  "Reimbursable Gas": ReimbursableGas,
  "Client Entertainment": Description,
  "Per Diem": PerDiem,
  Milage: Milage,
  Other: Description,
  "Job Site Material": Description,
};

const Expense: React.FC<ExpenseProps> = ({ expense, updateExpense }) => {
  const [selectedDate, setSelectedDate] = useState<string>(expense.date);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    expense.costCategory
  );
  const [costCode, setCostCode] = useState<string>(expense.costCode);
  const [cost, setCost] = useState<string>(expense.cost?.toString() || "0");
  const [attachments, setAttachments] = useState<AttachmentType[]>(
    expense.attachments || []
  );

  useEffect(() => {
    updateExpense({
      ...expense,
      date: selectedDate,
      costCategory: selectedCategory,
      costCode,
      cost: parseFloat(cost),
      attachments,
    });
  }, [selectedDate, selectedCategory, costCode, cost, attachments]);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const category = event.target.value;
    setSelectedCategory(category);
    const selectedCostCode =
      costCategories.find((item) => item.category === category)?.costCode || "";
    setCostCode(selectedCostCode);
  };

  const handleChildUpdate = (updatedData: any) => {
    updateExpense({
      ...expense,
      ...updatedData,
    });
  };

  const hasDefaultCostCode = () => {
    return costCategories.some(
      (item) => item.category === selectedCategory && item.costCode
    );
  };

  const renderCostCodeInput = () => (
    <>
      {hasDefaultCostCode() ? (
        <div className=" flex justify-between items-center">
          <label className="text-gray-600 text-nowrap" htmlFor="costCode">
            Cost Code
          </label>
          <div id="costCode">{costCode}</div>
        </div>
      ) : (
        <div className="flex flex-col space-y-2 items-start">
          <label className="text-gray-600 text-nowrap" htmlFor="costCode">
            Cost Code
          </label>
          <input
            className="p-2 border-grey-300 border-b-2"
            type="text"
            id="costCode"
            value={costCode}
            onChange={(e) => setCostCode(e.target.value)}
            placeholder="Enter cost code"
          />
        </div>
      )}
    </>
  );

  const renderCostInput = () => (
    <div className="flex flex-col items-start space-y-2">
      <label className="text-gray-600">Cost</label>
      <input
        className="p-2 border-grey-300 border-b-2"
        type="number"
        id="cost"
        value={cost}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value >= 0) {
            setCost(value.toString());
          }
        }}
      />
    </div>
  );

  // Function to handle file upload
  const handleUploadAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const newAttachments = Array.from(files).map((file, index) => ({
        id: uuidv4(), // Use uuid to generate unique ID
        file,
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const handleDeleteAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id != id));
  };

  const SelectedComponent = CATEGORY_COMPONENT_MAP[selectedCategory] || null;

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-4">
        {/* Date Picker */}
        <div className="flex flex-col items-start space-y-2">
          <label className="text-gray-600" htmlFor="date">
            Date
          </label>
          <input
            className="p-2 w-full border-grey-300 border-b-2"
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Cost Category Dropdown */}
        <div className="flex flex-col items-start space-y-2">
          <label className="text-gray-600 text-nowrap" htmlFor="costCategory">
            Cost Category
          </label>
          <select
            className="p-2 w-full border-grey-300 border-b-2"
            id="costCategory"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="" disabled>
              Select a category
            </option>
            {costCategories.map((costCategory, index) => (
              <option key={index} value={costCategory.category}>
                {costCategory.category}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional Rendering for Cost Code */}
        {selectedCategory && renderCostCodeInput()}

        {/* Conditional Rendering for Expense Type */}
        {SelectedComponent && (
          <SelectedComponent onUpdate={handleChildUpdate} />
        )}

        {/* Conditional Rendering for Cost Input */}
        {selectedCategory &&
          selectedCategory !== "Milage" &&
          selectedCategory !== "Per Diem" &&
          renderCostInput()}
      </div>
      {/* File Upload */}
      <input
        type="file"
        multiple
        accept=".pdf, .png, .jpg, .jpeg"
        onChange={handleUploadAttachment}
      />

      {/* List of Attachments */}
      <div>
        {attachments.map((attachment) => (
          <div
            className="flex justify-between items-center"
            key={attachment.id}
          >
            <div>{attachment.file?.name}</div>
            <button
              className="p-2 text-red-500 font-bold"
              onClick={() => handleDeleteAttachment(attachment.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Expense;
