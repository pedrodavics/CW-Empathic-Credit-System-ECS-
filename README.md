# Empathetic Credit System (ECS)

### This project implements an Empathetic Credit System that uses emotional and financial data to calculate personalized credit limits for users. The system processes real-time emotional data via Kafka, stores user profiles and transactions in a PostgreSQL database, and integrates a machine learning model to assess credit risk.

![ECS Diagram](docs/ECS%20diagram.png)

## Features
- **Kafka Consumer:** Processes users' emotional and thought data in real time.
- **Database:** Stores user profiles, transaction history, credit limits, and aggregated emotional data.
- **Machine Learning Integration:** Simulates a pre-trained model to calculate credit risk.
- **API:** Endpoints to update users' credit limits and notify them.

## Technologies Used:
- **Node.js:** Backend for the application.
- **Express.js:** API framework.
- **Kafka:** For real-time data streaming.
- **PostgreSQL:** Relational database for storing user profiles and transaction history.
- **Docker:** Simplifies environment setup.
- **Jest:** Unit testing framework.

## Installation and Setup
Before running this project, make sure you have the following installed:

- Node.js v20.16.0 or higher
- npm version 10.8.2 or higher

### Follow these steps to set up and run the project:
> 1. Clone the repository:
```bash
git clone https://github.com/pedrodavics/CW-Empathic-Credit-System-ECS-.git
cd CW-Empathic-Credit-System-ECS-
cd empathic-credit-system
 ```   
> 2. Configure the environment variables:
- Navigate to the **backend** folder:
```bash
cd Backend
```  
- Create a **.env** file:
```bash
touch .env
```
- Open the .env file and add the following environment variables:
```bash
DDB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
KAFKA_BROKER=kafka:9092
```   
> 3. Start the Docker containers:
```bash
docker-compose up
```  
> 4. Run the project locally:
```bash
npm install
npm start
``` 
> 5. To run the tests:
```bash
npm test
``` 
## How It Works
### Kafka Consumer
The Kafka consumer listens to a stream of users' emotional data, processes it, and sends it to the database.

### Database
PostgreSQL stores user profiles, including aggregated emotional data, transaction history, and credit limits.

### Machine Learning
We simulate a pre-trained model that accepts emotional and financial data as input and returns a random credit risk score. This score is used in the credit limit calculation.

### Endpoints
POST /api/credit-limit: Updates a user's credit limit based on the processed data.