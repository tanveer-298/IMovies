const path = require('path');
module.paths.push(path.join(__dirname, '../server/node_modules'));
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../server/src/models/User');
const Movie = require('../server/src/models/Movie');
const Cinema = require('../server/src/models/Cinema');
const Screen = require('../server/src/models/Screen');
const Show = require('../server/src/models/Show');
const Booking = require('../server/src/models/Booking');
const Payment = require('../server/src/models/Payment');
const Task = require('../server/src/models/Task');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies_db';

const initialTasks = [
  // EPIC 1: UI/UX and Frontend (3 tasks)
  {
    taskId: 'TASK-1',
    title: 'Create responsive home page and navigation',
    description: 'Design and build the cinematic hero banner, responsive navigation bar, trending sections, and footer with modern dark styling.',
    epic: 'EPIC 1: UI/UX and Frontend',
    priority: 'High',
    status: 'Done',
    order: 1
  },
  {
    taskId: 'TASK-2',
    title: 'Build movie listing, search, and filters',
    description: 'Implement movie catalog grid with live search, genre filters, language selectors, rating sorting, and pagination.',
    epic: 'EPIC 1: UI/UX and Frontend',
    priority: 'High',
    status: 'Done',
    order: 2
  },
  {
    taskId: 'TASK-3',
    title: 'Create movie details and showtime pages',
    description: 'Display movie synopsis, trailers, ratings, cast, cinema date selector, and showtime cards grouped by theater format.',
    epic: 'EPIC 1: UI/UX and Frontend',
    priority: 'High',
    status: 'Done',
    order: 3
  },

  // EPIC 2: Authentication and Users (3 tasks)
  {
    taskId: 'TASK-4',
    title: 'Implement registration and login',
    description: 'Build secure authentication forms with client and server input validation, password hashing, and user profile management.',
    epic: 'EPIC 2: Authentication and Users',
    priority: 'High',
    status: 'Done',
    order: 4
  },
  {
    taskId: 'TASK-5',
    title: 'Implement JWT authentication and protected routes',
    description: 'Configure JWT bearer token generation, token verification middleware, AuthContext state, and React Router private route guards.',
    epic: 'EPIC 2: Authentication and Users',
    priority: 'High',
    status: 'Done',
    order: 5
  },
  {
    taskId: 'TASK-6',
    title: 'Create the user profile and dashboard',
    description: 'Build user dashboard with upcoming and past booking history, ticket view, profile editor, and password changing.',
    epic: 'EPIC 2: Authentication and Users',
    priority: 'Medium',
    status: 'Done',
    order: 6
  },

  // EPIC 3: Movie and Cinema Management (3 tasks)
  {
    taskId: 'TASK-7',
    title: 'Create movie database models and APIs',
    description: 'Design Mongoose Movie schema with indexes and build RESTful CRUD endpoints with validation and search filtering.',
    epic: 'EPIC 3: Movie and Cinema Management',
    priority: 'High',
    status: 'Done',
    order: 7
  },
  {
    taskId: 'TASK-8',
    title: 'Implement cinema and screen management',
    description: 'Create Cinema and Screen schemas supporting multiple theater formats (IMAX, 4DX, Dolby), seat layouts, and capacities.',
    epic: 'EPIC 3: Movie and Cinema Management',
    priority: 'Medium',
    status: 'Done',
    order: 8
  },
  {
    taskId: 'TASK-9',
    title: 'Implement showtimes and pricing',
    description: 'Build Show scheduling system with multi-tiered seat pricing (Standard, Premium, VIP) and automated seat grid generation.',
    epic: 'EPIC 3: Movie and Cinema Management',
    priority: 'High',
    status: 'Done',
    order: 9
  },

  // EPIC 4: Booking and Seat Management (4 tasks)
  {
    taskId: 'TASK-10',
    title: 'Build the interactive seat selection interface',
    description: 'Construct interactive cinema seating map with screen curvature, seat status indicators, selection limits, and live price summary.',
    epic: 'EPIC 4: Booking and Seat Management',
    priority: 'High',
    status: 'Done',
    order: 10
  },
  {
    taskId: 'TASK-11',
    title: 'Implement server-side seat availability and conflict prevention',
    description: 'Implement atomic seat hold mechanism with expiration timers to prevent double-booking and concurrency race conditions.',
    epic: 'EPIC 4: Booking and Seat Management',
    priority: 'High',
    status: 'Done',
    order: 11
  },
  {
    taskId: 'TASK-12',
    title: 'Implement booking creation, history, and cancellation',
    description: 'Build booking persistence with unique reference codes, ownership restrictions, and cancellation rules with seat release.',
    epic: 'EPIC 4: Booking and Seat Management',
    priority: 'High',
    status: 'Done',
    order: 12
  },
  {
    taskId: 'TASK-13',
    title: 'Implement simulated payment and ticket confirmation',
    description: 'Create simulated payment gateway with 1-click success/failure test modes, server-side price recalculation, and QR code tickets.',
    epic: 'EPIC 4: Booking and Seat Management',
    priority: 'High',
    status: 'Done',
    order: 13
  },

  // EPIC 5: Administration and Project Workspace (3 tasks)
  {
    taskId: 'TASK-14',
    title: 'Build the admin dashboard',
    description: 'Create analytics dashboard displaying total revenue, confirmed bookings, user counts, and popular movies revenue shares.',
    epic: 'EPIC 5: Administration and Project Workspace',
    priority: 'Medium',
    status: 'Done',
    order: 14
  },
  {
    taskId: 'TASK-15',
    title: 'Implement secure movie, cinema, show, and user administration',
    description: 'Build administrative management panels with role-based access control protecting all administrative operations.',
    epic: 'EPIC 5: Administration and Project Workspace',
    priority: 'Medium',
    status: 'Done',
    order: 15
  },
  {
    taskId: 'TASK-16',
    title: 'Build the Overview, Workspace, and Kanban sections',
    description: 'Implement project workspace UI featuring Project Overview, Architecture Docs, API Explorer, and interactive 5-column Kanban board.',
    epic: 'EPIC 5: Administration and Project Workspace',
    priority: 'Medium',
    status: 'Done',
    order: 16
  },

  // EPIC 6: Testing, Deployment, and Documentation (3 tasks)
  {
    taskId: 'TASK-17',
    title: 'Write automated tests and fix application errors',
    description: 'Create automated backend integration tests for auth, movie catalog, seat conflict prevention, payment simulation, and permissions.',
    epic: 'EPIC 6: Testing, Deployment, and Documentation',
    priority: 'High',
    status: 'Done',
    order: 17
  },
  {
    taskId: 'TASK-18',
    title: 'Prepare deployment configuration and Demo/GitHub links',
    description: 'Configure environment variables, health checks, production build scripts, and mentor-ready repository and demo status links.',
    epic: 'EPIC 6: Testing, Deployment, and Documentation',
    priority: 'Medium',
    status: 'Done',
    order: 18
  },
  {
    taskId: 'TASK-19',
    title: 'Create the README and final project documentation',
    description: 'Write comprehensive documentation including software/hardware prerequisites, installation guide, troubleshooting, and API docs.',
    epic: 'EPIC 6: Testing, Deployment, and Documentation',
    priority: 'Medium',
    status: 'Done',
    order: 19
  }
];

const sampleMovies = [
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: ['English', 'Hindi'],
    duration: 166,
    releaseDate: new Date('2026-03-01'),
    rating: 8.8,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    status: 'now_showing',
    featured: true,
    trending: true,
    director: 'Denis Villeneuve',
    cast: ['Timothee Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    ageRating: 'UA'
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: ['Biography', 'Drama', 'History'],
    language: ['English'],
    duration: 180,
    releaseDate: new Date('2026-02-15'),
    rating: 8.9,
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    status: 'now_showing',
    featured: true,
    trending: true,
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    ageRating: 'A'
  },
  {
    title: 'Spider-Man: Beyond the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    genre: ['Animation', 'Action', 'Adventure'],
    language: ['English', 'Hindi', 'Tamil'],
    duration: 140,
    releaseDate: new Date('2026-04-10'),
    rating: 8.7,
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
    status: 'now_showing',
    featured: false,
    trending: true,
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    ageRating: 'U'
  },
  {
    title: 'Interstellar: 10th Anniversary IMAX',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: ['English'],
    duration: 169,
    releaseDate: new Date('2026-01-20'),
    rating: 8.9,
    posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    status: 'now_showing',
    featured: false,
    trending: true,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    ageRating: 'UA'
  },
  {
    title: 'The Batman: Part II',
    description: 'In his second year of fighting crime, Batman pursues the deepest corruption in Gotham City while unraveling conspiracies tied to his family.',
    genre: ['Action', 'Crime', 'Drama'],
    language: ['English', 'Hindi'],
    duration: 160,
    releaseDate: new Date('2026-05-18'),
    rating: 8.4,
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4',
    status: 'now_showing',
    featured: false,
    trending: false,
    director: 'Matt Reeves',
    cast: ['Robert Pattinson', 'Andy Serkis', 'Colin Farrell'],
    ageRating: 'A'
  },
  {
    title: 'Gladiator II',
    description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered.',
    genre: ['Action', 'Adventure', 'Drama'],
    language: ['English', 'Hindi'],
    duration: 148,
    releaseDate: new Date('2026-02-01'),
    rating: 8.2,
    posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo',
    status: 'now_showing',
    featured: false,
    trending: true,
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington'],
    ageRating: 'A'
  },
  {
    title: 'Cyberpunk: Neon Horizon',
    description: 'In 2099 Neo-Tokyo, a rogue cyber-detective uncovers an artificial intelligence entity controlling high-stakes memory markets.',
    genre: ['Sci-Fi', 'Thriller', 'Mystery'],
    language: ['English', 'Japanese'],
    duration: 135,
    releaseDate: new Date('2026-03-25'),
    rating: 8.1,
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/embed/LembwKDo1Dc',
    status: 'now_showing',
    featured: false,
    trending: false,
    director: 'Kenji Kamiyama',
    cast: ['Rinko Kikuchi', 'Hiroyuki Sanada', 'Steven Yeun'],
    ageRating: 'UA'
  },
  {
    title: 'Avatar: Fire and Ash',
    description: 'Jake Sully and Neytiri travel across uncharted regions of Pandora and meet the violent Ash People clan in a battle for survival.',
    genre: ['Sci-Fi', 'Adventure', 'Fantasy'],
    language: ['English', 'Hindi', 'Telugu'],
    duration: 190,
    releaseDate: new Date('2026-12-18'),
    rating: 9.0,
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
    status: 'coming_soon',
    featured: false,
    trending: true,
    director: 'James Cameron',
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
    ageRating: 'UA'
  },
  {
    title: 'Mission: Impossible — Final Reckoning',
    description: 'Ethan Hunt and the IMF team embark on their final and most dangerous mission yet, tracking down a terrifying new AI weapon threatening humanity.',
    genre: ['Action', 'Thriller', 'Adventure'],
    language: ['English', 'Hindi'],
    duration: 165,
    releaseDate: new Date('2026-06-20'),
    rating: 8.6,
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/embed/NOhDyUmT9z0',
    status: 'coming_soon',
    featured: false,
    trending: false,
    director: 'Christopher McQuarrie',
    cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg'],
    ageRating: 'UA'
  },
  {
    title: 'Inception (Remastered Atmos)',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    language: ['English'],
    duration: 148,
    releaseDate: new Date('2026-01-10'),
    rating: 8.8,
    posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    status: 'now_showing',
    featured: false,
    trending: false,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    ageRating: 'UA'
  }
];

const sampleCinemas = [
  {
    name: 'PVR ICON Gold Cinema',
    city: 'Mumbai',
    location: 'Phoenix Palladium, Lower Parel',
    address: '462, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
    amenities: ['IMAX with Laser', 'Dolby Atmos', 'Recliner Loungers', 'Gourmet Dining', 'Valet Parking'],
    rating: 4.8
  },
  {
    name: 'INOX Megaplex',
    city: 'Mumbai',
    location: 'Inorbit Mall, Malad West',
    address: 'Link Road, Malad West, Mumbai, Maharashtra 400064',
    amenities: ['4DX Motion', 'Dolby 7.1', 'Kiddles Zone', 'Cafe Unwind'],
    rating: 4.6
  },
  {
    name: 'Cinepolis Dolby Cinema',
    city: 'Bengaluru',
    location: 'Nexus Shantiniketan, Whitefield',
    address: 'Whitefield Main Road, Bengaluru, Karnataka 560067',
    amenities: ['Dolby Cinema', 'RealD 3D', 'VIP Recliners', 'Food on Seat'],
    rating: 4.7
  },
  {
    name: 'PVR Directors Cut',
    city: 'Delhi NCR',
    location: 'Ambience Mall, Vasant Kunj',
    address: 'Nelson Mandela Marg, Vasant Kunj, New Delhi, Delhi 110070',
    amenities: ['Ultra Luxury Lounges', 'Private Screenings', 'Michelin Chef Menu'],
    rating: 4.9
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB database successfully.');

    // 1. Seed Tasks (19 tasks, 6 epics)
    console.log('[Seed] Seeding Kanban tasks...');
    await Task.deleteMany({});
    await Task.insertMany(initialTasks);
    console.log(`[Seed] Inserted ${initialTasks.length} tasks across 6 epics.`);

    // 2. Seed Users (Admin and Demo User)
    console.log('[Seed] Seeding default users...');
    await User.deleteMany({ email: { $in: ['admin@imovies.com', 'demo@imovies.com', 'john@imovies.com'] } });

    const adminUser = await User.create({
      name: 'IMovies Chief Admin',
      email: 'admin@imovies.com',
      password: 'Admin@123password',
      phone: '+91 9876543210',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    });

    const demoUser = await User.create({
      name: 'Mansoor Demo User',
      email: 'demo@imovies.com',
      password: 'User@123password',
      phone: '+91 9123456780',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    });

    console.log('[Seed] Admin user created: admin@imovies.com (pass: Admin@123password)');
    console.log('[Seed] Demo user created: demo@imovies.com (pass: User@123password)');

    // 3. Seed Movies
    console.log('[Seed] Seeding movies...');
    await Movie.deleteMany({});
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seed] Inserted ${createdMovies.length} movies.`);

    // 4. Seed Cinemas & Screens
    console.log('[Seed] Seeding cinemas and screens...');
    await Cinema.deleteMany({});
    await Screen.deleteMany({});

    const createdCinemas = [];
    const createdScreens = [];

    for (let c of sampleCinemas) {
      const cinema = await Cinema.create(c);
      createdCinemas.push(cinema);

      // Create 2 screens for each cinema
      const screen1 = await Screen.create({
        cinemaId: cinema._id,
        screenNumber: 1,
        screenName: 'Audi 1 - IMAX Laser Experience',
        screenType: 'IMAX',
        capacity: 60,
        seatLayout: {
          totalRows: 6,
          seatsPerRow: 10,
          tiers: [
            { tierName: 'Standard', priceMultiplier: 1, rowStart: 'A', rowEnd: 'C' },
            { tierName: 'Premium', priceMultiplier: 1.35, rowStart: 'D', rowEnd: 'E' },
            { tierName: 'VIP', priceMultiplier: 1.8, rowStart: 'F', rowEnd: 'F' }
          ]
        }
      });

      const screen2 = await Screen.create({
        cinemaId: cinema._id,
        screenNumber: 2,
        screenName: 'Audi 2 - Dolby Atmos 4K',
        screenType: 'Dolby Cinema',
        capacity: 60,
        seatLayout: {
          totalRows: 6,
          seatsPerRow: 10,
          tiers: [
            { tierName: 'Standard', priceMultiplier: 1, rowStart: 'A', rowEnd: 'C' },
            { tierName: 'Premium', priceMultiplier: 1.35, rowStart: 'D', rowEnd: 'E' },
            { tierName: 'VIP', priceMultiplier: 1.8, rowStart: 'F', rowEnd: 'F' }
          ]
        }
      });

      createdScreens.push(screen1, screen2);
    }
    console.log(`[Seed] Inserted ${createdCinemas.length} cinemas and ${createdScreens.length} screens.`);

    // 5. Seed Showtimes for today, tomorrow, and +2 days
    console.log('[Seed] Scheduling shows...');
    await Show.deleteMany({});

    const todayDate = new Date();
    const dates = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const showtimes = ['10:30', '14:15', '18:00', '21:30'];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    let showCount = 0;

    const nowShowingMovies = createdMovies.filter(m => m.status === 'now_showing');

    for (let movieIndex = 0; movieIndex < Math.min(nowShowingMovies.length, 5); movieIndex++) {
      const movie = nowShowingMovies[movieIndex];

      for (let cinemaIndex = 0; cinemaIndex < 2; cinemaIndex++) {
        const cinema = createdCinemas[cinemaIndex];
        const screen = createdScreens.find(s => s.cinemaId.equals(cinema._id));

        for (let date of dates) {
          const time = showtimes[(movieIndex + cinemaIndex) % showtimes.length];

          const basePrice = 280;
          const seatTiers = [
            { tierName: 'Standard', price: 280 },
            { tierName: 'Premium', price: 380 },
            { tierName: 'VIP', price: 500 }
          ];

          const seats = [];
          rows.forEach((row, rIdx) => {
            let tier = 'Standard';
            let price = 280;
            if (rIdx >= 5) {
              tier = 'VIP';
              price = 500;
            } else if (rIdx >= 3) {
              tier = 'Premium';
              price = 380;
            }

            for (let c = 1; c <= 10; c++) {
              // Pre-book a couple of sample seats for realism
              const isPrebooked = (row === 'C' && (c === 4 || c === 5));
              seats.push({
                seatId: `${row}${c}`,
                row,
                col: c,
                tier,
                price,
                status: isPrebooked ? 'booked' : 'available',
                heldBy: null,
                heldUntil: null,
                bookingId: null
              });
            }
          });

          await Show.create({
            movieId: movie._id,
            cinemaId: cinema._id,
            screenId: screen._id,
            date,
            startTime: time,
            endTime: '23:30',
            format: screen.screenType,
            language: movie.language[0] || 'English',
            basePrice,
            seatTiers,
            seats,
            isActive: true
          });
          showCount++;
        }
      }
    }
    console.log(`[Seed] Generated ${showCount} show schedules.`);

    // 6. Seed a sample confirmed booking for demo user
    console.log('[Seed] Seeding sample booking...');
    await Booking.deleteMany({});
    await Payment.deleteMany({});

    const firstShow = await Show.findOne({ isActive: true });
    if (firstShow) {
      const bookingRef = 'IMV-DEMO88';
      const paymentRef = 'PAY-DEMO99';

      const payment = await Payment.create({
        paymentReference: paymentRef,
        userId: demoUser._id,
        amount: 826,
        currency: 'INR',
        paymentMethod: 'simulated_fast_pay',
        status: 'success',
        isSimulated: true,
        transactionDetails: {
          cardLast4: '4242',
          gateway: 'IMovies Simulated SafePay',
          notes: 'Pre-seeded sample booking transaction'
        }
      });

      const qrData = JSON.stringify({
        ref: bookingRef,
        movie: 'Dune: Part Two',
        cinema: 'PVR ICON Gold Cinema',
        date: firstShow.date,
        time: firstShow.startTime,
        seats: 'C4, C5',
        total: 826
      });

      const booking = await Booking.create({
        bookingReference: bookingRef,
        userId: demoUser._id,
        showId: firstShow._id,
        movieId: firstShow.movieId,
        cinemaId: firstShow.cinemaId,
        screenId: firstShow.screenId,
        seats: [
          { seatId: 'C4', row: 'C', col: 4, tier: 'Standard', price: 280 },
          { seatId: 'C5', row: 'C', col: 5, tier: 'Standard', price: 280 }
        ],
        ticketSubtotal: 560,
        convenienceFee: 60,
        tax: 206,
        totalAmount: 826,
        paymentId: payment._id,
        bookingStatus: 'confirmed',
        qrCodeData: qrData
      });

      payment.bookingId = booking._id;
      await payment.save();

      console.log(`[Seed] Sample booking created: Ref ${bookingRef} for user ${demoUser.email}`);
    }

    console.log('==================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seedDatabase();