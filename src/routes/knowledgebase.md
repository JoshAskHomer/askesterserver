# Knowledge Base API Documentation

The Knowledge Base API provides endpoints for file management, including uploading files, retrieving files, and initiating indexing of files. The API supports tenant-specific, user-specific, and team-specific file operations. Below is a detailed list of available API routes.

## Base URL
The base URL for accessing these endpoints is `/api/knowledge-base`.

---

### File Upload Endpoints

#### `POST /upload`
Uploads a file to the tenant-level container.

- **Request Parameters**: None
- **Request Body**: A file must be included in the form-data under the key `files`.
- **Response**: URL of the uploaded file.
- **Status Codes**:
  - `200 OK`: File uploaded successfully.
  - `400 Bad Request`: No file uploaded.
  - `500 Internal Server Error`: An error occurred during file upload.

#### `POST /user/:userid/upload`
Uploads a file to the container specific to the given user.

- **Path Parameters**:
  - `userid` (string): The ID of the user.
- **Request Body**: A file must be included in the form-data under the key `files`.
- **Response**: URL of the uploaded file.
- **Status Codes**:
  - `200 OK`: File uploaded successfully.
  - `400 Bad Request`: No file uploaded.
  - `500 Internal Server Error`: An error occurred during file upload.

#### `POST /team/:teamid/upload`
Uploads a file to the container specific to the given team.

- **Path Parameters**:
  - `teamid` (string): The ID of the team.
- **Request Body**: A file must be included in the form-data under the key `files`.
- **Response**: URL of the uploaded file.
- **Status Codes**:
  - `200 OK`: File uploaded successfully.
  - `400 Bad Request`: No file uploaded.
  - `500 Internal Server Error`: An error occurred during file upload.

---

### File Retrieval Endpoints

#### `GET /files`
Retrieves all files from the tenant-level container.

- **Request Parameters**: None
- **Response**: A list of files in the tenant container.
- **Status Codes**:
  - `200 OK`: Files retrieved successfully.
  - `500 Internal Server Error`: An error occurred during file retrieval.

#### `GET /user/:userid/files`
Retrieves all files from the container specific to the given user.

- **Path Parameters**:
  - `userid` (string): The ID of the user.
- **Response**: A list of files in the user container.
- **Status Codes**:
  - `200 OK`: Files retrieved successfully.
  - `500 Internal Server Error`: An error occurred during file retrieval.

#### `GET /team/:teamid/files`
Retrieves all files from the container specific to the given team.

- **Path Parameters**:
  - `teamid` (string): The ID of the team.
- **Response**: A list of files in the team container.
- **Status Codes**:
  - `200 OK`: Files retrieved successfully.
  - `500 Internal Server Error`: An error occurred during file retrieval.

#### `GET /file/:filename`
Retrieves a specific file from the tenant-level container.

- **Path Parameters**:
  - `filename` (string): The name of the file.
- **Response**: The requested file.
- **Status Codes**:
  - `200 OK`: File retrieved successfully.
  - `500 Internal Server Error`: An error occurred during file retrieval.

#### `GET /user/:userid/file/:filename`
Retrieves a specific file from the container specific to the given user.

- **Path Parameters**:
  - `userid` (string): The ID of the user.
  - `filename` (string): The name of the file.
- **Response**: The requested file.
- **Status Codes**:
  - `200 OK`: File retrieved successfully.
  - `500 Internal Server Error`: An error occurred during file retrieval.

#### `GET /team/:teamid/file/:filename`
Retrieves a specific file from the container specific to the given team.

- **Path Parameters**:
  - `teamid` (string): The ID of the team.
  - `filename` (string): The name of the file.
- **Response**: The requested file.
- **Status Codes**:
  - `200 OK`: File retrieved successfully.
  - `500 Internal Server Error`: An error occurred during file retrieval.

---

### File Indexing Endpoints

#### `POST /file/:filename/startindexing`
Starts the indexing process for a specific file in the tenant-level container.

- **Path Parameters**:
  - `filename` (string): The name of the file to be indexed.
- **Response**: A message indicating that indexing has started.
- **Status Codes**:
  - `202 Accepted`: Indexing started successfully.
  - `500 Internal Server Error`: An error occurred while starting the indexing process.

#### `POST /user/:userid/:filename/startindexing`
Starts the indexing process for a specific file in the container specific to the given user.

- **Path Parameters**:
  - `userid` (string): The ID of the user.
  - `filename` (string): The name of the file to be indexed.
- **Response**: A message indicating that indexing has started.
- **Status Codes**:
  - `202 Accepted`: Indexing started successfully.
  - `500 Internal Server Error`: An error occurred while starting the indexing process.

#### `POST /team/:teamid/:filename/startindexing`
Starts the indexing process for a specific file in the container specific to the given team.

- **Path Parameters**:
  - `teamid` (string): The ID of the team.
  - `filename` (string): The name of the file to be indexed.
- **Response**: A message indicating that indexing has started.
- **Status Codes**:
  - `202 Accepted`: Indexing started successfully.
  - `500 Internal Server Error`: An error occurred while starting the indexing process.

---

## Summary
This API allows for easy file management, including file uploads, retrieval, and indexing. Endpoints are provided for tenant, user, and team-level operations to ensure precise file management for different scopes within the application.

