import React, { useEffect, useRef, useState } from 'react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Extend Window interface to include google
declare global {
  interface Window {
    google: any;
  }
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'e.g. Agra, Uttar Pradesh'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  // Load Google Maps API script dynamically
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsApiLoaded(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Wait for existing script to load
        existingScript.addEventListener('load', () => {
          setIsApiLoaded(true);
        });
        return;
      }

      // Get API key from environment variable
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      
      if (!apiKey) {
        console.error('Google Maps API key not found in environment variables');
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsApiLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  // Initialize autocomplete when API is loaded
  useEffect(() => {
    if (!isApiLoaded || !inputRef.current) {
      return;
    }

    try {
      // Create autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['(regions)'], // Restrict to cities, states, countries
          componentRestrictions: { country: 'in' } // Restrict to India
        }
      );

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (place && place.formatted_address) {
          onChange(place.formatted_address);
        } else if (place && place.name) {
          onChange(place.name);
        }
      });
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isApiLoaded, onChange]);

  return (
    <div className="relative animate-immersive">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full" // Let global index.css handle the rest
        autoFocus
        autoComplete="off"
      />
      {!isApiLoaded && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-5 w-5 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};
