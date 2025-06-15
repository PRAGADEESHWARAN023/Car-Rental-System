import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import axios from 'axios';
import './App.css';

const http = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete http.defaults.headers.common['Authorization'];
    }
  }, [user, token]);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    http.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete http.defaults.headers.common['Authorization'];
    navigate('/login');
  };
  useEffect(() => {
    if (token) {
      http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete http.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await http.get('/bookings/mybookings/');
      setBookings(response.data);
      setError('');
    } catch (error) {
      if (error.response?.status === 401)
        logout();
      setError('Failed to fetch bookings.');
      setBookings([]);
    }
  };

  if (!user) return <Navigate to="/login" />;
  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await http.delete(`/bookings/cancel-booking/${bookingId}/`);
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (error) {
      alert('Failed to cancel booking.');
    }
  };

  const canCancel = (startDateStr) => {
    const today = new Date();
    const startDate = new Date(startDateStr);
    return startDate > today;
  };

  return (
    <div className='dashboard-container'>
      <h2>My Bookings</h2>
      {error && <p className='error'>{error}</p>}
      {bookings.length > 0 ? (
        <ul className='booking-list'>
          {bookings.map((booking) => (
            <li key={booking.id} className='booking-item'>
              <div className='booking-details'>
                <p><strong>Car ID:</strong> {booking.car}</p>
                <p><strong>Start:</strong> {booking.start_date}</p>
                <p><strong>End:</strong> {booking.end_date}</p>
              </div>
              <div className='booking-actions'>
                {canCancel(booking.start_date) && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className='cancel-button'
                  >
                    Cancel
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

const Booking = () => {
  const { carId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await http.get(`/cars/${carId}/`);
        setCar(response.data);
      } catch (err) {
        setError('Failed to fetch car details.');
      }
    };
    fetchCar();
  }, [carId]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    if (!startDate || !endDate) {
      setError('Please select start and end dates.');
      return;
    }
    try {
      const body = { car: carId, start_date: startDate, end_date: endDate };
      await http.post('/bookings/', body);
      setMessage('Booking successful!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError('Failed to create booking, please try again.');
    }
  };

  if (!car) return <div className='loading-container'>Loading car details...</div>;

  if (!user) return <Navigate to="/login" />;

  return (
    <div className='booking-container'>
      <h2>Book Car: {car.name}</h2>
      <form onSubmit={handleBooking} className='booking-form'>
        <label>Start Date:</label>
        <input
          className='input2'
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <label><br />End Date:</label>
        <input
          className='input2'
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <br />
        <button type="submit" className='button'>Confirm Booking</button>
      </form>
      {message && <p className='success-message'>{message}</p>}
      {error && <p className='error'>{error}</p>}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className='nav'>
      <h1>Car Rental</h1>
      <ul className='navLinks'>

        {user && (
          <>
            <li>
              <Link to="/home" className='navLink'>
                Home
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className='navLink'>
                My Bookings
              </Link>
            </li>
            <li>
              <Link to="/favorites" className='navLink'>
                Favorites
              </Link>
            </li>
            <li>
              <Link to="/profile" className='navLink'>
                Profile
              </Link>
            </li>
            <li>
              <Link to="/profile-details" className='navLink'>
                Profile Details
              </Link>
            </li>
            <li>
              <button onClick={logout} className='logout-button'>
                Logout ({user.username})
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

const Home = () => (
  <div className='home-container'>
    <h2>Welcome to the Car Rental System</h2>
    <p className='description'>Find and book cars easily in your preferred location.</p>
    <Link to="/cars" className='button'>Browse Cars</Link>
  </div>
);

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = (rating - fullStars) >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <span className='star-rating'>
      {'★'.repeat(fullStars)}
      {halfStar && '⯪'}
      {'☆'.repeat(emptyStars)}
    </span>
  );
};

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [location, setLocation] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [modelYearMin, setModelYearMin] = useState('');
  const [modelYearMax, setModelYearMax] = useState('');
  const [carType, setCarType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteCars');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (location) params.location = location;
      if (priceMin) params.price_min = priceMin;
      if (priceMax) params.price_max = priceMax;
      if (modelYearMin) params.model_year_min = modelYearMin;
      if (modelYearMax) params.model_year_max = modelYearMax;
      if (carType) params.car_type = carType;
      if (transmission) params.transmission = transmission;
      if (sortBy) params.ordering = sortBy;
      const response = await http.get('/cars/', { params });
      setCars(response.data);
    } catch (err) {
      setError('Failed to load cars.');
    }
    setLoading(false);
  }, [
    location, priceMin, priceMax, modelYearMin, modelYearMax, carType, transmission, sortBy
  ]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCars();
  };

  const toggleFavorite = (id) => {
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('favoriteCars', JSON.stringify(updated));
  };

  const isFavorite = (id) => favorites.includes(id);

  return (
    <div className='cars-container'>
      <h2>Available Cars</h2>

      <form onSubmit={handleSearch} className='search-form'>
        <input
          className='input'
          type="text"
          placeholder="Search by location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          className='input'
          type="number"
          placeholder="Min Price"
          min="0"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
        />

        <input
          className='input'
          type="number"
          placeholder="Max Price"
          min="0"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
        />

        <input
          className='input'
          type="number"
          placeholder="From Model Year"
          min="1900"
          max="2099"
          step="1"
          value={modelYearMin}
          onChange={(e) => setModelYearMin(e.target.value)}
        />

        <input
          className='input'
          type="number"
          placeholder="To Model Year"
          min="1900"
          max="2099"
          step="1"
          value={modelYearMax}
          onChange={(e) => setModelYearMax(e.target.value)}
        />

        <select className='input' value={carType} onChange={(e) => setCarType(e.target.value)}>
          <option value="">All Car Types</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="hatchback">Hatchback</option>
          <option value="coupe">Coupe</option>
          <option value="convertible">Convertible</option>
          <option value="minivan">Minivan</option>
          <option value="pickup">Pickup</option>
        </select>

        <select className='input' value={transmission} onChange={(e) => setTransmission(e.target.value)}>
          <option value="">All Transmissions</option>
          <option value="automatic">Automatic</option>
          <option value="manual">Manual</option>
        </select>

        <select className='input' value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sort By</option>
          <option value="price_per_day">Price: Low to High</option>
          <option value="-price_per_day">Price: High to Low</option>
          <option value="-model_year">Newest Model</option>
          <option value="model_year">Oldest Model</option>
        </select>

        <button type="submit" className='button'>Search</button>
      </form>

      {loading && <p>Loading cars...</p>}
      {error && <p className='error'>{error}</p>}
      {cars.length === 0 && !loading && <p>No cars found.</p>}

      <ul className='car-list'>
        {cars.map((car) => (
          <li key={car.id} className='card'>
            <img src={car.image_url} alt='CarImage' className='cardImage' />
            <h3>{car.name}</h3>
            <p><strong>Location:</strong> {car.location}</p>
            <p><strong>Price per day:</strong> ${car.price_per_day}</p>
            <p><strong>Model Year:</strong> {car.model_year}</p>
            <p><strong>Car Type:</strong> {car.car_type}</p>
            <p><strong>Transmission:</strong> {car.transmission}</p>

            {car.is_available !== undefined && (
              <p className={car.is_available ? 'available' : 'not-available'}>
                {car.is_available ? 'Available' : 'Not Available'}
              </p>
            )}

            {car.avg_rating !== undefined && (
              <p>
                Rating: <StarRating rating={car.avg_rating} /> ({car.num_reviews || 0})
              </p>
            )}

            <button
              className='button favorite-button'
              style={{ backgroundColor: isFavorite(car.id) ? '#f39c12' : '#3498db' }}
              onClick={() => toggleFavorite(car.id)}
              title={isFavorite(car.id) ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              {isFavorite(car.id) ? '★ Favorite' : 'Add to Favorites'}
            </button>

            <Link to={`/car/${car.id}`} className='button' style={{ marginLeft: '10px' }}>View Details</Link>
          </li>
        ))}
      </ul>

    </div>
  );
};


const CarDetails = () => {
  const { carId } = useParams();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [availabilityDates, setAvailabilityDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const carResp = await http.get(`/cars/${carId}/`);
        setCar(carResp.data);
        const revResp = await http.get(`/cars/${carId}/reviews/`);
        setReviews(revResp.data);
        const availResp = await http.get(`/cars/${carId}/availability/`);
        setAvailabilityDates(availResp.data);
      } catch (err) {
        setError('Failed to fetch car details or reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [carId]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to submit a review.');
      return;
    }
    if (newRating === 0 || newComment.trim() === '') {
      alert('Please provide a rating and comment.');
      return;
    }
    try {
      await http.post(`/cars/${carId}/reviews/`, { rating: newRating, comment: newComment });
      const revResp = await http.get(`/cars/${carId}/reviews/`);
      setReviews(revResp.data);
      setNewRating(0);
      setNewComment('');
      alert('Review submitted.');
    } catch (err) {
      alert('Failed to submit review.');
    }
  };

  if (loading) return <div className='loading-container'>Loading...</div>;
  if (error) return <p className='error'>{error}</p>;
  if (!car) return <p>No car found.</p>;

  return (
    <div className='car-details-container'>
      <h2>{car.name}</h2>
      <img src={car.image_url} alt={car.name} className='car-details-image' />
      <p><strong>Location:</strong> {car.location}</p>
      <p><strong>Price per day:</strong> ${car.price_per_day}</p>
      <p><strong>Model Year:</strong> {car.model_year}</p>
      <p><strong>Car Type:</strong> {car.car_type}</p>
      <p><strong>Transmission:</strong> {car.transmission}</p>
      <p><strong>Description:</strong> {car.description}</p>
      <h3>Not Available Dates:</h3>
      {availabilityDates.length > 0 ? (
        <ul className='availability-dates'>
          {availabilityDates.map((dateRange, idx) => (
            <li key={idx}>{dateRange.start_date} to {dateRange.end_date}</li>
          ))}
        </ul>
      ) : <p>No current bookings, car likely available.</p>}

      <h3>Reviews ({reviews.length})</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className='reviews-list'>
          {reviews.map((rev) => (
            <li key={rev.id} className='review-item'>
              <StarRating rating={rev.rating} />
              <p>{rev.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <h3>Submit Your Review</h3>
      {user ? (
        <form onSubmit={submitReview} className='review-form'>
          <label>
            Rating:
            <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} required>
              <option value={0}>Select</option>
              <option value={1}>1 - Poor</option>
              <option value={2}>2 - Fair</option>
              <option value={3}>3 - Good</option>
              <option value={4}>4 - Very good</option>
              <option value={5}>5 - Excellent</option>
            </select>
          </label>
          <br />
          <label>
            Comment:
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
          </label>
          <br />
          <div className='button-container'>
            <Link to={`/booking/${car.id}`} className='book-button'>Book This Car</Link>
            <button type="submit" className='submit-button'>Submit Review</button>
            <Link to="/cars" className='back-button'>Back to Cars</Link>
          </div>
        </form>
      ) : (
        <p><Link to="/login">Login</Link> to submit a review.</p>
      )}
    </div>
  );
};



const Favorites = () => {
  const [favoriteCars, setFavoriteCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const saved = localStorage.getItem('favoriteCars');
        const favoriteIds = saved ? JSON.parse(saved) : [];

        if (favoriteIds.length === 0) {
          setFavoriteCars([]);
          setLoading(false);
          return;
        }
        const results = await Promise.allSettled(
          favoriteIds.map(id => http.get(`/cars/${id}/`))
        );

        const validCars = [];
        const validIds = [];

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            validCars.push(result.value.data);
            validIds.push(result.value.data.id);
          }
        });

        localStorage.setItem('favoriteCars', JSON.stringify(validIds));

        setFavoriteCars(validCars);
      } catch (err) {
        setFavoriteCars([]);
      }
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  if (loading) return <div className='loading-container'>Loading favorites...</div>;

  return (
    <div className='favorites-container'>
      <h2>My Favorite Cars</h2>
      {favoriteCars.length === 0 ? (
        <p>No favorite cars selected.</p>
      ) : (
        <ul className='favorite-cars-list'>
          {favoriteCars.map(car => (
            <li key={car.id} className='favorite-car-item'>
              <img src={car.image_url} alt={car.name} className='car-image' />
              <h3>{car.name}</h3>
              <p><strong>Location:</strong> {car.location}</p>
              <p><strong>Price per day:</strong> ${car.price_per_day}</p>
              <Link to={`/car/${car.id}`} className='button'>View Details</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};



const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/home" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/token/', { username, password });
      const jwt = response.data.access;
      const profileResp = await axios.get('http://127.0.0.1:8000/api/users/home/', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      login(profileResp.data, jwt);
      navigate('/home');
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className='login-container'>
      <div className='login-box'>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className='login-form'>
          <input
            className='input'
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <input
            className='input'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className='button'>
            Login
          </button>
        </form>
        {error && <p className='error'>{error}</p>}
        <p className='text-center'>
          Don't have an account? <Link to="/">Register here</Link>.
        </p>
      </div>
    </div>
  );
};


const Profile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState({});
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login'); 
    }
  }, [user, navigate]);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/users/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch profile.');
      }
    };
    fetchProfile();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put('http://127.0.0.1:8000/api/users/profile/', {username: profile.username, email, phone, address, city }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated successfully!');
      navigate('/dashboard'); 
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  return (
    <div className='profile-container'>
      <h2>User Profile</h2>
      <form onSubmit={handleUpdate} className='profile-form'>
        <div className='form-group'>
          <label>Username:</label>
          <input
            className='input1'
            type="text"
            placeholder="Username"
            value={profile.username}
            readOnly
          />
        </div>
        <div className='form-group'>
          <label>Email:</label>
          <input
            className='input1'
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='form-group'>
          <label>Phone:</label>
          <input
            className='input1'
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className='form-group'>
          <label>Address:</label>
          <input
            className='input1'
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className='form-group'>
          <label>City:</label>
          <input
            className='input1'
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className='form-actions'>
          <button type="submit" className='button'>Update Profile</button>
        </div>
      </form>
      {error && <p className='error'>{error}</p>}
    </div>
  );
};

const ProfileDetails = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/users/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch profile.');
      }
    };

    fetchProfile();
  }, [token]);

  return (
    <div className='profile-details-container'>
      <h2>Profile Details</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone:</strong> {profile.phone}</p>
      <p><strong>Address:</strong> {profile.address}</p>
      <p><strong>City:</strong> {profile.city}</p>
    </div>
  );
};

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError("Passwords don't match.");
      return;
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/users/register/', { username, password });
      navigate('/login');
    } catch (err) {
      setError('Registration failed, try another username.');
    }
  };

  return (
    <div className='register-container'>
      <div className='register-box'>
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className='register-form'>
          <input
            className='input'
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <input
            className='input'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            className='input'
            type="password"
            placeholder="Confirm Password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
          <button type="submit" className='button'>Register</button>
        </form>
        {error && <p className='error'>{error}</p>}
        <p className='text-center'>
          Already have an account? <Link to="/login">Login here</Link>.
        </p>
      </div>
    </div>
  );
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/car/:carId" element={<CarDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Register />} />
          <Route path="/booking/:carId" element={<Booking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile-details" element={<ProfileDetails />} />
          <Route path="*" element={
            <div className='container'>
              <h2>404 - Page not found</h2>
              <Link to="/">Go Home</Link>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
