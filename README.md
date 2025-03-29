Compliance-Tracker

🚀 Overview

Compliance-Tracker is a full-stack web application designed to track compliance-related tasks, documents, and audits efficiently. The app consists of:

Frontend: React (hosted on AWS S3 + CloudFront)

Backend: Node.js + Express (hosted on AWS Elastic Beanstalk)

Database: DynamoDB (NoSQL) or AWS RDS (PostgreSQL/MySQL)

CI/CD: GitHub Actions for automatic deployment


📂 Project Structure

/compliance-tracker
 ├── /frontend (React app)
 │     ├── src/
 │     ├── public/
 │     ├── package.json
 │     ├── build/  (Generated after `npm run build`)
 ├── /backend (Node.js API)
 │     ├── routes/
 │     ├── models/
 │     ├── controllers/
 │     ├── package.json
 │     ├── server.js
 ├── .github/workflows/ (CI/CD Pipelines)
 ├── README.md
 ├── .gitignore
 ├── Procfile (For Elastic Beanstalk)

🔧 Setup & Installation

1️⃣ Clone the repository

git clone https://github.com/your-username/compliance-tracker.git
cd compliance-tracker

2️⃣ Setup Frontend (React)

cd frontend
npm install
npm start  # Runs on http://localhost:3000

3️⃣ Setup Backend (Node.js)

cd backend
npm install
npm start  # Runs on http://localhost:5000

4️⃣ Environment Variables (.env)

Create a .env file in /backend and /frontend with:

# Backend
PORT=5000
DATABASE_URL=your-database-url
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

🚀 Deployment (AWS)

Frontend (S3 + CloudFront)

aws s3 sync frontend/build/ s3://compliance-tracker-frontend/ --acl public-read
aws cloudfront create-invalidation --distribution-id XYZ123 --paths "/*"

Backend (Elastic Beanstalk)

cd backend
eb init -p node.js compliance-tracker-backend
eb create compliance-tracker-env --instance_type t3.micro
eb deploy

🔄 CI/CD (GitHub Actions)

Automatic Deployments

The app is set up with GitHub Actions to auto-deploy on push to main:

Frontend → Deploys to S3 + CloudFront

Backend → Deploys to Elastic Beanstalk

To trigger deployment, simply push to main:

git add .
git commit -m "Update feature"
git push origin main

🛠 Tech Stack

Component

Technology

Frontend

React, Vite

Backend

Node.js, Express

Database

AWS DynamoDB / RDS

Hosting (FE)

AWS S3 + CloudFront

Hosting (BE)

AWS Elastic Beanstalk

CI/CD

GitHub Actions

📝 Contributing

Want to contribute? Follow these steps:

Fork the repo

Create a new branch (feature-branch)

Make your changes & commit (git commit -m "New feature")

Push changes (git push origin feature-branch)

Open a pull request

📜 License

This project is licensed under the MIT License.

📩 Contact

For questions or suggestions, reach out at: matthewk1058@gmail.com
