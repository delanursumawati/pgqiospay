/**
 * Custom Next.js Server
 * Listens on a Unix Domain Socket for devsock/Nginx integration
 *
 * Usage:
 *   node server.js
 *
 * Environment:
 *   SOCKET_PATH - Unix socket path (default: /tmp/nextjs-payment.sock)
 *   PORT        - Fallback TCP port if socket is not used (default: 3000)
 *   NODE_ENV    - Environment mode (production/development)
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const socketPath = process.env.SOCKET_PATH || "/tmp/nextjs-payment.sock";

// Determine if we should use Unix socket or TCP port
const useSocket = process.env.USE_SOCKET === "true" || process.env.SOCKET_PATH;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  if (useSocket) {
    // Remove existing socket file if it exists
    if (fs.existsSync(socketPath)) {
      fs.unlinkSync(socketPath);
    }

    // Ensure the socket directory exists
    const socketDir = path.dirname(socketPath);
    if (!fs.existsSync(socketDir)) {
      fs.mkdirSync(socketDir, { recursive: true });
    }

    server.listen(socketPath, () => {
      // Set socket permissions so Nginx can access it
      fs.chmodSync(socketPath, "0666");
      console.log(`> Server listening on unix socket: ${socketPath}`);
      console.log(`> Mode: ${dev ? "development" : "production"}`);
    });

    // Cleanup socket on exit
    const cleanup = () => {
      try {
        if (fs.existsSync(socketPath)) {
          fs.unlinkSync(socketPath);
        }
      } catch {
        // Ignore cleanup errors
      }
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } else {
    // Fallback: listen on TCP port
    server.listen(port, hostname, () => {
      console.log(`> Server listening on http://${hostname}:${port}`);
      console.log(`> Mode: ${dev ? "development" : "production"}`);
    });
  }
});
