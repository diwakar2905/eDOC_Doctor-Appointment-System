# eDOC
he eDoc Doctor Appointment System is a modern, web-based platform designed to streamline appointment scheduling and enhance healthcare accessibility. Developed using HTML, CSS, and Node.js, the system offers a secure login mechanism powered by Google Cloud OAuth for seamless authentication and user safety.

1.1 Introduction:
The Edoc Doctor Appointment System is a modern, web-based platform designed to simplify appointment scheduling and enhance healthcare accessibility. Developed using HTML, CSS, and Node.js, this system provides secure login through Google Cloud's OAuth initiative, ensuring privacy and protection. With a user-friendly interface, the platform enables efficient doctor- patient management. Key features include a real-time chatbot for assistance, a database to store patient and appointment data, and a scheduling feature that allows users to view and book appointments based on their illness. The system categorizes doctors according to their specialties, making it easy for patients to
select the right medical professional for their needs.



2.1 Methodology:
The Edoc Doctor Appointment System follows an Agile Software Development methodology to ensure iterative development and flexibility for continuous improvement. The development process can be broken down into several stages:

1. Requirement Gathering: Identifying the needs of users (doctors and patients) and understanding the healthcare environment.
2. Design: Creating wireframes and flowcharts to design an intuitive user interface for both doctors and patients. Ensuring the system
integrates securely with Google Cloud for login authentication.
3. Development: Using modern web technologies such as HTML, CSS, and Node.js to build a secure, responsive, and user-friendly platform.
4. Testing: Conducting unit and integration tests to ensure the system works seamlessly and securely.
5. Deployment: Deploying the system to a secure cloud environment, ensuring high availability and performance.
6. Maintenance & Updates: Continuously monitoring the system for bugs, security threats, and adding new features based on user feedback





2.2 Software Architectural Design
The system is built with a multi-tier architecture, ensuring a clear separation of concerns and scalability:

1. Presentation Layer (Frontend):
a) Built using HTML and CSS to provide a user-friendly interface.
b) ReactJS or Vue.js could be added for a dynamic, responsive experience.
c) Displays the appointment calendar, booking options, and the chatbot interface.

2. Application Layer (Backend):
a) Built using Node.js with Express for handling HTTP requests and managing sessions.
b) RESTful API design to interact between the frontend and the database.
c) Integration with Google Cloud OAuth for secure login and authentication.

3. Database Layer:
a) A Relational Database (e.g., MySQL, PostgreSQL) stores patient and doctor data, appointment schedules, and medical histories.
b) The system should use SQL queries to fetch, insert, update, or delete data based on user actions.
c) MongoDB could be considered for more flexibility with unstructured data.

4. Real-Time Layer:
a) A chatbot powered by AI/ML models that can help patients with appointment bookings, FAQs, and other queries.
b) Socket.io or similar technology can be used to facilitate real- time communication.

5. Security Layer:
a) User authentication via Google Cloud OAuth for secure login.
b) SSL/TLS encryption to protect data during transmission.
c) Role-based access control (RBAC) to ensure that only authorized users (doctors, admin, patients) can access sensitive data.

6. Deployment:
a) Hosted on a cloud platform (e.g., AWS, Google Cloud) to ensure scalability and availability.
b) CI/CD pipelines for continuous deployment and updates.
