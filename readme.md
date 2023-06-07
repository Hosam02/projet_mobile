read me


this app's goal is to learn how to code mobile apps with react native and node js

this app uses React-native as the frontend framework and expressjs(nodejs) as the back end using rest apis to send data back and fort 

as in today's date (24/05/2023) we created the following screens:
   home page
   login page
   register screen 
   makes screen 
   car details screen
   car selling screen 
   profile page
   chatting screen 
   searching screen 
the styling (css) will be affected within the next 2-3 days

Update : 26/05/2023

as in today we've almost complete the app is still need some styling with css and an issue i'm not sure if its a "my computer" problem or a code problem

some problems might be faced in some screen might solve tomorrow

Update 27/06/2023

as in today i've finally (almost) finished the whole app struct with everything working 
this shit took almost half of my life

the backend contains 14 endpoints (Rest api)
{
GET /users: This endpoint retrieves all users from the MongoDB database and returns them as a JSON response.

POST /users/register: This endpoint handles user registration. It expects the user's first name, last name, email, phone number, username, and password in the request body. It checks if the user already exists, creates a new user in the database, generates a JSON Web Token (JWT) for authentication, and returns the newly created user and the token in the response.

POST /users/login: This endpoint handles user login. It expects the user's email and password in the request body. It verifies the user's credentials, generates a JWT if the credentials are valid, and returns the user and the token in the response.

GET /user/profile: This endpoint requires authentication using a JWT. It retrieves the user profile based on the authenticated user's ID and returns the user's information (excluding the password) as a JSON response.

GET /cars: This endpoint retrieves all cars from the database, populating the user field with the corresponding user details (excluding the password), and returns the cars as a JSON response.

GET /cars/:id: This endpoint retrieves a specific car based on the provided id parameter. It populates the user field with the corresponding user details (excluding the password) and returns the car information as a JSON response.

GET /user/selling-cars: This endpoint requires authentication and retrieves the cars being sold by the authenticated user, returning them as a JSON response.

POST /cars: This endpoint allows authenticated users to create a new car listing. It expects the car's details (make, model, year, price, pictures, description) in the request body, associates the car with the authenticated user, saves it to the database, and returns the newly created car and the updated user information in the response.

DELETE /cars/:id: This endpoint allows authenticated users to delete a car listing. It checks if the car exists, verifies that the authenticated user is the owner of the car, deletes the car from the database, and updates the user's selling cars list accordingly. The deleted car and the updated user information are returned in the response.

GET /cars/search: This endpoint performs a search for cars based on a provided query string parameter (query). It uses a regular expression to find cars with matching make or model values and returns the search results as a JSON response.

POST /users/favorites: This endpoint allows authenticated users to add a car to their list of favorite cars. It expects the car ID (carId) in the request body, verifies the user's existence, checks if the car is already in the user's favorites, adds it if not, and returns a response with the success message and the car details.

GET /users/favoriteCars: This endpoint requires authentication and retrieves the list of favorite cars for the authenticated user, returning them as a JSON response.

DELETE /users/favorites/:id: This endpoint allows authenticated users to remove a car from their list of favorite cars. It expects the car ID (id) as a parameter, verifies the user's existence, checks if the car is in the user's favorites, removes it if present, and returns a response with a success message.

POST /logout: This endpoint handles user logout. It expects the JWT token in the request body, verifies its validity, checks
}






























































































































































































































  _    _  ____  
 | |  | |/ __ \ 
 | |__| | |  | |
 |  __  | |  | |
 | |  | | |__| |
 |_|  |_|\___\_\
                
                





