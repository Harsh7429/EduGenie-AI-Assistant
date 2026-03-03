import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function Units() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetchUnits();
  }, [subjectId]);

  const fetchUnits = async () => {
    try {
      const res = await api.get(`/units/${subjectId}`);
      setUnits(res.data);
    } catch (err) {
      console.error("Failed to fetch units");
    }
  };

  const handleUnitClick = (unitId) => {
    navigate(`/units/${unitId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">
        Units
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {units.map((unit) => (
          <div
            key={unit.id}
            onClick={() => handleUnitClick(unit.id)}
            className="bg-white p-6 rounded-lg shadow hover:bg-purple-100 cursor-pointer transition"
          >
            {unit.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Units;