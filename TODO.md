install these package in backend

npm install next@latest react@latest react-dom@latest




{
  "name": "chatify-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "install:all": "npm --prefix frontend install && npm --prefix backend install",
    "clean:frontend": "npm --prefix frontend run clean",
    "clean:backend": "npm --prefix backend run clean",
    "clean": "npm run clean:frontend && npm run clean:backend",
    "build:frontend": "npm --prefix frontend run build",
    "build:backend": "npm --prefix backend run build",
    "build": "npm run clean && npm run build:frontend && npm run build:backend && node copy-frontend.js",
    "start": "node backend/dist/app.js",
    "vercel:build": "npm run install:all && npm run build"
  },
  "devDependencies": {
    "rimraf": "^6.0.1"
  }
}
