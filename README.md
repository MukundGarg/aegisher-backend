# AegiSher Backend API

Complete Node.js + Express + MongoDB backend for the AegiSher women's safety platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone/Download the project and navigate to the backend directory**

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your configuration
```

4. **Start MongoDB** (if running locally)
```bash
# macOS/Linux
mongod

# Windows
"C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe"

# Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
```

5. **Run the server**
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

---

## 📁 Project Structure

```
aegisher-backend/
├── models/
│   ├── User.js              # User schema with trusted circle
│   ├── SOS.js               # SOS alert tracking
│   └── SafetyReport.js      # Community safety reports
├── routes/
│   ├── sos.js               # SOS emergency endpoints
│   ├── trustedCircle.js     # Trusted contacts management
│   ├── safetyReports.js     # Safety reports endpoints
│   ├── routes.js            # Safe route suggestions
│   └── dangerPrediction.js  # AI danger prediction
├── .env.example             # Environment variables template
├── package.json             # Dependencies
└── server.js                # Main Express application
```

---

## 🔌 API Endpoints

### Health Check
- `GET /` - Check if API is running

### 1. SOS Emergency System

#### Trigger SOS Alert
```http
POST /api/sos/trigger
Content-Type: application/json

{
  "userId": "user_id_here",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "address": "Connaught Place, Delhi",
  "triggerMethod": "manual"
}
```

**Trigger Methods**: `manual`, `voice`, `fall_detection`, `suspicious_motion`

#### Get SOS History
```http
GET /api/sos/history/:userId
```

#### Resolve SOS Alert
```http
PATCH /api/sos/:sosId/resolve
Content-Type: application/json

{
  "status": "resolved"
}
```

---

### 2. Trusted Circle Management

#### Add Trusted Contact
```http
POST /api/trusted-circle/:userId/add
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+919876543210",
  "relationship": "family",
  "isPrimary": true
}
```

**Relationships**: `family`, `friend`, `colleague`, `other`

#### Get All Contacts
```http
GET /api/trusted-circle/:userId
```

#### Update Contact
```http
PUT /api/trusted-circle/:userId/:contactId
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+919876543210"
}
```

#### Delete Contact
```http
DELETE /api/trusted-circle/:userId/:contactId
```

---

### 3. Safety Reports

#### Submit Safety Report
```http
POST /api/safety-reports/submit
Content-Type: application/json

{
  "userId": "user_id_here",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "address": "Connaught Place",
  "placeName": "CP Metro Station",
  "safetyRating": 4,
  "reportType": "lighting",
  "comment": "Well lit area, feels safe",
  "timeOfDay": "evening"
}
```

**Safety Rating**: 1-5 (1 = very unsafe, 5 = very safe)  
**Report Types**: `lighting`, `crowding`, `incident`, `general`, `positive`  
**Time of Day**: `morning`, `afternoon`, `evening`, `night`

#### Get Nearby Reports
```http
GET /api/safety-reports/nearby?latitude=28.6139&longitude=77.2090&radius=5000
```

#### Upvote Report
```http
PATCH /api/safety-reports/:reportId/upvote
```

#### Get Statistics
```http
GET /api/safety-reports/stats/summary
```

---

### 4. Safe Route Suggestions

#### Compare Routes
```http
POST /api/routes/compare
Content-Type: application/json

{
  "startLatitude": 28.6139,
  "startLongitude": 77.2090,
  "endLatitude": 28.7041,
  "endLongitude": 77.1025,
  "timeOfDay": "night"
}
```

**Response includes**:
- Safe route (optimized for safety)
- Normal route (shortest path)
- Danger zones to avoid
- Time comparison
- Safety scores

#### Get Safe Route Only
```http
GET /api/routes/safe?startLat=28.6139&startLng=77.2090&endLat=28.7041&endLng=77.1025
```

---

### 5. AI Danger Prediction

#### Analyze Location Danger Level
```http
POST /api/danger-prediction/analyze
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timeOfDay": "night"
}
```

**Response includes**:
- Danger score (1-5)
- Danger level (Very Safe → Very Unsafe)
- Contributing factors
- Recommendations
- Confidence level

#### Get Danger Heatmap
```http
GET /api/danger-prediction/heatmap?centerLat=28.6139&centerLng=77.2090&radius=10000
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/aegisher

# Server
PORT=5000
NODE_ENV=development

# Twilio (Optional - for SMS)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### MongoDB Atlas Setup (Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aegisher
```

---

## 🔐 Adding Real SMS Alerts (Twilio)

The SOS system currently logs to console. To enable real SMS:

1. **Sign up for Twilio**: https://www.twilio.com
2. **Get credentials**: Account SID, Auth Token, Phone Number
3. **Add to .env file**
4. **Uncomment code in `routes/sos.js`** (lines marked with TODO)

```javascript
// In routes/sos.js - uncomment this section:
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

await client.messages.create({
  body: `🚨 EMERGENCY! ${user.name} needs help...`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: contact.phone
});
```

---

## 🤖 Adding Real AI Predictions

Current implementation uses mock AI. To integrate real ML:

### Option 1: Python ML Service
1. Train ML model with TensorFlow/PyTorch
2. Create Flask/FastAPI service
3. Call from Node.js using axios

### Option 2: Cloud ML Services
- AWS SageMaker
- Google AI Platform  
- Azure Machine Learning

### Option 3: Google Maps + Historical Data
Integrate Google Maps API with crime data APIs to get real-time danger scores.

**See TODO comments in `routes/dangerPrediction.js` for details.**

---

## 🗺️ Adding Real Route Navigation

Current routes are mocked. To integrate real routing:

1. **Get API Key** from:
   - Google Maps Directions API
   - Mapbox Directions API
   - OpenRouteService

2. **Install SDK**:
```bash
npm install @googlemaps/google-maps-services-js
```

3. **Replace mock data** in `routes/routes.js`

**See TODO comments in `routes/routes.js` for implementation guide.**

---

## 🧪 Testing the API

### Using cURL

```bash
# Test health check
curl http://localhost:5000/

# Trigger SOS (replace userId)
curl -X POST http://localhost:5000/api/sos/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Connaught Place, Delhi"
  }'
```

### Using Postman

1. Import collection with all endpoints
2. Set base URL: `http://localhost:5000`
3. Test each endpoint

### Creating Test User

Use MongoDB Compass or mongo shell:

```javascript
db.users.insertOne({
  name: "Test User",
  email: "test@aegisher.com",
  phone: "+919876543210",
  trustedCircle: [
    {
      name: "Emergency Contact",
      phone: "+919999999999",
      relationship: "family",
      isPrimary: true
    }
  ]
})
```

Save the returned `_id` - use it as `userId` in API calls.

---

## 📊 Database Models

### User
- name, email, phone
- trustedCircle[] (contacts)
- createdAt, lastActive

### SOS
- userId (reference)
- location (coordinates, address)
- triggerMethod
- status (active/resolved/false_alarm)
- alertsSent[]

### SafetyReport
- userId (optional)
- location (coordinates, address)
- safetyRating (1-5)
- reportType, comment
- timeOfDay, upvotes

---

## 🔄 Connecting to Your Frontend

In your frontend JavaScript, add:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Example: Trigger SOS
async function triggerSOS(userId, latitude, longitude) {
  const response = await fetch(`${API_BASE_URL}/sos/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      latitude,
      longitude,
      address: 'Current location',
      triggerMethod: 'manual'
    })
  });
  
  const data = await response.json();
  console.log('SOS Response:', data);
}

// Example: Get danger prediction
async function checkDanger(lat, lng) {
  const response = await fetch(`${API_BASE_URL}/danger-prediction/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      latitude: lat,
      longitude: lng,
      timeOfDay: 'evening'
    })
  });
  
  const data = await response.json();
  console.log('Danger Level:', data.prediction.dangerScore);
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check MongoDB is running: `mongod`
- Verify MONGODB_URI in .env
- Check network permissions for MongoDB Atlas

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

### CORS Errors
- CORS is enabled by default
- If issues persist, check frontend URL
- Add specific origins in `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

---

## 📈 Next Steps

1. ✅ Set up authentication (JWT)
2. ✅ Add user registration/login
3. ✅ Integrate real SMS/Email alerts
4. ✅ Connect to real mapping APIs
5. ✅ Deploy to production (Heroku, AWS, DigitalOcean)
6. ✅ Add rate limiting and security headers
7. ✅ Implement ML model for real predictions
8. ✅ Add WebSocket for real-time tracking

---

## 📝 License

MIT License - Feel free to use for your project!

---

## 🤝 Support

For questions or issues:
- Email: hello@aegisher.com
- Check MongoDB logs: `tail -f /var/log/mongodb/mongod.log`
- Check Node.js logs in console

---

## 🎯 API Summary

| Feature | Endpoint | Method |
|---------|----------|--------|
| Health Check | `/` | GET |
| Trigger SOS | `/api/sos/trigger` | POST |
| SOS History | `/api/sos/history/:userId` | GET |
| Add Contact | `/api/trusted-circle/:userId/add` | POST |
| Get Contacts | `/api/trusted-circle/:userId` | GET |
| Submit Report | `/api/safety-reports/submit` | POST |
| Nearby Reports | `/api/safety-reports/nearby` | GET |
| Compare Routes | `/api/routes/compare` | POST |
| Danger Analysis | `/api/danger-prediction/analyze` | POST |
| Danger Heatmap | `/api/danger-prediction/heatmap` | GET |

---

**Built with ❤️ for women's safety**
