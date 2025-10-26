Kelp CSV Challenge

This project is a high-performance Node.js application built to solve the Kelp CSV challenge. It features a robust, stream-based ETL (Extract, Transform, Load) pipeline that can efficiently process massive CSV files (50,000+ rows), parse complex nested JSON from dot.notation headers, and load the data into a PostgreSQL database, all triggered by a single API call.

Built With

📁 Project Structure

The application is structured using a clean, separation-of-concerns (SoC) pattern to make it scalable, maintainable, and easy to test.

/KELP_ASSIGNMENT
├── .git
├── .gitignore
├── .env                 # Stores secrets (DB_URL) and config (CSV_PATH)
├── package.json
├── README.md            # You are here!
├── Dockerfile           # Defines the Node.js app container
├── docker-compose.yml   # Orchestrates the app and db services
|
├── db/
│   └── init.sql         # Automated DB table creation script
|
└── src/
    ├── app.js           # Express app setup (middleware, routes)
    ├── server.js        # Entry point (connects to DB, starts server)
    |
    ├── config/
    │   └── index.js     # Loads and validates environment variables
    |
    ├── controllers/
    │   └── uploadController.js # Handles API request/response logic
    |
    ├── routes/
    │   └── index.js     # Defines the API endpoints (e.g., POST /api/upload)
    |
    ├── services/
    │   ├── databaseService.js  # Manages the Postgres connection pool
    │   ├── reportService.js    # Logic to query DB and generate age report
    │   └── uploadService.js    # Core ETL logic (streaming, parsing, batching)
    |
    ├── utils/
    │   └── parserLogic.js      # The custom CSV-to-JSON parsing magic
    |
    └── data/
        └── data.csv         # The source CSV file



Key Features

This isn't just a simple script. It's a production-ready microservice designed for performance and scalability.

⚡ High-Performance Streaming: Reads CSVs line-by-line using Node.js streams. It never loads the entire file into memory, resulting in a tiny, stable memory footprint even with 50,000+ rows.

📦 Efficient Batch Inserts: To avoid overwhelming the database with 50,000 individual queries, data is pre-processed and inserted in efficient batches of 1,000 rows.

🤖 "Infinite Depth" JSON Parser: The core challenge! A custom-built recursive parser (deepSet) that cleverly handles dot.notation headers (e.g., user.profile.settings.email) and transforms them into deeply nested JSON objects.

🔥 "Fire-and-Forget" API: The POST /api/upload endpoint is asynchronous. It immediately returns a 202 Accepted response to let the client know the job has started, while the heavy lifting continues in the background.

📊 Automated Reporting: After a successful import, the app automatically runs a single, efficient SQL query to calculate the age distribution and prints the formatted report to the console.

🐳 Fully Dockerized: The entire application (Node.js app + Postgres database) is containerized and managed with a single docker-compose.yml for a one-command setup.

🤔 Why Docker? 

This project is fully containerized to demonstrate a professional, production-grade workflow that solves the "it works on my machine" problem. Using a single docker-compose up command, any developer can launch the entire application (Node.js app + Postgres DB) in a consistent environment without needing to manually install or configure a local database. The Docker setup even automates table creation by running the db/init.sql script on first launch, showcasing a deep understanding of DevOps principles and building reliable, shippable software.

💡 Design Choices & Future Roadmap

This project was built with production readiness in mind. Here are some of the key decisions and potential next steps.

Database Migrations: init.sql vs. a Library

For this project, I chose to use a simple db/init.sql script. This method integrates perfectly with the official Postgres Docker image, which automatically runs any .sql scripts placed in the /docker-entrypoint-initdb.d directory on its first launch. This provides a clean, zero-step setup for a new environment.

Alternative (The "Evolving" App):
If this were a real-world application where the database schema was expected to change (e.g., adding a new column), I would implement a full migration library like node-pg-migrate. These tools provide robust, version-controlled up and down migration files, which are essential for managing an evolving schema in a team environment.

✅ Future Roadmap

This solution is a strong foundation. Here are the next steps I would take to make it even more robust:

$$$$

 Add Unit Tests (High Priority):

Test src/utils/parserLogic.js to validate the deepSet and mapToDbRow functions.

Mock databaseService.js and test the reportService.js calculations.

Test the uploadController.js to ensure it returns 202 and calls the service.

$$$$

 Enhance CSV Parsing:

The current line.split(',') parser is simple (as per the "simplistic route" goal). I would upgrade this to use a battle-tested library like csv-parse to handle edge cases like commas inside quoted values (e.g., "123, Main St").

$$$$

🚀 Getting Started

You have two ways to get this project running. The Docker method is highly recommended for its simplicity and consistency.

1. The Easy Way (Docker) 🐳

This is the fastest and most reliable way to run the entire application. It automatically sets up the app, the database, and even creates the users table for you.

Prerequisites:

Docker installed and running.

Run it:

Clone this repository:

git clone [https://github.com/your-username/kelp-csv-challenge.git](https://github.com/your-username/kelp-csv-challenge.git)
cd kelp-csv-challenge


Build and run the containers:

docker-compose up --build


(You can add -d to run it in the background).

That's it! The app is now running on http://localhost:3000.

2. The Manual Way (Local Setup) 🛠️

If you prefer to run it on your local machine without Docker.

Prerequisites:

Node.js (v18 or later)

PostgreSQL (v15 or later) running locally.

Setup:

Clone the repo:

git clone [https://github.com/your-username/kelp-csv-challenge.git](https://github.com/your-username/kelp-csv-challenge.git)
cd kelp-csv-challenge


Install dependencies:

npm install


Set up your database:

Log in to psql and create the database:

CREATE DATABASE kelpassignment;


Connect to it (\c kelpassignment) and run the init script:

npm run db:init


(Note: You may need to configure the db:init script in package.json to match your local psql auth settings).

Set up environment variables:

Create a .env file in the root of the project.

Add your database URL and the path to the CSV file. It should look like this:

# Your local PostgreSQL connection string
# Replace with your actual username, password, and port
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kelpassignment"

# Path to the source CSV file
CSV_FILE_PATH="./src/data/data.csv"


Run the app:

npm start


🎮 How to Use

Once the app is running (using either method), trigger the CSV import by sending a POST request.

You can use any API tool like Postman, or just run this command in your terminal:

curl -X POST http://localhost:3000/api/upload


Response:
You'll instantly get this response back:

{
  "message": "CSV processing started. Check server logs for progress and completion report."
}


Now, check the terminal where your app (or Docker) is running. You'll see the logs for batch inserts, and finally, the age distribution report!

...
app-1  | Successfully inserted batch of 1000 rows.
app-1  | Successfully inserted batch of 1000 rows.
app-1  | File reading finished.
app-1  | All data uploaded. Generating age report...
app-1  | Calculating age distribution...
app-1  |
app-1  | --- Age Distribution Report ---
app-1  | "Age-Group","% Distribution"
app-1  | "< 20","4"
app-1  | "20 to 40","41"
app-1  | "40 to 60","36"
app-1  | "> 60","19"
app-1  | -------------------------------
...
