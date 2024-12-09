import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Start with null for loading state

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('token');

      // If there is no token, set authenticated to false
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Current time in seconds

        // Check if the token is expired
        if (decodedToken.exp < currentTime) {
          setIsAuthenticated(false); // Token is expired
          localStorage.removeItem('token'); // Optionally clear expired token
        } else {
          setIsAuthenticated(true); // Token is valid
        }
      } catch (error) {
        console.error("Token decoding error:", error);
        setIsAuthenticated(false); // Error in decoding token
        localStorage.removeItem('token'); // Optionally clear invalid token
      }
    };

    checkAuthentication(); // Check authentication on mount

    const handleStorageChange = () => {
      checkAuthentication(); // Re-check authentication on storage change
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Show a loading state until we know if the user is authenticated
  if (isAuthenticated === null) {
    return <div>Loading...</div>; // You can replace this with a spinner or loading animation
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to login
    return <Navigate to="/" />;
  }

  return children; // If authenticated, render the children (protected component)
};

export default ProtectedRoute;