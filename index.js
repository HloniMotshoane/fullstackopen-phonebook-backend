require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./mongo");
const Person = require("./models/person");


const app = express();
app.use(express.json());
app.use(cors());

morgan.token("body", (req) => {
    if (req.method === "POST") {
        return JSON.stringify(req.body);
    }
    return "";
});
app.use(morgan(":method :url :status :response-time ms - :body"));

connectDB();

app.get("/api/persons", async (req, res) => {
    try {
        const persons = await Person.find({});
        res.json(persons);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch persons" });
    }
});


app.get("/info", async (req, res) => {
    try {
        const count = await Person.countDocuments({});
        res.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch info" });
    }
});


app.get("/api/persons/:id", async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        if (person) {
            res.json(person);
        } else {
            res.status(404).json({ error: "Person not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch person" });
    }
});


app.delete('/api/persons/:id', async (request, response) => {
    try {
        await Person.findByIdAndRemove(request.params.id);
        response.status(204).end();
    } catch (error) {
        response.status(500).json({ error: "Failed to delete person" });
    }
});


app.post("/api/persons", async (req, res) => {
    const { name, number } = req.body;

    if (!name || !number) {
        return res.status(400).json({ error: "Name or number is missing" });
    }

    try {
        const existingPerson = await Person.findOne({ name });
        if (existingPerson) {
            return res.status(400).json({ error: "Name must be unique" });
        }

        const newPerson = new Person({
            name,
            number,
        });

        const savedPerson = await newPerson.save();
        res.status(201).json(savedPerson);
    } catch (error) {
        res.status(500).json({ error: "Failed to save person" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
