// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 10000;
const SECRET_KEY = "EDOC_SECRET_KEY";

// Authentication middleware
function isAuthenticated(req, res, next) {
  const token = req.cookies.authToken; // Get the token from the cookies

  if (!token) {
    return res.status(401).send("Unauthorized"); // Token is missing, unauthorized
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token"); // Token is invalid
    }
    req.userId = decoded.id;
    next();
  });
}

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // trusted sources
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed HTTPS methods
    allowedHeaders: ["Content-Type"],
    credentials: true, // allow cookies
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database("doctor_appointment.db");
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL
  );`
);
db.run(`
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT, -- URL or path to the doctor's image
    speciality TEXT NOT NULL,
    degree TEXT NOT NULL,
    experience TEXT NOT NULL,
    about TEXT NOT NULL,
    fees INTEGER NOT NULL,
    address_line1 TEXT,
    address_line2 TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

  `);
db.run(`
CREATE TABLE IF NOT EXISTS appointments (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
doctor_id INTEGER NOT NULL,
appointment_date TIMESTAMP NOT NULL,
appointment_time TEXT NOT NULL,
status TEXT DEFAULT 'Scheduled', -- Could be 'Scheduled', 'Completed', 'Cancelled', etc.
payment_status TEXT DEFAULT 'Pending', -- Could be 'Paid', 'Pending', etc.
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(user_id) REFERENCES users(id),
FOREIGN KEY(doctor_id) REFERENCES doctors(id)
);
`);
db.run(`CREATE TABLE IF NOT EXISTS slotDetails (
  userID INTEGER NOT NULL,
  doctorID INTEGER NOT NULL,
  slotnum INTEGER NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

// Helper function for authentication
const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.userId = decoded.id; // Attach user ID to the request
    next();
  });
};

// Routes
// Registration
app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "All Fields Required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, hashedPassword],
      (err) => {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            res.status(403).json({ message: "Email already exists." });
          } else {
            res.status(500).json({ message: "Database error." });
          }
        } else {
          res.status(201).json({ message: "User registered successfully." });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error hashing password." });
  }
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and Password are required." });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error." });
    }

    if (!user) {
      return res.status(404).json({ message: "User does not exist." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });

      res
        .cookie("authToken", token, {
          httpOnly: true,
          path: "/",
          maxAge: 3600000,
          expires: new Date(Date.now() + 3600000),
        })
        .status(200)
        .json({ message: "Login successful." });
    } else {
      res.status(400).json({ message: "Invalid email or password." });
    }
  });
});

// Protected route example
app.get("/dashboard", verifyToken, (req, res) => {
  res.status(200).json({ message: "Welcome to the dashboard!" });
});

// Logout
app.post("/logout", (req, res) => {
  res
    .clearCookie("authToken")
    .status(200)
    .json({ message: "Logout successful." });
});

// Fetch user details
app.get("/users/userDetails", isAuthenticated, (req, res) => {
  const userId = req.userId; // Get userId from the decoded token

  // Query the database to fetch the user details using the userId
  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user details as the response
    res.status(200).json({ email: user.email, name: user.name });
  });
});

// Fetch user appointments
app.get("/users/appointments", isAuthenticated, (req, res) => {
  const userId = req.userId; // Get userId from the decoded token

  // Query the database to fetch the user's appointments
  db.all(
    `SELECT 
    appointments.id, 
    appointments.appointment_date, 
    appointments.appointment_time, 
    appointments.status, 
    appointments.payment_status, 
    doctors.name AS doctor_name, 
    doctors.speciality AS doctor_speciality,
    doctors.image AS doctor_image,
    doctors.address_line1,
    doctors.address_line2
    FROM appointments
    JOIN doctors ON appointments.doctor_id = doctors.id
    WHERE appointments.user_id = ?;`,
    [userId],
    (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ message: "No appointments found" });
      }

      res.status(200).json(data);
    }
  );
});

// Fetch all doctors
app.get("/doctors/list", (req, res) => {
  db.all("SELECT * FROM doctors", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No doctors found" });
    }

    res.status(200).json(data);
  });
});

app.get("/doctors/:code", (req, res) => {
  db.all(
    "SELECT * FROM doctors WHERE id = ?",
    [req.params.code.replace("doc")],
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ message: "No doctors found" });
      }

      res.status(200).json(data);
    }
  );
});

app.post("/appointments/getDocBookedSlots", (req, res) => {
  const docId = req.body.docId;
  db.all(
    "SELECT slotNum FROM slotDetails WHERE doctorID = ?",
    [docId],
    (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error", error: err });
      } else {
        res.status(200).json(data);
      }
    }
  );
});

app.post("/appointments/book-appointment", isAuthenticated, (req, res) => {
  const { docID, slotNum } = req.body;
  console.log(docID, slotNum);
  const userId = req.userId;
  db.run(
    "INSERT INTO slotDetails (userID, doctorID, slotnum) VALUES (?, ?, ?);",
    [userId, docID, slotNum],
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Database error", error: err });
      } else {
        const allSlots = [
          "10:00 AM",
          "11:00 AM",
          "12:00 PM",
          "1:00 PM",
          "2:00 PM",
          "3:00 PM",
          "4:00 PM",
          "5:00 PM",
          "6:00 PM",
        ];
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        let tomorrowTimestamp = tomorrow
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        db.run(
          `INSERT INTO appointments (user_id, doctor_id, appointment_date, appointment_time, status, payment_status) 
VALUES (?, ?, ?, ?, 'Scheduled', 'Pending');`,
          [userId, docID, tomorrowTimestamp, allSlots[slotNum]]
        );
        res.status(200).send("Booked");
      }
    }
  );
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
