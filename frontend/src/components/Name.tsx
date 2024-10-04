import React from "react";

interface NameProps {
  setName: (name: string) => void;
  name: string;
}

const Name: React.FC<NameProps> = ({ setName, name }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <div className="p-8 bg-white border-gray-100 border-2 rounded-md shadow-sm">
      <div className="flex flex-col w-full items-start space-y-2">
        <label className="text-gray-600" htmlFor="name">
          Full Name
        </label>
        <input
          className="p-2 w-full border-grey-300 border-b-2"
          //className={`p-2 w-full border-b-2 ${
          //  isInvalid ? "border-red-500" : "border-gray-300"
          //}`}
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default Name;
