// Geolocation service to get the current position
export interface GeolocationResult {
  coords?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  address?: string;
  error?: string;
}

// Get current position
export const getCurrentPosition = (): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        error: 'Geolocation is not supported by your browser',
      });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      (error) => {
        let errorMessage = 'Unknown error occurred';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
        }
        
        resolve({
          error: errorMessage,
        });
      }
    );
  });
};

// Reverse geocode to get address from coordinates
export const getAddressFromCoords = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    // In a real implementation, you would use a service like Google Maps Geocoding API
    // For this demo, we'll return a fake address
    
    // Normally you would do something like:
    // const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`);
    // const data = await response.json();
    // return data.results[0].formatted_address;
    
    // Simulated response for demo
    return `${Math.floor(Math.random() * 100) + 100} Construction Site, Sydney NSW ${Math.floor(Math.random() * 1000) + 2000}`;
  } catch (error) {
    console.error('Error getting address:', error);
    return 'Address not available';
  }
};
