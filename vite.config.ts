import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function fast2SmsPlugin() {
  return {
    name: 'fast2sms-api-proxy',
    configureServer(server: any) {
      server.middlewares.use('/api/send-sos', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const apiKey = data.apiKey || data.authorization || process.env.VITE_FAST2SMS_API_KEY || 'w4LzdQEJI1igs9fWeoCrYUu6SVqlAKyZPTR8DB3hpcknaFjNbGqiFv8Yct1DSRHPgVKw9xbashmBUuZn';
            const numbers = data.numbers || '8754603193';
            const message = data.message || '';

            const params = new URLSearchParams();
            params.append('authorization', apiKey);
            params.append('sender_id', 'FSTSMS');
            params.append('message', message);
            params.append('language', 'english');
            params.append('route', 'q');
            params.append('numbers', numbers);

            const f2sRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
              method: 'POST',
              headers: {
                'authorization': apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache'
              },
              body: params.toString()
            });
            const result = await f2sRes.json();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ return: false, message: err?.message || String(err) }));
          }
        });
      });

      server.middlewares.use('/api/check-wallet', async (req: any, res: any) => {
        try {
          const authKey = req.headers['authorization'] || process.env.VITE_FAST2SMS_API_KEY || 'w4LzdQEJI1igs9fWeoCrYUu6SVqlAKyZPTR8DB3hpcknaFjNbGqiFv8Yct1DSRHPgVKw9xbashmBUuZn';
          const walletRes = await fetch('https://www.fast2sms.com/dev/wallet', {
            headers: { 'authorization': authKey }
          });
          const result = await walletRes.json();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ return: false, message: err?.message || String(err) }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    root: __dirname,
    plugins: [react(), tailwindcss(), fast2SmsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
