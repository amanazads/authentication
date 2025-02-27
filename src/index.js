const express = require("express");
const Collection = require("./db"); // Import the Collection model correctly
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const publicPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates");

app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.static(publicPath));

// Secret Key for JWT
const SECRET_KEY = "CreativeandversatileBackendDeveloperskilledinNode.js,Express.js,andMongoDB.Founder&CEOofHeartBeatMusicandCoFounderofYATUventures.Apassionatemusicianandentrepreneur,balancingtech,business,andmusicwithstrongleadershipandmultitaskingabilities";

// Hash password function
async function hashPass(password) {
    return await bcrypt.hash(password, 10);
}

// Compare password function
async function comparePass(userPass, hashedPass) {
    return await bcrypt.compare(userPass, hashedPass);
}

// Home Route - Check if user is logged in
app.get("/", (req, res) => {
    if (req.cookies.jwt) {
        try {
            const verify = jwt.verify(req.cookies.jwt, SECRET_KEY);
            res.render("home", { name: verify.name });
        } catch (err) {
            res.clearCookie("jwt"); // Clear invalid token
            res.render("login");
        }
    } else {
        res.render("login");
    }
});

// Signup Route
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const { name, password } = req.body;

        // Check if user already exists
        const existingUser = await Collection.findOne({ name });
        if (existingUser) {
            return res.send("User already exists");
        }

        // Hash password correctly
        const hashedPassword = await hashPass(password);

        // Generate JWT token
        const token = jwt.sign({ name }, SECRET_KEY, { expiresIn: "1h" });

        // Save user to the database
        const data = new Collection({
            name,
            password: hashedPassword,
            token
        });

        await data.save();

        // Set cookie
        res.cookie("jwt", token, {
            maxAge: 600000,
            httpOnly: true
        });

        res.render("home", { name }); // Redirect to home with user name
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).send("Something went wrong");
    }
});

// Login Route
app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;

        // Check if user exists
        const user = await Collection.findOne({ name });
        if (!user) {
            return res.send("User does not exist");
        }

        // Compare password
        const isMatch = await comparePass(password, user.password);
        if (!isMatch) {
            return res.send("Invalid credentials");
        }

        // Generate JWT token
        const token = jwt.sign({ name }, SECRET_KEY, { expiresIn: "1h" });

        // Update user's token in the database
        await Collection.updateOne({ name }, { $set: { token } });

        // Set cookie
        res.cookie("jwt", token, {
            maxAge: 600000,
            httpOnly: true
        });

        res.render("home", { name }); // Redirect to home with user name
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Something went wrong");
    }
});

// Start Server
app.listen(3000, () => {
    console.log("Listening on port 3000");
});
