# Safe Route Navigator

**A comprehensive safety navigation application with real-time crime data, community ratings, and emergency features.**

Safe Route Navigator empowers users to make informed decisions about their routes using AI-powered safety insights, real-time crime data, and community-driven safety ratings.

## Tech Stack


### Frontend
- React.js 18
- React Router DOM
- Leaflet.js for maps
- React-Leaflet
- Tailwind CSS for styling
- Styled Components
- React Hot Toast for notifications
- Axios for API calls

### Backend
- Node.js
- Express.js
- Sequelize ORM
- SQLite Database
- bcryptjs for password hashing
- jsonwebtoken for authentication
- CORS middleware
- Express rate limiting

### DevOps & Tools
- Git version control
- npm package management
- Environment variable configuration
- RESTful API architecture

## Features

### Core Safety Features
- Real-time crime data visualization
- Community safety ratings and reviews
- Intelligent route planning with safety scoring
- Interactive crime heatmaps
- Location-based safety alerts

### Emergency Features
- One-click SOS emergency alerts
- Live location sharing
- Emergency contact notifications
- Quick access to emergency services

### Navigation Features
- Multi-modal route planning (walking, cycling, driving)
- Real-time GPS tracking
- Route safety analysis


### User Features
- Secure user authentication
- Personal safety profiles
- Route history and preferences
- Community-driven safety feedback

### Additional Features
- Night mode with enhanced safety features
- Responsive design for all devices
- Real-time notifications


## How to Run

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Vijay8143/Safe-Route-Finder.git
cd SafeRouteNavigator
```

2. Install dependencies for both frontend and backend:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

3. Set up environment variables:
Create a `config.env` file in the backend directory with:
```
DB_NAME=./safe_route_navigator.sqlite
DB_DIALECT=sqlite
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
PORT=5000
FRONTEND_URL=http://localhost:3000
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMERGENCY_EMAIL=emergency@example.com
```

4. Initialize the database:
```bash
cd backend
node scripts/setupDatabase.js
node seedDatabase.js
```

5. Start the application:

For development:
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
# Backend (from root directory)
npm run backend

# Frontend (from root directory)  
npm run frontend
```

For production:
```bash
npm run build
npm start
```

### Demo Account
- Email: demo@saferoute.com
- Password: Demo123!

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Crime Data
- `GET /api/crime/nearby` - Get nearby crime data
- `POST /api/crime/report` - Report a crime incident

### Safety Ratings
- `POST /api/rating/rate` - Submit route rating
- `GET /api/rating/area` - Get area safety ratings

### Emergency Services
- `POST /api/sos/alert` - Send emergency alert
- `POST /api/sos/share-location` - Share live location

## Development

### Project Structure
```
SafeRouteNavigator/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Express.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── config/            # Configuration files
└── scripts/               # Setup and utility scripts
```

### Environment Setup
- Development: `NODE_ENV=development`
- Production: `NODE_ENV=production`

### Database
- SQLite for development (included)
- Supports MySQL/PostgreSQL for production
- Automatic migrations and seeding
