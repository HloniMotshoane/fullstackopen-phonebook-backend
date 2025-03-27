const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });

app.get('/api/persons', async (req, res, next) => {
    try {
        const persons = await Person.find({});
        res.json(persons);
    } catch (error) {
        next(error);
    }
});

app.get('/api/persons/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const person = await Person.findById(id);
        if (person) {
            res.json(person);
        } else {
            res.status(404).json({ error: 'Person not found' });
        }
    } catch (error) {
        next(error);
    }
});

app.post('/api/persons', async (req, res, next) => {
    const { name, number } = req.body;

    try {
        let person = await Person.findOne({ name });

        if (person) {
            person.number = number;
            await person.save();
            return res.status(200).json(person);
        } else {
            const newPerson = new Person({
                name,
                number,
            });

            const savedPerson = await newPerson.save();
            res.status(201).json(savedPerson);
        }
    } catch (error) {
        next(error);
    }
});

app.delete('/api/persons/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Person.findByIdAndRemove(id);
        if (result) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Person not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Invalid ID format' });
    }
});

app.get('/info', async (req, res) => {
    try {
        const count = await Person.countDocuments();
        res.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`);
    } catch (error) {
        res.status(500).json({ error: 'Unable to retrieve data' });
    }
});

const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformed id' });
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }

    next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
