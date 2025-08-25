import { useState, useEffect } from "react";
import { Client, Databases } from "appwrite";

const useBatch = () => {
  const [currentBatch, setCurrentBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentBatch = async () => {
      setLoading(true);
      setError(null);

      try {
        const client = new Client()
          .setEndpoint("https://fra.cloud.appwrite.io/v1") // Your Appwrite endpoint
          .setProject("68ab181900053dec6d01"); // Your project ID

        const databases = new Databases(client);

        // Replace with your database ID and collection ID
        const databaseId = "68ac18df000d67a0f27f";
        const collectionId = "68ac18eb000b481b196f";

        // Query your collection for the current batch document
        // Assuming you have a document that contains currentBatch field
        // For example, fetching the document by ID or first document in collection

        // Example: get a document by ID
        const documentId = "68ac1d27000fc0cef7e4";

        const response = await databases.getDocument(databaseId, collectionId, documentId);

        // Assuming currentBatch field is stored as number in the document
        setCurrentBatch(response.batchNo);

      } catch (err) {
        setError(err.message || "Failed to fetch current batch from Appwrite");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentBatch();
  }, []);

  return { currentBatch, loading, error };
};

export default useBatch;
