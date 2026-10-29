CampusConnect 🎓

Your Campus. Your People. Your Possibilities.

CampusConnect is a web-based campus management and student engagement platform designed to bring campus clubs, events, opportunities, and student activities together in one place.

The platform helps students discover communities, participate in events, save opportunities that interest them, and track their campus engagement. It also provides administrative features for managing clubs, events, and attendance.

📌 Table of Contents

- About the Project
- Problem Statement
- Project Objectives
- Key Features
- User Roles
- Technology Stack
- Project Structure
- Installation and Setup
- Running the Application
- Demo Credentials
- Database and Demo Data
- Deployment
- Security Considerations
- Future Scope
- Team and Acknowledgements

📖 About the Project

CampusConnect aims to simplify the way students interact with campus activities and communities.

In many colleges, information about clubs, workshops, hackathons, volunteering activities, and other opportunities is scattered across different communication channels. Students may miss useful opportunities or find it difficult to track their registrations and interests.

CampusConnect provides a centralized platform where students can discover clubs, explore upcoming events, manage their profiles, and participate in campus activities.

The application includes a student-facing interface and an administrative dashboard for managing campus information.

🎯 Problem Statement

Students often face difficulties such as:

- Finding relevant college clubs and student communities.
- Discovering workshops, hackathons, competitions, and volunteering opportunities.
- Keeping track of event registrations and saved events.
- Finding activities that match their interests.
- Tracking participation and campus achievements.
- Managing club and event information efficiently.

CampusConnect addresses these challenges through a single, organized web application.

🚀 Project Objectives

1. Create a centralized platform for campus clubs and events.
2. Make campus opportunities easier to discover through search and filters.
3. Provide personalized recommendations based on student interests.
4. Allow students to register for events and save opportunities.
5. Maintain student profiles and participation information.
6. Provide administrative tools for managing clubs, events, and attendance.
7. Encourage students to participate in activities beyond the classroom.

✨ Key Features

1. Student Registration and Login

- Student account creation.
- Login using email and password.
- Password verification using a secure hashing approach.
- Basic validation for registration and login.
- Rejection of duplicate registrations and incorrect credentials.

2. Student Dashboard

- Personalized welcome section.
- Summary of event registrations and saved events.
- Campus Passport stamps and earned badges.
- Activities selected according to student interests.
- Quick access to campus clubs and events.

3. Discover Clubs

- Browse available campus clubs and communities.
- Search clubs by name or relevant keywords.
- Filter clubs by category.
- View club descriptions, contact details, and locations.

4. Events and Opportunities

- Explore workshops, hackathons, competitions, volunteering activities, and other campus events.
- Search events and apply category or event-type filters.
- View event details, dates, venues, and seat availability.
- Register for available events.
- Cancel registrations when needed.
- Save events for later reference.
- Track registration status.

5. Personalized Interests

- Maintain a profile with student interests.
- Display opportunities related to selected interests.
- Help students discover activities relevant to their skills and preferences.

6. Campus Passport

- Track participation-related achievements.
- Display verified stamps and earned badges.
- Encourage students to participate in campus activities.

7. Student Profile

- View and manage profile information.
- Maintain interests used for personalized opportunities.
- Access student-specific campus activity information.

8. Admin Dashboard

- Dedicated administrative login.
- View administrative statistics.
- Add, edit, and archive club information.
- Create and manage events.
- Manage event attendance.
- Maintain event and participation records.

👥 User Roles

Student

Students can:

- Register and log in.
- Explore clubs and events.
- Search and filter opportunities.
- Register for events and cancel registrations.
- Save events.
- Manage their interests and profile.
- View their campus achievements.

Administrator

Administrators can:

- Access the admin dashboard.
- Manage campus clubs and events.
- Update event information.
- Mark attendance.
- Review available administrative statistics.

🛠️ Technology Stack

The browser version uses the following technologies:

Technology| Purpose
Node.js| Server-side JavaScript runtime
HTML5| Web page structure
CSS3| Styling and responsive layouts
JavaScript| Frontend interactions and application logic
SQLite| Relational database
Node.js HTTP module| HTTP server and API handling
Node.js Crypto module| Password hashing and verification

The application is designed to serve its frontend and backend through a single Node.js service.

📁 Project Structure

The main project files include:

CampusConnect-Web/
├── public/
│   └── index.html
├── server.js
├── schema.sql
├── seed.sql
├── package.json
└── .gitignore

File descriptions:

- "public/index.html" — contains the browser interface.
- "server.js" — runs the server, handles API requests, and connects application logic with the database.
- "schema.sql" — defines the database tables and relationships.
- "seed.sql" — contains initial demo records.
- "package.json" — contains project metadata and Node.js scripts.
- ".gitignore" — identifies files that should not be committed to Git.

⚙️ Prerequisites

Before running the application locally, ensure that you have:

- Node.js version 22 or newer.
- Git, if cloning the repository.
- Visual Studio Code or another code editor.
- A modern web browser.

Check your Node.js installation:

node -v

Check Git:

git --version

💻 Installation and Setup

Step 1: Obtain the Project

Clone the repository:

git clone https://github.com/lavanyagoyal08/CampusConnectWeb.git

Alternatively, download the repository as a ZIP file and extract it.

Step 2: Open the Project Folder

Open the extracted "CampusConnect-Web" folder in Visual Studio Code.

Open the integrated terminal from the VS Code menu:

Terminal → New Terminal

Ensure that the terminal is inside the project directory.

Step 3: Start the Application

Run:

node server.js

The application should initialize its database as configured and start the HTTP server.

Step 4: Open the Website

Visit:

http://localhost:3000

The login page should appear if the server has started successfully.

Note: If the server reports a missing module or database error, check the terminal output and confirm that the project files and required runtime are available.

🔑 Demo Credentials

The project provides the following demo accounts for testing.

Student account

- Email: "alex@campusconnect.edu"
- Password: "student123"

Admin account

- Email: "admin@campusconnect.edu"
- Password: "admin123"

These credentials are intended for demonstration and local testing only. Change or disable demo credentials before using the application with real users.

🗄️ Database and Demo Data

CampusConnect uses SQLite in its browser version.

The database schema is defined in "schema.sql", while initial demo records are defined in "seed.sql".

The server is configured to initialize the database and insert demo data when the relevant initialization conditions are met.

The application uses database records for features such as:

- Student accounts and authentication.
- Club information.
- Events and event registrations.
- Saved events.
- Student interests and profiles.
- Attendance and campus achievements.
- Administrative information.

The exact tables and relationships are defined in the SQL schema.

Important Database Considerations

- Store the SQLite database in a writable directory.
- Use persistent storage on the hosting platform if user-created data must survive service restarts and redeployments.
- Keep database files and private configuration out of public repositories.
- Back up important data regularly.
- Demo data may be recreated if the database is reset or initialized again, depending on the server implementation.

☁️ Deployment

CampusConnect-Web is intended to run as a Node.js web service.

The browser version has been deployed using Render.

Deployment Checklist

1. Push the project files to the connected GitHub repository.
2. Create or open the existing Render web service.
3. Connect the correct repository and branch.
4. Select the Node runtime.
5. Configure the build and start commands according to "package.json" and the application setup.
6. Ensure the server listens on the port provided by the hosting platform.
7. Configure a writable, persistent database location if supported by the deployment plan.
8. Deploy the application and inspect the service logs.
9. Open the deployed URL and test login, registration, events, and database operations.

Database Persistence

A successful deployment does not necessarily mean that the database is configured correctly.

The service must be able to create or open the SQLite database file at its configured location. On hosting platforms, the application's filesystem and permissions may differ from the local development environment.

For production use, configure persistent storage and test whether registrations and other changes remain available after a restart.

🔐 Security Considerations

Security is important when handling student accounts and application data.

- Passwords should never be stored as plain text.
- Password verification should use the configured password-hashing scheme.
- Never commit real database passwords, API keys, or other secrets to GitHub.
- Use environment variables for sensitive deployment configuration.
- Validate and sanitize user input.
- Restrict administrative operations to authorized administrators.
- Use HTTPS for deployed applications.
- Replace demo credentials before production use.
- Use appropriate backups and access controls for stored data.

🧪 Testing

After starting the application, manually verify the main workflows:

- Student login with valid credentials.
- Rejection of invalid login credentials.
- Student registration and duplicate-account handling.
- Admin login.
- Club search and category filters.
- Event search and filtering.
- Event registration and cancellation.
- Saving and unsaving events.
- Profile and interest updates.
- Attendance and achievement displays.
- Database access after restarting the service.

The actual test coverage depends on the current implementation and the testing tools configured in the repository.

🔮 Future Scope

Possible future improvements include:

- Email or in-app notifications for upcoming events.
- Advanced opportunity recommendations.
- Calendar integration and reminders.
- Better analytics for student participation.
- Improved accessibility and mobile responsiveness.
- Persistent managed database infrastructure.
- Automated testing and continuous integration.
- Additional student collaboration features.

These are potential enhancements and should not be considered implemented unless they are added to the codebase.

🎓 Project Purpose

CampusConnect is intended to improve campus engagement by making clubs, events, student interests, and participation records easier to manage through one platform.

The project demonstrates the integration of a browser-based interface, server-side application logic, relational data storage, authentication, and administrative workflows.

🙌 Acknowledgements

Developed as a campus-focused academic software project to explore web application development, database integration, authentication, and student activity management.

---

CampusConnect — Your Campus. Your People. Your Possibilities.