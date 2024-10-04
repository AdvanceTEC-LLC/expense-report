import { useEffect, useState } from "react";
import Configurable from "./Configurable";
import settingsService from "../services/settingsService";
import { SettingsType } from "../data/types";

const Settings = () => {
  const [settings, setSettings] = useState<SettingsType | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    settingsService
      .get()
      .then((response) => {
        setSettings(response);
        console.log("Settings fetched", response);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleSave = async () => {
    settingsService
      .set(settings)
      .then((response) => {
        console.log("Settings updated to", response);
        alert("Settings updated successfully!");
      })
      .catch((error) => {
        console.log(error);
        alert("Failed to update settings.");
      });
  };

  const handleMileageRateChange = (newMileageRate: number) => {
    if (settings) {
      const updatedSettings = {
        ...settings,
        mileageRate: newMileageRate,
      };
      setSettings(updatedSettings);
    }
  };

  const handlePerDiemChange = (key: string, newValue: number) => {
    if (settings) {
      const updatedSettings = {
        ...settings,
        perDiem: {
          ...settings.perDiem,
          [key]: newValue,
        },
      };
      setSettings(updatedSettings);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === import.meta.env.VITE_ATEC_ADMIN_PASSWORD)
      setIsAdmin(true);
  };

  if (!settings)
    return (
      <div className="h-full flex flex-col flex-grow justify-center items-center">
        <div className="p-8 text-3xl font-bold text-black">Loading</div>
        <div className="p-4 text-black">
          Waiting for response from server...
        </div>
        <div className="p-4 italic text-gray-400">Not Found</div>
      </div>
    );

  return (
    <div className="h-full flex flex-col p-8 bg-gray-100 items-center flex-grow">
      <div className="flex flex-col space-y-8 w-11/12 lg:w-fit">
        <div className="w-full flex flex-col space-y-8 lg:grid lg:grid-cols-2 lg:space-x-4 lg:space-y-0">
          <div className="w-full flex flex-col space-y-4">
            <div className="text-xl font-bold">Per Diem</div>
            <div className="w-full flex flex-col space-y-4 items-start bg-white shadow-md p-8 rounded-md">
              <Configurable
                name="Breakfast"
                value={settings.perDiem.breakfast}
                isAdmin={isAdmin}
                onChange={(newValue) =>
                  handlePerDiemChange("breakfast", newValue)
                }
              />
              <Configurable
                name="Lunch"
                isAdmin={isAdmin}
                value={settings.perDiem.lunch}
                onChange={(newValue) => handlePerDiemChange("lunch", newValue)}
              />
              <Configurable
                name="Dinner"
                isAdmin={isAdmin}
                value={settings.perDiem.dinner}
                onChange={(newValue) => handlePerDiemChange("dinner", newValue)}
              />
            </div>
          </div>
          <div className="w-full flex flex-col space-y-4">
            <div className="text-xl font-bold">Mileage</div>
            <div className="w-full flex flex-col items-start bg-white shadow-md p-8 rounded-md">
              <Configurable
                name="Mileage Rate"
                isAdmin={isAdmin}
                value={settings.mileageRate}
                onChange={(newValue) => handleMileageRateChange(newValue)}
              />
            </div>
          </div>
        </div>

        {isAdmin ? (
          <div className="w-full">
            <button
              className="w-full text-white font-bold bg-ATECblue p-2 rounded-md shadow-md transform transition-transform duration-300 ease-in-out hover:scale-105"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex flex-col w-full space-y-2">
            <label className="font-bold" htmlFor="isAdmin">
              Admin Password
            </label>
            <div className="w-full flex flex-col items-start space-y-2 bg-white shadow-md p-4 rounded-md">
              <div className="text-sm text-gray-500">
                Enter the administation password to enable editing
              </div>
              <input
                className="p-2 w-full border-grey-300 border-b-2"
                type="password"
                placeholder="Password"
                onChange={(e) => handlePasswordChange(e)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
