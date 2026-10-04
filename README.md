# Cloud-Based Notes Sharing Hub

A simple full-stack college project for uploading, discovering, downloading and sharing study notes.

## Features
- Register and login
- Upload notes with subject/category
- Search and filter notes
- Download notes
- Favorites
- Delete your own notes
- Dashboard statistics
- Responsive light-blue interface

## Tech Stack
HTML, CSS, JavaScript, Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, Multer.

## Run locally
1. Install Node.js.
2. Open this project folder in a terminal.
3. Run `npm install`
4. Copy `.env.example` to `.env`.
5. Add your MongoDB Atlas connection string and a JWT secret.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## GitHub + Render
Upload the project to GitHub. On Render, create a Web Service connected to the repository.
Build Command: `npm install`
Start Command: `npm start`
Add environment variables `MONGODB_URI` and `JWT_SECRET`.

## Note
Uploaded files are stored in the local `uploads` folder for this college demo. On a production service, use persistent/object storage instead of ephemeral local disk.
