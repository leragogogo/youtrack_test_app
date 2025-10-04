exports.httpHandler = {
  endpoints: [
    {
      // GET /backend/flag
      // Returns the current value of the global flag and its version
      method: 'GET',
      path: 'flag',
      handle: function handle(ctx) {
        try {
          ctx.response.json(readState(ctx));
        } catch {
          ctx.response.code = 500;
          ctx.response.json({ error: 'INTERNAL_ERROR', message: 'Failed to read flag' });
        }
      }
    },
    {
      // POST /backend/flag
      // Updates the global flag. Uses version-based conflict detection
      // (Last-Write-Wins)
      method: 'POST',
      path: 'flag',
      handle: function handle(ctx) {
        try {
          // Parse JSON safely
          let body;
          try {
            body = ctx.request.json();
          } catch {
            ctx.response.code = 400;
            ctx.response.json({ error: 'BAD_REQUEST', message: 'Body must be valid JSON' });
            return;
          }

          // Validate inputs
          if (!body || (typeof body.flag != "boolean")) {
            ctx.response.code = 400;
            ctx.response.json({ error: 'BAD_REQUEST', message: 'Flag must be a boolean' });
            return;
          }
          if (!Number.isFinite(body.version)) {
            ctx.response.code = 400;
            ctx.response.json({ error: 'BAD_REQUEST', message: 'version is required and must be a number' });
            return;
          }

          const current = readState(ctx);

          // If the version sent by the client does not match the
          // version currently stored, someone else has updated the flag
          // in the meantime. Return HTTP 412
          if (body.version !== current.version) {
            ctx.response.code = 412;
            ctx.response.json({
              error: 'STALE_VERSION',
              message: 'The flag was updated by someone else.',
              current
            });
            return;
          }

          // Accept write and increment the version 
          const next = {
            flag: body.flag,
            version: current.version + 1,
          };

          writeState(ctx, next);

          ctx.response.json(next);

        } catch {
          ctx.response.code = 500;
          ctx.response.json({ error: 'INTERNAL_ERROR', message: 'Failed to update flag' });
        }
      }
    }
  ]
};

// Reads current flag and version from app storage.
// If version is undefined, defaults to 0
function readState(ctx) {
  return {
    flag: ctx.globalStorage.extensionProperties.globalFlag,
    version: ctx.globalStorage.extensionProperties.globalFlagVersion ?? 0
  }
}

// Write new flag and version values to global storage
function writeState(ctx, next) {
  ctx.globalStorage.extensionProperties.globalFlag = next.flag;
  ctx.globalStorage.extensionProperties.globalFlagVersion = next.version;
}
