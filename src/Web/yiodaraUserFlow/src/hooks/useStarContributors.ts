import { useState, useEffect } from "react";
import adminService, { StarContributorData } from "../services/adminService";

export const useStarContributors = () => {
  const [contributors, setContributors] = useState<StarContributorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await adminService.getStarContributors();
        if (response.succeeded) {
          setContributors(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Failed to fetch star contributors.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributors();
  }, []);

  return { contributors, isLoading, error };
}; 