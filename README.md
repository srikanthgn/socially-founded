# socially-founded
# SociallyFounded

![SociallyFounded Logo](sf-logo.png)

SociallyFounded is building a revolutionary ecosystem where entrepreneurs find the community, tools, and resources to transform vision into reality — one check-in at a time.

## Project Overview

SociallyFounded isn't just a company – it's a startup movement that creates launchpads in cafés, pubs, libraries, and public spaces. It's where ideas take shape, founders build, and communities grow.

The platform bridges online and offline worlds through:
1. A network of entrepreneur-optimized spaces
2. Digital tools for idea development
3. Community engagement mechanisms
4. AI-powered enhancement of entrepreneurial processes

### Core Concept: The SF Passport

The SociallyFounded Passport is the core identity framework for entrepreneurs on the platform, serving as both a digital and physical representation of their entrepreneurial journey:

- **Physical Components**: Premium passport-style booklet with stamps from venues and achievements
- **Digital Components**: Digital twin with real-time updates, achievements, and journey visualization
- **Identity System**: Verifiable credentials for the entrepreneurial community
- **Progress Tracking**: Documentation of consistent entrepreneurial activity

## Repository Structure

This repository is organized according to our component-based architecture:

```
/
├── docs/                         # Documentation 
│   ├── architecture/             # System architecture documents
│   ├── branding/                 # Brand guidelines and assets
│   └── technical/                # Technical specifications
│
├── website/                      # Main website
│   ├── about/                    # About page
│   ├── how-it-works/             # How it works page
│   ├── assets/                   # Images, fonts, etc.
│   │   ├── images/
│   │   ├── css/
│   │   └── js/
│   └── index.html                # Homepage
│
├── app/                          # Application code
│   ├── ui/                       # User interface components
│   │   ├── passport/             # Digital passport UI
│   │   ├── venues/               # Venue directory UI
│   │   └── auth/                 # Authentication UI
│   │
│   ├── core/                     # Core application logic
│   │   ├── auth/                 # Authentication system
│   │   ├── passport/             # Passport engine
│   │   ├── gps/                  # GPS check-in system
│   │   ├── ideas/                # Idea registry
│   │   └── users/                # User management
│   │
│   └── data/                     # Data and integration layer
│       ├── storage/              # Client-side storage
│       ├── firebase/             # Firebase integration
│       ├── venues/               # Venue API interface
│       └── location/             # Location services
│
├── pwa/                          # Progressive Web App components
│   ├── manifest.json             # PWA manifest
│   ├── service-worker.js         # Service worker for offline functionality
│   └── icons/                    # PWA icons
│
└── mobile/                       # Mobile app specific code
    ├── capacitor.config.json     # Capacitor configuration
    └── native/                   # Native plugins and integrations
```

## Technology Stack

SociallyFounded uses an open-source technology stack:

### Frontend
- HTML5/CSS3/JavaScript
- Tailwind CSS for styling
- Alpine.js for interactivity (optional)

### Backend & Data
- Firebase (Authentication, Firestore, Hosting)
- Client-side storage with IndexedDB/LocalStorage

### Mobile
- Progressive Web App (PWA) capabilities
- Capacitor for hybrid mobile app functionality

### Location Services
- Geolocation API
- Mapbox/Leaflet.js with OpenStreetMap

### Deployment
- GitHub for version control
- Vercel for deployment
- Cloudflare for DNS and CDN

## Development Approach

SociallyFounded is being developed using an AI-assisted methodology that demonstrates the power of our own VCMBoK (Vibe Coding Methodology Body of Knowledge):

1. Components are designed with clear specifications and interfaces
2. Claude assists with UI components and content
3. Claude Coder implements technical components
4. The founder reviews, refines, and integrates the components
5. Iterative testing and enhancement improves each component

This approach enables rapid development with minimal technical resources, embodying the same principles we promote to entrepreneurs using our platform.

## Key Features

### Digital Passport
- Visual passport design with achievements
- Check-in history and stamps collection
- Identity verification and progression tracking

### GPS Check-In
- Location-based venue discovery
- Automated check-in prompts
- Community visibility at venues

### Idea Registry
- Structured idea documentation
- Version control and development tracking
- Feedback and validation mechanisms

### Venue Directory
- Map and list views of entrepreneur-friendly venues
- Filtering by amenities and community presence
- Real-time occupancy and activity data

### Biometric Authentication
- Secure, convenient access
- Integration with passport verification
- Enhanced security for transactions

## Roadmap

### Phase 1: Foundation (Current)
- Website enhancement
- PWA implementation
- Authentication system
- Core passport concept

### Phase 2: Core Features
- Digital passport system
- GPS check-in
- Venue directory
- Basic user profiles
- Idea registry

### Phase 3: Mobile & Community
- Capacitor implementation
- Community connections
- Activity feeds
- Enhanced venue discovery

### Phase 4: Advanced Features
- Digital wallet integration
- Investment matching
- Advanced analytics
- Global expansion

## Getting Started

### Prerequisites
- Node.js
- Firebase account
- GitHub account

### Installation
1. Clone this repository
2. Navigate to the website directory
3. Open index.html or use a local server

For development:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Contributing

SociallyFounded is currently in early development. If you're interested in contributing, please contact us directly.

## License

This project is proprietary and confidential. All rights reserved.

## Contact

- Email: partnerships@4sqcapital.com
- Website: [sociallyfounded.com](https://sociallyfounded.com)

---

SociallyFounded: Where entrepreneurial journeys converge and amplify.
