# Cloud-Based-Smart-File-Storage-Sharing-System

## Smart Drive – Cloud File Storage & Sharing System Project

## A secure and scalable cloud-based file storage and sharing system built using AWS services.
## This project was developed as part of the Elevate Lab Cloud Computing Internship – 2025 (Remote, Bangalore).

# Features

### Secure user authentication using JWT

### File upload to AWS S3

### Automatic generation of shareable links

### File download support using pre-signed URLs

### File delete functionality

### Metadata storage in DynamoDB

### Frontend hosted using CloudFront (HTTPS)

### Backend deployed on EC2 with Flask

### IAM role-based access control for secure AWS operations

### Fast and scalable cloud architecture

# Tech Stack Frontend

### HTML

### CSS

### JavaScript

Backend

### Python Flask

### JWT Authentication

### Boto3 AWS SDK

AWS Services

### EC2 – backend hosting

### S3 – file storage and static hosting

### DynamoDB – NoSQL database for metadata

### API Gateway – secure API routing with HTTPS

### CloudFront – global CDN distribution

### IAM – role-based access for EC2 to S3 and DynamoDB

## Architecture User 
        ↓
## CloudFront (Frontend Hosting - HTTPS)
        ↓
## S3 (Static Website)
        ↓
## API Gateway (API Routing - HTTPS)
        ↓
## EC2 (Flask Backend)
        ↓
## DynamoDB (User & File Metadata)
        ↓
## S3 (File Storage)


# Setup Instructions
## 1. Clone the repository
git clone https://github.com/Aishwarya-k1155/Cloud-Based-Smart-File-Storage-Sharing-System

## 2. Install backend dependencies
cd backend
pip install -r requirements.txt

## 3. Run the backend
python3 app.py

## 4. Open the frontend

## You can either open index.html locally or host it on AWS S3 and CloudFront.

# Live Project Links

## Frontend (CloudFront – HTTPS):
https://d3dltsp1h13o1v.cloudfront.net

## S3 Static Website (Optional – HTTP Only):
http://smart-drive-files-aishwarya.s3-website.ap-south-1.amazonaws.com

## Backend API (API Gateway – HTTPS):
https://c2bnbljfi9.execute-api.ap-south-1.amazonaws.com

# Project Structure
smart-drive-cloud-app/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
│
├── architecture/
│   └── architecture-diagram.png
│
├── docs/
│   ├── Project_Report.pdf
│   ├── Smart_Drive_PPT.pptx
│
└── README.md

# Learning Outcomes

### Deploying Flask backend on EC2

### Implementing IAM role-based permissions

### Integrating S3 buckets with pre-signed URLs

### Using DynamoDB for storing metadata

### Configuring API Gateway with CORS

### Hosting a frontend using CloudFront CDN

### Designing a secure and scalable cloud architecture

### Building a full-stack cloud application

# Author

## Aishwarya Kopulwar
## Cloud & DevOps Engineer | AWS | Linux | DevOps

## LinkedIn: https://www.linkedin.com/in/aishwarya-kopulwar-b7701a235
## Email: kopulwaraishwarya88@gmail.com
