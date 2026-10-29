// CampusConnect Web — zero-dependency Node server (API + static site). Port of the Java DAO/service logic.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'campusconnect.db');
const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
if (db.prepare('SELECT COUNT(*) c FROM admins').get().c === 0) {
  db.exec(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));
  console.log('Database seeded with demo data.');
}

// ---------- password hashing (same PBKDF2-SHA256 scheme as PasswordUtil.java) ----------
function hashPw(pw, iter = 100000) {
  const salt = crypto.randomBytes(16);
  return { hash: crypto.pbkdf2Sync(pw, salt, iter, 32, 'sha256').toString('base64'), salt: salt.toString('base64'), iter };
}
function verifyPw(pw, hash, salt, iter) {
  try {
    const a = crypto.pbkdf2Sync(pw, Buffer.from(salt, 'base64'), iter || 100000, 32, 'sha256');
    const b = Buffer.from(hash, 'base64');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
}

// ---------- sessions (token -> user, in memory) ----------
const sessions = new Map();
function newSession(user) { const t = crypto.randomBytes(24).toString('hex'); sessions.set(t, user); return t; }

// ---------- helpers ----------
const EMAIL_RE = /^[\w.+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
class HttpError extends Error { constructor(code, msg) { super(msg); this.code = code; } }
const bad = (m) => new HttpError(400, m);
const publicStudent = (s) => ({ id: s.id, name: s.name, email: s.email, department: s.department, yearOfStudy: s.year_of_study, interests: s.interests ? s.interests.split(',').filter(Boolean) : [] });

const INTEREST_MAP = {
  'Programming': ['Technology'], 'Artificial Intelligence': ['Technology'], 'Data Science': ['Technology'],
  'Design': ['Design'], 'Entrepreneurship': ['Entrepreneurship'], 'Cultural Activities': ['Cultural'],
  'Sports': ['Sports'], 'Volunteering': ['Social Impact'], 'Public Speaking': ['Entrepreneurship', 'Cultural'],
  'Social Impact': ['Social Impact'],
};
const reasonText = (m) => m.length === 1 ? 'Matches your interest in ' + m[0] : 'Matches your interests in ' + m.join(' & ');
const BADGE_RULES = (stamps) => {
  const out = []; if (!stamps.length) return out;
  const n = (f) => stamps.filter(f).length;
  out.push('🥇 First Event');
  if (n(s => s.category === 'Technology') >= 3) out.push('💻 Tech Explorer');
  if (n(s => s.category === 'Social Impact') >= 2) out.push('🤝 Community Contributor');
  if (n(s => s.category === 'Cultural' || s.category === 'Design') >= 2) out.push('🎨 Creative Mind');
  if (stamps.length >= 5) out.push('⭐ All Rounder');
  return out;
};

// ---------- route table ----------
const routes = [];
const route = (method, pattern, role, fn) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), role, fn });

// Auth
route('POST', '/api/register', null, ({ body }) => {
  const { name, email, password, confirmPassword, department, yearOfStudy } = body;
  if (!name || name.trim().length < 2) throw bad('Name must be at least 2 characters.');
  if (!email || !EMAIL_RE.test(email.trim())) throw bad('Please enter a valid email address.');
  if (!password || password.length < 6) throw bad('Password must be at least 6 characters.');
  if (password !== confirmPassword) throw bad('Passwords do not match.');
  if (!department || !department.trim()) throw bad('Department is required.');
  const e = email.trim().toLowerCase();
  if (db.prepare('SELECT 1 FROM students WHERE email=?').get(e)) throw bad('An account with this email address already exists.');
  const h = hashPw(password);
  const r = db.prepare('INSERT INTO students (name,email,password_hash,salt,hash_iterations,department,year_of_study,interests) VALUES (?,?,?,?,?,?,?,?)')
    .run(name.trim(), e, h.hash, h.salt, h.iter, department.trim(), Number(yearOfStudy) || 1, '');
  const s = db.prepare('SELECT * FROM students WHERE id=?').get(r.lastInsertRowid);
  return { token: newSession({ role: 'student', id: s.id }), user: publicStudent(s), role: 'student' };
});
route('POST', '/api/login', null, ({ body }) => {
  const e = (body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(e)) throw bad('Please enter a valid email address.');
  if (!body.password) throw bad('Password is required.');
  const s = db.prepare('SELECT * FROM students WHERE email=?').get(e);
  if (!s || !verifyPw(body.password, s.password_hash, s.salt, s.hash_iterations)) throw bad('Invalid email or password.');
  return { token: newSession({ role: 'student', id: s.id }), user: publicStudent(s), role: 'student' };
});
route('POST', '/api/admin/login', null, ({ body }) => {
  const a = db.prepare('SELECT * FROM admins WHERE email=?').get((body.email || '').trim().toLowerCase());
  if (!a || !verifyPw(body.password || '', a.password_hash, a.salt, a.hash_iterations)) throw bad('Invalid admin credentials.');
  return { token: newSession({ role: 'admin', id: a.id, name: a.name }), user: { id: a.id, name: a.name, email: a.email }, role: 'admin' };
});
route('GET', '/api/me', 'any', ({ user }) => {
  if (user.role === 'admin') { const a = db.prepare('SELECT id,name,email FROM admins WHERE id=?').get(user.id); return { role: 'admin', user: a }; }
  return { role: 'student', user: publicStudent(db.prepare('SELECT * FROM students WHERE id=?').get(user.id)) };
});

// Public-to-students data
const eventRow = (e, uid) => ({
  id: e.id, title: e.title, description: e.description, category: e.category, opportunityType: e.opportunity_type,
  eventDate: e.event_date, venue: e.venue, organizer: e.organizer, regDeadline: e.reg_deadline, eligibility: e.eligibility,
  capacity: e.capacity, availableSeats: e.available_seats, registrationOpen: !!e.registration_open,
  ...(uid ? {
    registered: !!db.prepare("SELECT 1 FROM registrations WHERE student_id=? AND event_id=? AND status='REGISTERED'").get(uid, e.id),
    saved: !!db.prepare('SELECT 1 FROM saved_events WHERE student_id=? AND event_id=?').get(uid, e.id),
  } : {}),
});
route('GET', '/api/events', 'student', ({ user, query }) => {
  let rows = db.prepare('SELECT * FROM events WHERE active=1 ORDER BY event_date').all();
  const q = (query.q || '').toLowerCase();
  if (q) rows = rows.filter(e => (e.title + ' ' + e.description + ' ' + e.organizer + ' ' + e.venue).toLowerCase().includes(q));
  if (query.category) rows = rows.filter(e => e.category === query.category);
  if (query.type) rows = rows.filter(e => e.opportunity_type === query.type);
  return rows.map(e => eventRow(e, user.id));
});
route('GET', '/api/events/:id', 'student', ({ user, params }) => {
  const e = db.prepare('SELECT * FROM events WHERE id=?').get(params.id);
  if (!e) throw new HttpError(404, 'Event not found.');
  return eventRow(e, user.id);
});
route('GET', '/api/clubs', 'student', ({ query }) => {
  let rows = db.prepare('SELECT * FROM clubs WHERE active=1 ORDER BY name').all();
  const q = (query.q || '').toLowerCase();
  if (q) rows = rows.filter(c => c.name.toLowerCase().includes(q));
  if (query.category) rows = rows.filter(c => c.category === query.category);
  return rows.map(c => ({ id: c.id, name: c.name, category: c.category, description: c.description, contactEmail: c.contact_email, contactInfo: c.contact_info }));
});
route('GET', '/api/meta', 'student', () => ({
  eventCategories: db.prepare('SELECT DISTINCT category v FROM events WHERE active=1 ORDER BY 1').all().map(r => r.v),
  eventTypes: db.prepare('SELECT DISTINCT opportunity_type v FROM events WHERE active=1 ORDER BY 1').all().map(r => r.v),
  clubCategories: db.prepare('SELECT DISTINCT category v FROM clubs WHERE active=1 ORDER BY 1').all().map(r => r.v),
  interests: Object.keys(INTEREST_MAP),
}));

// Registration (port of RegistrationDAO.safeRegister / cancelRegistration)
route('POST', '/api/events/:id/register', 'student', ({ user, params }) => {
  const eid = Number(params.id);
  db.exec('BEGIN IMMEDIATE');
  try {
    const ev = db.prepare('SELECT * FROM events WHERE id=?').get(eid);
    let msg;
    if (!ev) msg = 'Event not found.';
    else if (!ev.registration_open) msg = 'Registration is currently closed for this event.';
    else if (ev.reg_deadline && new Date(ev.reg_deadline.replace(' ', 'T') + (ev.reg_deadline.includes('Z') ? '' : 'Z')) < new Date()) msg = 'Registration deadline has passed.';
    else if (ev.available_seats <= 0) msg = 'Event is full. No seats remaining.';
    else {
      const ex = db.prepare('SELECT id,status FROM registrations WHERE student_id=? AND event_id=?').get(user.id, eid);
      if (ex && ex.status === 'REGISTERED') msg = 'You are already registered for this event.';
      else {
        if (ex) db.prepare("UPDATE registrations SET status='REGISTERED', reg_date=CURRENT_TIMESTAMP WHERE id=?").run(ex.id);
        else db.prepare("INSERT INTO registrations (student_id,event_id,status,attendance_status) VALUES (?,?, 'REGISTERED','PENDING')").run(user.id, eid);
        db.prepare('UPDATE events SET available_seats = available_seats - 1 WHERE id=?').run(eid);
      }
    }
    db.exec('COMMIT');
    if (msg) throw bad(msg);
    return { message: 'Registration successful!' };
  } catch (err) { try { db.exec('ROLLBACK'); } catch {} throw err; }
});
route('POST', '/api/events/:id/cancel', 'student', ({ user, params }) => {
  const eid = Number(params.id);
  const r = db.prepare("SELECT id FROM registrations WHERE student_id=? AND event_id=? AND status='REGISTERED'").get(user.id, eid);
  if (!r) throw bad('No active registration found.');
  db.prepare("UPDATE registrations SET status='CANCELLED' WHERE id=?").run(r.id);
  db.prepare('UPDATE events SET available_seats = available_seats + 1 WHERE id=? AND available_seats < capacity').run(eid);
  return { message: 'Registration cancelled.' };
});
route('POST', '/api/events/:id/save', 'student', ({ user, params }) => { db.prepare('INSERT OR IGNORE INTO saved_events (student_id,event_id) VALUES (?,?)').run(user.id, Number(params.id)); return { saved: true }; });
route('POST', '/api/events/:id/unsave', 'student', ({ user, params }) => { db.prepare('DELETE FROM saved_events WHERE student_id=? AND event_id=?').run(user.id, Number(params.id)); return { saved: false }; });

// My Campus / Passport / Recommendations / Profile
route('GET', '/api/my-campus', 'student', ({ user }) => {
  const regs = db.prepare("SELECT r.*, e.title, e.event_date, e.category FROM registrations r JOIN events e ON e.id=r.event_id WHERE r.student_id=? ORDER BY r.reg_date DESC").all(user.id)
    .map(r => ({ id: r.id, eventId: r.event_id, title: r.title, eventDate: r.event_date, category: r.category, status: r.status, attendanceStatus: r.attendance_status, verifiedAt: r.verified_at }));
  const saved = db.prepare('SELECT e.* FROM events e JOIN saved_events s ON s.event_id=e.id WHERE s.student_id=? ORDER BY s.saved_at DESC').all(user.id).map(e => eventRow(e, user.id));
  return { registrations: regs, saved };
});
route('GET', '/api/passport', 'student', ({ user }) => {
  const stamps = db.prepare("SELECT r.id, r.verified_at, e.id eid, e.title, e.category, e.opportunity_type, e.event_date FROM registrations r JOIN events e ON e.id=r.event_id WHERE r.student_id=? AND r.attendance_status='ATTENDED' ORDER BY e.event_date DESC").all(user.id)
    .map(s => ({ id: s.id, eventId: s.eid, title: s.title, category: s.category, opportunityType: s.opportunity_type, eventDate: s.event_date, verifiedAt: s.verified_at }));
  return { stamps, badges: BADGE_RULES(stamps), total: stamps.length };
});
route('GET', '/api/recommendations', 'student', ({ user }) => {
  const s = publicStudent(db.prepare('SELECT * FROM students WHERE id=?').get(user.id));
  if (!s.interests.length) return { events: [], clubs: [] };
  const scoreOf = (cat) => { const m = s.interests.filter(i => (INTEREST_MAP[i] || []).includes(cat)); return { score: m.length, reason: m.length ? reasonText(m) : '' }; };
  const events = db.prepare("SELECT * FROM events WHERE active=1 AND event_date >= date('now') AND registration_open=1 ORDER BY event_date").all()
    .map(e => ({ ...eventRow(e, user.id), ...scoreOf(e.category) })).filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score || a.eventDate.localeCompare(b.eventDate));
  const clubs = db.prepare('SELECT * FROM clubs WHERE active=1').all()
    .map(c => ({ id: c.id, name: c.name, category: c.category, description: c.description, ...scoreOf(c.category) })).filter(c => c.score > 0).sort((a, b) => b.score - a.score);
  return { events, clubs };
});
route('PUT', '/api/profile', 'student', ({ user, body }) => {
  if (!body.name || body.name.trim().length < 2) throw bad('Name must be at least 2 characters.');
  if (!body.department || !body.department.trim()) throw bad('Department is required.');
  const interests = (body.interests || []).filter(i => INTEREST_MAP[i]).join(',');
  db.prepare('UPDATE students SET name=?, department=?, year_of_study=?, interests=? WHERE id=?').run(body.name.trim(), body.department.trim(), Number(body.yearOfStudy) || 1, interests, user.id);
  return publicStudent(db.prepare('SELECT * FROM students WHERE id=?').get(user.id));
});

// Admin
route('GET', '/api/admin/stats', 'admin', () => {
  const c = (sql) => db.prepare(sql).get().c;
  return {
    students: c('SELECT COUNT(*) c FROM students'), clubs: c('SELECT COUNT(*) c FROM clubs WHERE active=1'),
    events: c('SELECT COUNT(*) c FROM events WHERE active=1'), upcoming: c("SELECT COUNT(*) c FROM events WHERE active=1 AND event_date >= date('now')"),
    registrations: c("SELECT COUNT(*) c FROM registrations WHERE status='REGISTERED'"), verified: c("SELECT COUNT(*) c FROM registrations WHERE attendance_status='ATTENDED'"),
  };
});
const clubFields = (b) => {
  if (!b.name || !b.name.trim()) throw bad('Club name is required.');
  if (!b.category || !b.category.trim()) throw bad('Category is required.');
  return [b.name.trim(), b.category.trim(), b.description || '', b.contactEmail || '', b.contactInfo || ''];
};
route('POST', '/api/admin/clubs', 'admin', ({ body }) => ({ id: Number(db.prepare('INSERT INTO clubs (name,category,description,contact_email,contact_info,active) VALUES (?,?,?,?,?,1)').run(...clubFields(body)).lastInsertRowid) }));
route('PUT', '/api/admin/clubs/:id', 'admin', ({ body, params }) => { db.prepare('UPDATE clubs SET name=?,category=?,description=?,contact_email=?,contact_info=? WHERE id=?').run(...clubFields(body), Number(params.id)); return { ok: true }; });
route('DELETE', '/api/admin/clubs/:id', 'admin', ({ params }) => { db.prepare('UPDATE clubs SET active=0 WHERE id=?').run(Number(params.id)); return { ok: true }; });
const eventFields = (b) => {
  for (const [k, l] of [['title', 'Title'], ['category', 'Category'], ['opportunityType', 'Type'], ['eventDate', 'Date'], ['venue', 'Venue'], ['organizer', 'Organizer']])
    if (!b[k] || !String(b[k]).trim()) throw bad(l + ' is required.');
  const cap = Math.max(1, Number(b.capacity) || 50);
  return [b.title.trim(), b.description || '', b.category.trim(), b.opportunityType.trim(), b.eventDate, b.venue.trim(), b.organizer.trim(), b.regDeadline || null, b.eligibility || 'All Students', cap, b.registrationOpen === false ? 0 : 1];
};
route('POST', '/api/admin/events', 'admin', ({ body }) => { const f = eventFields(body);
  return { id: Number(db.prepare('INSERT INTO events (title,description,category,opportunity_type,event_date,venue,organizer,reg_deadline,eligibility,capacity,registration_open,available_seats,active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)').run(...f, f[9]).lastInsertRowid) }; });
route('PUT', '/api/admin/events/:id', 'admin', ({ body, params }) => {
  const f = eventFields(body), id = Number(params.id);
  const taken = db.prepare("SELECT COUNT(*) c FROM registrations WHERE event_id=? AND status='REGISTERED'").get(id).c;
  db.prepare('UPDATE events SET title=?,description=?,category=?,opportunity_type=?,event_date=?,venue=?,organizer=?,reg_deadline=?,eligibility=?,capacity=?,registration_open=?,available_seats=? WHERE id=?')
    .run(...f, Math.max(0, f[9] - taken), id);
  return { ok: true };
});
route('DELETE', '/api/admin/events/:id', 'admin', ({ params }) => { db.prepare('UPDATE events SET active=0 WHERE id=?').run(Number(params.id)); return { ok: true }; });
route('GET', '/api/admin/events/:id/registrations', 'admin', ({ params }) =>
  db.prepare("SELECT r.id, s.name student_name, s.email, r.status, r.attendance_status, r.verified_at, r.verified_by FROM registrations r JOIN students s ON s.id=r.student_id WHERE r.event_id=? AND r.status='REGISTERED' ORDER BY r.reg_date").all(Number(params.id))
    .map(r => ({ id: r.id, studentName: r.student_name, email: r.email, status: r.status, attendanceStatus: r.attendance_status, verifiedAt: r.verified_at, verifiedBy: r.verified_by })));
route('POST', '/api/admin/registrations/:id/attendance', 'admin', ({ user, body, params }) => {
  if (!['ATTENDED', 'NOT_ATTENDED', 'PENDING'].includes(body.status)) throw bad('Invalid attendance status.');
  db.prepare('UPDATE registrations SET attendance_status=?, verified_at=CURRENT_TIMESTAMP, verified_by=? WHERE id=?').run(body.status, user.name || 'Admin', Number(params.id));
  return { ok: true };
});
route('GET', '/api/admin/events', 'admin', () => db.prepare('SELECT * FROM events WHERE active=1 ORDER BY event_date').all().map(e => eventRow(e)));
route('GET', '/api/admin/clubs', 'admin', () => db.prepare('SELECT * FROM clubs WHERE active=1 ORDER BY name').all().map(c => ({ id: c.id, name: c.name, category: c.category, description: c.description, contactEmail: c.contact_email, contactInfo: c.contact_info })));

// ---------- server ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (!url.pathname.startsWith('/api/')) {
    let f = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
    if (!f.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(__dirname, 'public', 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    return fs.createReadStream(f).pipe(res);
  }
  try {
    let raw = ''; for await (const ch of req) { raw += ch; if (raw.length > 1e6) throw bad('Request too large.'); }
    let body = {}; if (raw) { try { body = JSON.parse(raw); } catch { throw bad('Invalid JSON.'); } }
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = r.re.exec(url.pathname); if (!m) continue;
      let user = null;
      if (r.role) {
        user = sessions.get((req.headers.authorization || '').replace('Bearer ', ''));
        if (!user) throw new HttpError(401, 'Please sign in.');
        if (r.role !== 'any' && user.role !== r.role) throw new HttpError(403, 'Not allowed.');
      }
      return send(res, 200, await r.fn({ body, user, params: m.groups || {}, query: Object.fromEntries(url.searchParams) }));
    }
    throw new HttpError(404, 'Not found.');
  } catch (e) {
    if (!(e instanceof HttpError)) console.error(e);
    send(res, e.code || 500, { error: e instanceof HttpError ? e.message : 'Server error.' });
  }
});
server.listen(PORT, () => console.log('CampusConnect running on port ' + PORT));
