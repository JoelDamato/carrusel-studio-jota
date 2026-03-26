const app = require('./app');

const DEFAULT_PORT = 3005;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;

const server = app.listen(PORT, () => {
  console.log(`Carrusel Studio corriendo en el puerto ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Probá con otro, por ejemplo: PORT=3010 npm start`);
    process.exit(1);
  }

  throw error;
});
