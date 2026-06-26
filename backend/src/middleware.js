'use strict';

// Tiny in-memory fixed-window rate limiter. No external dependency; good enough
// to blunt brute-force attempts against the auth endpoints on a single instance.
function rateLimit({ windowMs, max }) {
  const hits = new Map();

  return function rateLimiter(req, res, next) {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    let rec = hits.get(key);

    if (!rec || now > rec.reset) {
      rec = { count: 0, reset: now + windowMs };
    }
    rec.count += 1;
    hits.set(key, rec);

    if (rec.count > max) {
      const retry = Math.ceil((rec.reset - now) / 1000);
      res.set('Retry-After', String(retry));
      return res.status(429).json({ error: 'Too many requests. Slow down and try again shortly.' });
    }
    next();
  };
}

// Wrap an async route handler so rejected promises reach the error middleware.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Final error handler. Keeps internal details out of the response.
function errorHandler(err, req, res, _next) {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  // eslint-disable-next-line no-console
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
}

function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

module.exports = { rateLimit, asyncHandler, errorHandler, notFound };
