-- 1. Default Administrator
INSERT INTO admins (name, email, password_hash, salt, hash_iterations, admin_level) VALUES
('Campus Administrator', 'admin@campusconnect.edu', '2Yj7wIHQX2z/GHuGmSyk4URI7Wy/tkxIBBp7PD2Bv80=', '3VGy2xGX+PUTO8rfA/34nQ==', 100000, 'SUPER');

-- 2. Demonstration Students
INSERT INTO students (name, email, password_hash, salt, hash_iterations, department, year_of_study, interests) VALUES
('Alex Rivera', 'alex@campusconnect.edu', '+ndR/zg398lxATwTGtjMcijOygybQz0gAZkzUHpQysM=', 'P3wi/fdtedFEBEVF6/KIjQ==', 100000, 'Computer Science', 3, 'Programming,Artificial Intelligence,Design'),
('Priya Sharma', 'priya@campusconnect.edu', '+ndR/zg398lxATwTGtjMcijOygybQz0gAZkzUHpQysM=', 'P3wi/fdtedFEBEVF6/KIjQ==', 100000, 'Electronics & Comm', 2, 'Robotics,Volunteering,Social Impact'),
('Marcus Chen', 'marcus@campusconnect.edu', '+ndR/zg398lxATwTGtjMcijOygybQz0gAZkzUHpQysM=', 'P3wi/fdtedFEBEVF6/KIjQ==', 100000, 'Mechanical Engineering', 4, 'Entrepreneurship,Public Speaking,Sports');

-- 3. Demonstration Clubs
INSERT INTO clubs (name, category, description, contact_email, contact_info, active) VALUES
('ACM Student Chapter', 'Technology', 'Premier computing society focusing on competitive programming, open source projects, and technical hackathons.', 'acm@campusconnect.edu', 'CS Building Lab 3', 1),
('AI & Robotics Innovators', 'Technology', 'Hands-on robotics, deep learning research, computer vision workshops, and national drone competitions.', 'robotics@campusconnect.edu', 'Mechatronics Wing Rm 102', 1),
('Google Developer Student Club', 'Technology', 'University-based community group for students interested in Google developer technologies, mobile apps, and cloud.', 'gdsc@campusconnect.edu', 'Innovation Hub 204', 1),
('Kala Cultural Arts Collective', 'Cultural', 'Fostering traditional music, theatre, classical dance, and organizing the annual campus cultural festival.', 'cultural@campusconnect.edu', 'Student Center Amphitheatre', 1),
('Campus Red Cross & Seva Guild', 'Social Impact', 'Community outreach, blood donation drives, flood relief volunteering, and teaching underprivileged kids.', 'seva@campusconnect.edu', 'Health & Wellness Office', 1),
('E-Cell Entrepreneurship Cell', 'Entrepreneurship', 'Empowering aspiring campus founders with angel investor bootcamps, startup pitch competitions, and mentorship.', 'ecell@campusconnect.edu', 'Incubation Center Suite A', 1),
('Design & Creative UX Society', 'Design', 'UI/UX design, generative art, Figma masterclasses, brand identity consulting, and digital illustration jams.', 'design@campusconnect.edu', 'Media Studio 3', 1),
('Varsity Sports Association', 'Sports', 'Organizing inter-college tournaments in football, basketball, cricket, badminton, and annual athletics meet.', 'sports@campusconnect.edu', 'Campus Sports Complex', 1);

-- 4. Demonstration Events & Opportunities
INSERT INTO events (title, description, category, opportunity_type, event_date, venue, organizer, reg_deadline, eligibility, capacity, available_seats, registration_open, active) VALUES
('Campus HackAI 2026', 'A 36-hour flagship campus hackathon building real-world AI applications, agentic tools, and smart campus assistants. Mentorship from industry engineers.', 'Technology', 'Hackathon', date('now','+7 day'), 'Main Auditorium & Innovation Lab', 'ACM Student Chapter', datetime('now','+5 day'), 'All Engineering & BCA Students', 100, 98, 1, 1),

('Figma to Flutter UI Bootcamp', 'Hands-on interactive masterclass covering design systems, component auto-layout in Figma, and translating prototypes into Flutter mobile apps.', 'Design', 'Workshop', date('now','+10 day'), 'Computer Center Lab 2', 'Design & Creative UX Society', datetime('now','+8 day'), 'Open to all years', 40, 39, 1, 1),

('Campus PitchFest & Startup Showcase', 'Pitch your startup idea to venture capitalists, angel investors, and alumni founders. Seed funding grants up to Rs. 1,00,000 for top 3 teams.', 'Entrepreneurship', 'Competition', date('now','+14 day'), 'Incubation Hall Alpha', 'E-Cell', datetime('now','+12 day'), 'Open to all enrolled students', 30, 30, 1, 1),

('Green Campus Tree Plantation & Cleanup', 'Weekend community service drive planting 200 saplings across south campus and organizing zero-waste segregation workshops.', 'Social Impact', 'Volunteering', date('now','+3 day'), 'South Campus Grounds', 'Campus Red Cross & Seva Guild', datetime('now','+2 day'), 'All campus members', 60, 59, 1, 1),

('Aura 2026: Annual Inter-College Battle of the Bands', 'Live acoustic and rock music competition featuring 15 college bands from across the state. Food stalls, lights, and voting.', 'Cultural', 'Cultural', date('now','+18 day'), 'Open Air Theatre', 'Kala Cultural Arts Collective', datetime('now','+15 day'), 'All Students & Faculty', 250, 250, 1, 1),

('Competitive Programming Intensive with Java', 'Master graph algorithms, dynamic programming, and complexity optimization for technical product company interviews.', 'Technology', 'Skill Development', date('now','+5 day'), 'Online / CS Seminar Hall', 'ACM Student Chapter', datetime('now','+4 day'), 'Year 2, 3, 4 Students', 80, 80, 1, 1),

('Full-Stack Web Development Crash Course', 'Learn modern REST APIs, database persistence, and reactive frontends from industry experts.', 'Technology', 'Workshop', date('now','-10 day'), 'Tech Seminar Hall 1', 'GDSC', datetime('now','-12 day'), 'All Years', 50, 48, 0, 1),

('Clean Water Community Outreach', 'Field volunteering program delivering water filtration units and testing tap water quality in neighboring rural schools.', 'Social Impact', 'Volunteering', date('now','-20 day'), 'Suburban Community Center', 'Campus Red Cross & Seva Guild', datetime('now','-22 day'), 'All Years', 40, 38, 0, 1);

-- 5. Seed Registrations & Verified Attendance (giving Alex verified stamps for Campus Passport)
-- Event 7 attended and verified by Admin -> Earns "First Event" & "Tech Explorer" stamp
INSERT INTO registrations (student_id, event_id, status, attendance_status, verified_at, verified_by) VALUES
(1, 7, 'REGISTERED', 'ATTENDED', datetime('now','-9 day'), 'Campus Administrator'),
(1, 8, 'REGISTERED', 'ATTENDED', datetime('now','-19 day'), 'Campus Administrator'),
(1, 1, 'REGISTERED', 'PENDING', NULL, NULL),
(1, 2, 'REGISTERED', 'PENDING', NULL, NULL),
(1, 4, 'REGISTERED', 'PENDING', NULL, NULL);

-- 6. Saved Events
INSERT INTO saved_events (student_id, event_id) VALUES
(1, 1),
(1, 3);
