# Welcome to your Lovable project

## Local Development Security

For security reasons, the local development server is configured to bind to `127.0.0.1` (localhost) by default. This prevents the environment from being exposed to the local network.

### Enabling Public Access

If you explicitly need to expose the development server to your local network (e.g., for testing on mobile devices), you can do so by setting the `VITE_ALLOW_PUBLIC_HOST` environment variable to `true`.

```bash
VITE_ALLOW_PUBLIC_HOST=true npm run dev
```

When this variable is set to `true`, the server will listen on `0.0.0.0`, making it accessible to other devices on the same network. Use this option only when necessary and in controlled environments.
