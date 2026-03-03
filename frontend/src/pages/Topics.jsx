import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function Topics() {
  const { unitId } = useParams();
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchTopics();
  }, [unitId]);

  const fetchTopics = async () => {
    try {
      const res = await api.get(`/topics/${unitId}`);
      setTopics(res.data);
    } catch (err) {
      console.error("Failed to fetch topics");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">
        Topics
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white p-6 rounded-lg shadow"
          >
            {topic.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Topics;