import { useState, useEffect } from "react";

const useBatch = () => {
  const [currentBatch, setCurrentBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentBatch = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch from your n8n webhook
        const response = await fetch("https://n8n.esromagica.com/webhook/c2b1f9b2-dfbd-410f-84ae-de5ed2f64f6d");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Assuming n8n returns something like { batchNo: 108 }
        setCurrentBatch((Number(data[0].Batch_No)) );
      } catch (err) {
        setError(err.message || "Failed to fetch current batch from n8n");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentBatch();
  }, []);

  return { currentBatch, loading, error };
};

export default useBatch;
