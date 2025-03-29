import { useState, useEffect } from 'react';
import { getCurrentPosition, getAddressFromCoords, GeolocationResult } from '@/lib/geolocation';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  getAddress?: boolean;
}

interface UseGeolocationReturn {
  location: GeolocationResult | null;
  loading: boolean;
  error: string | null;
  getLocation: () => Promise<GeolocationResult>;
}

export default function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const [location, setLocation] = useState<GeolocationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const getLocation = async (): Promise<GeolocationResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCurrentPosition();
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return result;
      }
      
      // If coords exist and getAddress is true, fetch the address
      if (result.coords && options.getAddress) {
        const address = await getAddressFromCoords(
          result.coords.latitude,
          result.coords.longitude
        );
        result.address = address;
      }
      
      setLocation(result);
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      return { error: errorMessage };
    }
  };
  
  return { location, loading, error, getLocation };
}
