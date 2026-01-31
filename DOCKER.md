# Docker Setup for EchoMem

This guide explains how to build and run EchoMem using Docker.

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 1.29+)

## Quick Start with Docker Compose

The easiest way to run EchoMem is with Docker Compose:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

To stop the container:

```bash
docker-compose down
```

## Building the Docker Image

To manually build the Docker image:

```bash
docker build -t echomem:latest .
```

## Running the Container

Run the built image:

```bash
docker run -p 3000:3000 echomem:latest
```

### Docker Run Options

- `-p 3000:3000` - Map port 3000
- `-e NODE_ENV=production` - Set production environment
- `--name echomem-app` - Container name
- `-d` - Run in detached mode (background)

Example with options:

```bash
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  --name echomem-app \
  echomem:latest
```

## Container Details

### Base Image
- **Build Stage**: `node:20-alpine` (lightweight Node.js)
- **Runtime Stage**: `node:20-alpine` + serve

### Health Check
The container includes a health check that:
- Runs every 30 seconds
- Times out after 3 seconds
- Requires 3 consecutive failures to mark as unhealthy
- Waits 5 seconds after start before first check

Check health status:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimization:

1. **Builder Stage**: Compiles the SvelteKit app to static files
2. **Runtime Stage**: Serves only the compiled static files (smaller image)

## Image Size

- Builder image: ~400MB
- Final image: ~300MB

## Network Access

The container exposes port 3000. To access from different machines:

```bash
# From the host machine
http://localhost:3000

# From another container
http://echomem-app:3000

# From another machine on the network
http://<docker-host-ip>:3000
```

## Environment Variables

Currently, no environment variables are required. The app uses IndexedDB for storage, which works in the browser.

To add more in the future:

```bash
docker run -e VAR_NAME=value echomem:latest
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
docker run -p 8080:3000 echomem:latest
# Then access at http://localhost:8080
```

### View Container Logs

```bash
docker logs echomem-app
docker logs -f echomem-app  # Follow logs in real-time
```

### Access Container Shell

```bash
docker exec -it echomem-app sh
```

### Health Check Failed

Check the logs:

```bash
docker logs echomem-app
```

The health check uses an HTTP GET request to port 3000. Ensure the server is responding.

## Data Persistence

EchoMem uses IndexedDB (browser-based storage), so data persists in the browser. The application is stateless:

- No persistent volumes needed
- Data syncs via browser IndexedDB
- Container can be stopped/started without data loss

## Production Considerations

### Using a Reverse Proxy

For production, use a reverse proxy like nginx:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - echomem

  echomem:
    build: .
    expose:
      - "3000"
    restart: unless-stopped
```

### HTTPS

Use a reverse proxy with Let's Encrypt for HTTPS support.

### Resource Limits

Limit container resources:

```bash
docker run -p 3000:3000 \
  -m 512m \
  --cpus="0.5" \
  echomem:latest
```

This limits to 512MB RAM and 0.5 CPU cores.

## Deployment

### Docker Hub

To push to Docker Hub:

```bash
docker build -t yourusername/echomem:latest .
docker push yourusername/echomem:latest
```

### Pull and Run from Docker Hub

```bash
docker run -p 3000:3000 yourusername/echomem:latest
```

## Development with Docker

For development, you might prefer running locally:

```bash
npm install
npm run dev
```

However, for testing the production build:

```bash
docker build -t echomem:dev .
docker run -p 3000:3000 echomem:dev
```

## Security Notes

- The Dockerfile uses Node.js Alpine images for minimal attack surface
- No sensitive data is stored in the image
- The serve package is lightweight and well-maintained
- Always scan images for vulnerabilities: `docker scan echomem:latest`

## Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Node.js in Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Serve Package](https://github.com/vercel/serve)
