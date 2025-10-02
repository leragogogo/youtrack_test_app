exports.httpHandler = {
  endpoints: [
    {
      method: 'GET',
      path: 'flag',
      handle: function handle(ctx) {
        try {
          ctx.response.json({flag: ctx.globalStorage.extensionProperties.globalFlag});
        } catch{
          ctx.response.code = 500;
          ctx.response.json({ error: 'INTERNAL_ERROR', message: 'Failed to read flag' });
        }
      }
    },
    {
      method: 'POST',
      path: 'flag',
      handle: function handle(ctx) {
        try {
          // Parse JSON safely
          let body;
          try {
            body = ctx.request.json();
          } catch{
            ctx.response.code = 400;
            ctx.response.json({ error: 'BAD_REQUEST', message: 'Body must be valid JSON' });
            return;
          }

          // Validate that body exists and flag is boolean
          if(!body || (typeof body.flag != "boolean")){
            ctx.response.code = 400;
            ctx.response.json({ error: 'BAD_REQUEST', message: 'Flag must be a boolean' });
            return;
          }
          
          ctx.globalStorage.extensionProperties.globalFlag = body.flag;
          ctx.response.json({flag: body.flag});
        } catch {
          ctx.response.code = 500;
          ctx.response.json({ error: 'INTERNAL_ERROR', message: 'Failed to update flag' });
        }
      }
    }
  ]
};
