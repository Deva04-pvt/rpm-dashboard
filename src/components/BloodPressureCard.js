import React from "react";

const BloodPressureCard = ({ value }) => {
  const [systolic, diastolic] = value.split("/").map((v) => parseInt(v)) || [
    0, 0,
  ];

  const getStatusColor = (sys, dia) => {
    if (sys >= 140 || dia >= 90) return "text-red-600";
    if (sys >= 120 || dia >= 80) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatus = (sys, dia) => {
    if (sys >= 140 || dia >= 90) return "High";
    if (sys >= 120 || dia >= 80) return "Pre-High";
    return "Normal";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
      <div className="text-center mb-4">
        {value === "Fetching..." ? (
          <div className="text-gray-500">Measuring...</div>
        ) : (
          <>
            <div className="flex justify-center items-center space-x-2">
              <div className="text-4xl font-bold text-gray-800">
                {systolic}
                <span className="text-sm text-gray-500 ml-1">mmHg</span>
              </div>
              <div className="text-gray-400 font-bold">/</div>
              <div className="text-4xl font-bold text-gray-800">
                {diastolic}
                <span className="text-sm text-gray-500 ml-1">mmHg</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center px-4">
              <div className="space-y-2 w-full">
                <div className="flex justify-between text-sm">
                  <span>Systolic</span>
                  <span>{systolic} mmHg</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${(systolic / 200) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm mt-4">
                  <span>Diastolic</span>
                  <span>{diastolic} mmHg</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${(diastolic / 120) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-10">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Blood Pressure
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  getStatus(systolic, diastolic) === "Normal"
                    ? "bg-green-100 text-green-800"
                    : getStatus(systolic, diastolic) === "High"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {getStatus(systolic, diastolic)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BloodPressureCard;
