import jwt_decode from 'jwt-decode';

const decodeToken = (token) => {
  try {
    // Decode the JWT token
    const decoded = jwt_decode(token);

    // Extract user information from the decoded token
    const { firstName, lastName, email, phoneNumber } = decoded;

    // Return the user information
    return { firstName, lastName, email, phoneNumber };
  } catch (error) {
    // Handle invalid token
    console.error('Error decoding token:', error);
    return null;
  }
};

export default decodeToken;
