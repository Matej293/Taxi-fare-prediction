import { useState } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    Trip_Distance_km: "",
    Time_of_Day: "Morning",
    Day_of_Week: "Weekday",
    Passenger_Count: 1,
    Traffic_Conditions: "Medium",
    Weather: "Clear",
    Base_Fare: "",
    Per_Km_Rate: "",
    Per_Minute_Rate: "",
    Trip_Duration_Minutes: "",
    Trip_Price: 0.0,
  });

  const [tripPrice, setTripPrice] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: ["Passenger_Count"].includes(name)
        ? parseInt(value, 10) || 1
        : [
            "Trip_Distance_km",
            "Base_Fare",
            "Per_Km_Rate",
            "Per_Minute_Rate",
            "Trip_Duration_Minutes",
          ].includes(name)
        ? parseFloat(value) || 0.0
        : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTripPrice(null);
    setError(null);
    setLoading(true);

    // Include Trip_Price in request
    const requestData = { ...formData, Trip_Price: 0.0 };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data?.Trip_Price !== undefined) {
        setTripPrice(response.data.Trip_Price);
      } else {
        setError("Invalid response from Flask API.");
      }
    } catch (err) {
      setError("Error connecting to Flask API. Please check your input.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Taxi Fare Prediction
        </h2>
        <form onSubmit={handleSubmit} className="mt-6">
          {/* Trip Distance */}
          <label className="block">
            Trip Distance (km):
            <input
              type="number"
              name="Trip_Distance_km"
              step="0.01"
              value={formData.Trip_Distance_km}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="19.35"
            />
          </label>

          {/* Time of Day */}
          <label className="block">
            Time of Day:
            <select
              name="Time_of_Day"
              value={formData.Time_of_Day}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
              <option>Night</option>
            </select>
          </label>

          {/* Day of Week */}
          <label className="block">
            Day of Week:
            <select
              name="Day_of_Week"
              value={formData.Day_of_Week}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option>Weekday</option>
              <option>Weekend</option>
            </select>
          </label>

          {/* Passenger Count */}
          <label className="block">
            Passenger Count:
            <select
              name="Passenger_Count"
              value={formData.Passenger_Count}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              {[...Array(6).keys()].map((num) => (
                <option key={num + 1} value={num + 1}>
                  {num + 1}
                </option>
              ))}
            </select>
          </label>

          {/* Traffic Conditions */}
          <label className="block">
            Traffic Conditions:
            <select
              name="Traffic_Conditions"
              value={formData.Traffic_Conditions}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>

          {/* Weather */}
          <label className="block">
            Weather:
            <select
              name="Weather"
              value={formData.Weather}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option>Clear</option>
              <option>Rain</option>
              <option>Snow</option>
            </select>
          </label>

          {/* Base Fare */}
          <label className="block">
            Base Fare ($):
            <input
              type="number"
              name="Base_Fare"
              step="0.01"
              value={formData.Base_Fare}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="3.56"
            />
          </label>

          {/* Per Km Rate */}
          <label className="block">
            Per Km Rate ($/km):
            <input
              type="number"
              name="Per_Km_Rate"
              step="0.01"
              value={formData.Per_Km_Rate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="0.8"
            />
          </label>

          {/* Per Minute Rate */}
          <label className="block">
            Per Minute Rate ($/min):
            <input
              type="number"
              name="Per_Minute_Rate"
              step="0.01"
              value={formData.Per_Minute_Rate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="0.32"
            />
          </label>

          {/* Trip Duration */}
          <label className="block">
            Trip Duration (minutes):
            <input
              type="number"
              name="Trip_Duration_Minutes"
              step="0.01"
              value={formData.Trip_Duration_Minutes}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="53.82"
            />
          </label>

          <button
            type="submit"
            className="mt-4 w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-all"
            disabled={loading}
          >
            {loading ? "Predicting..." : "Predict Price"}
          </button>
        </form>

        {tripPrice !== null && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md text-center">
            Predicted Trip Price: <strong>${tripPrice.toFixed(2)}</strong>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
