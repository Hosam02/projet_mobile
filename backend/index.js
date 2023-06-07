const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/carsapps', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  socketTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000, // 30 seconds
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const cors = require('cors');
app.use(cors());

app.use(express.json());

// Define the car schema
const carSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  price: Number,
  pictures: [String],
  description: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Define the user schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: Number,
  username: String,
  password: String,
  sellingCars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
    },
  ],

  favoriteCars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
    },
  ],
});

// Create the car and user models
const Car = mongoose.model('Car', carSchema);
const User = mongoose.model('User', userSchema);

const decodeToken = (token) => {
  try {
    // Decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract user information from the decoded token
    const { userId } = decoded;

    // Return the user information
    return { userId };
  } catch (error) {
    // Handle invalid or expired token
    console.error('Error decoding token:', error);
    return null;
  }
};

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    const user = decodeToken(token);

    if (user) {
      req.user = user;
      next();
    } else {
      res.sendStatus(403); // Invalid or expired token
    }
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

// GET /users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}); 

    res.status(200).json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /users/register
app.post('/users/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, username, password } = req.body;
    

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      username,
      password,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30h' });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /users/login
app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    

    if (user && user.password === password) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30h' });

      res.status(200).json({ user, token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /user/profile
app.get('/user/profile', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId, '-password');

    if (!user) {
      return res.sendStatus(404);
    }

    res.json(user);
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /cars
app.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find().populate('user', '-password');
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error retrieving cars:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET /cars/:id
app.get('/cars/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const car = await Car.findById(id).populate('user', '-password');

    if (car) {
      // Extract user information from req.user
      const { userId } = req.user;

      if (userId === car.user._id.toString()) {
        // If the user is the owner of the car, include user information in the response
        res.status(200).json({ car, user: car.user });
      } else {
        // If the user is not the owner, exclude user information from the response
        res.status(200).json({ car });
      }
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    console.error('Error retrieving car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// GET /user/selling-cars
app.get('/user/selling-cars', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.user;

    // Find the user by ID and populate the sellingCars field
    const user = await User.findById(userId).populate('sellingCars');

    if (user) {
      // Return the selling cars of the user
      res.status(200).json({ sellingCars: user.sellingCars });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving selling cars:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

// POST /cars
app.post('/cars', authenticateJWT, async (req, res) => {
  const { make, model, year, price, pictures, description } = req.body;

  try {
    const user = req.user;

    const newCar = new Car({
      make,
      model,
      year,
      price,
      pictures,
      description,
      user: user.userId,
    });

    await newCar.save();

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $push: { sellingCars: newCar._id } },
      { new: true }
    );

    res.status(201).json({ car: newCar, user: updatedUser });
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /cars/:id
app.delete('/cars/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const user = req.user;

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.user.toString() !== user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Car.findByIdAndDelete(id);

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $pull: { sellingCars: id } },
      { new: true }
    );

    res.status(200).json({ car, user: updatedUser });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Search /cars/search?query=make
app.get('/cars/search', (req, res) => {
  const { query } = req.query;
  const searchRegex = new RegExp(query, 'i');

  Car.find({ $or: [{ make: searchRegex }, { model: searchRegex }] })
    .then(cars => {
      res.json(cars);
    })
    .catch(error => {
      res.status(500).json({ error: 'An error occurred while searching for cars.' });
    });
});

// POST /users/favorites
app.post('/users/favorites', authenticateJWT, async (req, res) => {
  const { carId } = req.body;
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favoriteCars.includes(carId)) {
      user.favoriteCars.push(carId);
      await user.save();

      // Populate the car details in the response
      const car = await Car.findById(carId);

      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }

      res.status(201).json({
        message: 'Car added to favorites',
        car: {
          _id: car._id,
          make: car.make,
          model: car.model,
          description: car.description,
          // Add any other car details you want to include in the response
        },
      });
    } else {
      res.status(409).json({ message: 'Car already in favorites' });
    }
  } catch (error) {
    console.error('Error adding car to favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /users/favoriteCars
app.get('/users/favoriteCars', authenticateJWT, async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId).populate('favoriteCars');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favoriteCars = user.favoriteCars;

    res.status(200).json(favoriteCars);
  } catch (error) {
    console.error('Error fetching favorite cars:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// DELETE /users/favorites/:id
app.delete('/users/favorites/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.favoriteCars.indexOf(id);

    if (index === -1) {
      return res.status(404).json({ message: 'Car not found in favorites' });
    }

    user.favoriteCars.splice(index, 1);
    await user.save();

    res.status(200).json({ message: 'Car removed from favorites' });
  } catch (error) {
    console.error('Error removing car from favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
const invalidatedTokens = [];
// POST /logout
app.post('/logout', (req, res) => {
  const { token } = req.body;

  // Verify and decode the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // Check if the token has already been invalidated
    if (invalidatedTokens.includes(token)) {
      return res.status(401).json({ error: 'Token has already been invalidated.' });
    }

    // Add the token to the list of invalidated tokens
    invalidatedTokens.push(token);

    // Respond with a success message
    res.json({ message: 'Logout successful.' });
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
