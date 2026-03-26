# Carrusel Studio Local para Figma

Plugin local y gratis para crear slides editables en Figma a partir del prompt que procesa este proyecto.

## Instalar

1. Abrí Figma Desktop.
2. Andá a `Plugins > Development > Import plugin from manifest...`.
3. Elegí este archivo:

`/Users/jota/carrusel-studio/figma-plugin/manifest.json`

## Usar

1. Levantá el proyecto:

```bash
npm start
```

2. En Figma, abrí el plugin `Carrusel Studio Local`.
3. Escribí el prompt y hacé clic en `Crear en Figma`.
4. El plugin va a crear los frames directamente en la página actual.

## Nota

El `serverUrl` por defecto es `http://localhost:3005`.
