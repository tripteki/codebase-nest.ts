<h1 align="center">Codebase NestJS</h1>

This skeleton provides comprehensive backend implementation built with NestJS framework, applying concepts like `Test Driven Development` `Event-Listener Driven Development` `Queue Processing` `WebSocket Real-time` `Scheduled Tasks` `Cached`, implementing design principles like `RESTful API` `GraphQL` `Tight Cohesion & Loose Coupling` `SOLID` `Dependency Injection`, and design patterns like `Gangs of Four (GoF) Repository Pattern` `Data Transfer Object (DTO)` `Middleware Pattern` `Observer Pattern`.

### Features

<table style="width: 100%; border: none;">
  <tr>
    <th>No</th>
    <th>Feature</th>
    <th>Description</th>
    <th>Technology</th>
  </tr>
  <tr>
    <td>1</td>
    <td>REST API</td>
    <td>Comprehensive RESTful API with OpenAPI/Swagger documentation</td>
    <td>NestJS + Swagger</td>
  </tr>
  <tr>
    <td>2</td>
    <td>GraphQL API</td>
    <td>Modern GraphQL API with Apollo Server integration</td>
    <td>Apollo Server + GraphQL</td>
  </tr>
  <tr>
    <td>3</td>
    <td>Authentication</td>
    <td>JWT-based authentication with access/refresh token mechanism</td>
    <td>JWT + Passport</td>
  </tr>
  <tr>
    <td>4</td>
    <td>WebSocket</td>
    <td>Real-time bidirectional event-based communication</td>
    <td>Socket.IO</td>
  </tr>
  <tr>
    <td>5</td>
    <td>Queue Processing</td>
    <td>Asynchronous job processing with Redis-backed queue system</td>
    <td>Bull + Redis</td>
  </tr>
  <tr>
    <td>6</td>
    <td>Scheduled Tasks</td>
    <td>Cron-based task scheduling for periodic operations</td>
    <td>@nestjs/schedule</td>
  </tr>
  <tr>
    <td>7</td>
    <td>Database</td>
    <td>Multi-database support with type-safe ORM</td>
    <td>Prisma + PostgreSQL + MongoDB</td>
  </tr>
  <tr>
    <td>8</td>
    <td>Caching</td>
    <td>Redis-based caching for improved performance</td>
    <td>Redis + cache-manager</td>
  </tr>
  <tr>
    <td>9</td>
    <td>Import/Export</td>
    <td>Bulk user data import/export with CSV/Excel support</td>
    <td>XLSX + Queue</td>
  </tr>
  <tr>
    <td>10</td>
    <td>Email Service</td>
    <td>Transactional email notifications with template support</td>
    <td>Nodemailer + Handlebars</td>
  </tr>
  <tr>
    <td>11</td>
    <td>Internationalization</td>
    <td>Multi-language support with i18n</td>
    <td>nestjs-i18n</td>
  </tr>
  <tr>
    <td>12</td>
    <td>Rate Limiting</td>
    <td>API rate limiting and throttling for security</td>
    <td>@nestjs/throttler</td>
  </tr>
  <tr>
    <td>13</td>
    <td>Testing</td>
    <td>End-to-end testing with comprehensive test coverage</td>
    <td>Jest + Supertest</td>
  </tr>
</table>

Getting Started
---

### Requirements

Ensure you have the following installed:

- Node.js >= 20.15.0
- PostgreSQL >= 14.x
- MongoDB >= 6.x
- Redis >= 7.x

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd codebase-nest.ts

# Install dependencies
npm install

# Generate Prisma clients
npm run prisma
```

### Configuration

Copy the environment configuration file and update with your credentials:

```bash
cp .env.example .env
```

Run database migrations:

```bash
# PostgreSQL migration
npm run postgre:migrate

# MongoDB push schema
npm run mongo:migrate
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

The server will start at `http://localhost:8000` with the following features enabled:

- Hot-reload on file changes
- Debug mode enabled
- Detailed logging

#### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run prod
```

### API Documentation

#### Swagger UI (REST API)

Access the interactive API documentation at:

```
http://localhost:8000/api/docs
```

#### GraphQL Playground

Access the GraphQL API interface at:

```
http://localhost:8000/graphql
```

Example query:

```graphql
query {
  me {
    id
    email
    name
  }
}

query {
  version
}
```

Example mutation:

```graphql
mutation {
  login(email: "user@example.com", password: "password") {
    accessToken
    refreshToken
  }
}
```

### WebSocket Setup

This application provides real-time notifications for import/export operations using Socket.IO.

#### Available Events

- `v1.user.admin.imported` - User import completed successfully
- `v1.user.admin.imported-failed` - User import failed
- `v1.user.admin.exported` - User export completed successfully
- `v1.user.admin.exported-failed` - User export failed

#### Client Connection Example

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8000', {
    transports: ['websocket', 'polling'],
    extraHeaders: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
});

socket.on('v1.user.admin.imported', (data) => {
    console.log('Import completed:', data.totalImported, 'users');
});

socket.on('v1.user.admin.exported', (data) => {
    console.log('Export ready:', data.fileUrl);
});
```

#### Testing WebSocket

Use the provided HTML client for testing:

```bash
open examples/websocket-import-export-client.html
```

### Testing

Run the end-to-end test suite:

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:e2e

# Run in watch mode
npm run test -- --watch
```

### Available Scripts

<table style="width: 100%; border: none;">
  <tr>
    <th>Script</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>npm run dev</code></td>
    <td>Start development server with hot-reload</td>
  </tr>
  <tr>
    <td><code>npm run prod</code></td>
    <td>Start production server</td>
  </tr>
  <tr>
    <td><code>npm run build</code></td>
    <td>Build application for production</td>
  </tr>
  <tr>
    <td><code>npm test</code></td>
    <td>Run end-to-end tests</td>
  </tr>
  <tr>
    <td><code>npm run lint</code></td>
    <td>Lint and format code</td>
  </tr>
  <tr>
    <td><code>npm run prisma</code></td>
    <td>Generate Prisma clients for PostgreSQL and MongoDB</td>
  </tr>
  <tr>
    <td><code>npm run postgre:migrate</code></td>
    <td>Run PostgreSQL database migrations</td>
  </tr>
  <tr>
    <td><code>npm run mongo:migrate</code></td>
    <td>Push MongoDB schema changes</td>
  </tr>
  <tr>
    <td><code>npm run doc</code></td>
    <td>Generate code documentation with Compodoc</td>
  </tr>
</table>

Author
---

- Trip Teknologi ([@tripteki](https://linkedin.com/company/tripteki))
- Hasby Maulana ([@hsbmaulana](https://linkedin.com/in/hsbmaulana))
