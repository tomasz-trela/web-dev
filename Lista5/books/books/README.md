# Books Library API

This project is a simple Java Spring Boot application for managing books, authors, and rentals.

## API Documentation

Interactive API documentation and testing is available via Swagger UI:

- [Swagger UI](http://localhost:8080/swagger-ui/index.html)
- OpenAPI v3 JSON: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

You can use these endpoints to explore and test the API directly from your browser.

## Prerequisites
- Java 21 (Oracle JDK 21 or compatible)
- Maven 3.6+

## How to Run

1. **Clone the repository** (if not already):
   ```
   git clone <your-repo-url>
   cd books
   ```

2. **Build the project with Maven:**
   ```
   ./mvnw clean package
   ```
   Or on Windows:
   ```
   mvnw.cmd clean package
   ```

3. **Run the application:**
   ```
   ./mvnw spring-boot:run
   ```
   Or on Windows:
   ```
   mvnw.cmd spring-boot:run
   ```
   Alternatively, you can run the generated JAR file:
   ```
   java -jar target/books-0.0.1-SNAPSHOT.jar
   ```

4. **Access the API:**
   - The application will start on [http://localhost:8080](http://localhost:8080) by default.
   - Use tools like Postman or your browser to interact with the endpoints (see your controller classes for available routes).

## Project Structure
- `src/main/java/pl/edu/pwr/ztw/books/` — Main source code (controllers, services, models)
- `src/main/resources/` — Application configuration and static resources
- `src/test/java/pl/edu/pwr/ztw/books/` — Unit tests

## Useful Commands
- Run tests:
  ```
  ./mvnw test
  ```
- Clean build:
  ```
  ./mvnw clean
  ```

## Notes
- Make sure your JAVA_HOME environment variable points to JDK 21.
- If you encounter port conflicts, change the port in `src/main/resources/application.properties`.

---
Feel free to extend this README with API documentation or usage examples as needed.
