const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const carruselRoutes = require('./routes/carrusel');

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use(express.static(path.join(__dirname, 'public'), { index: false, redirect: false }));
app.use('/api/carrusel', carruselRoutes);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    ok: false,
    message: error.message || 'Error interno'
  });
});

module.exports = app;
