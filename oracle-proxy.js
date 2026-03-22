// Oracle EBS Proxy — CORS relay + SQL query endpoint for Joeyi Oracle
// Run: node oracle-proxy.js
// Listens on port 3001
//   /api/*       → forwards to EBS HTTP (REST API / ISG)
//   /api/query   → executes SQL against Oracle DB via oracledb thin driver

const http = require('http');
const https = require('https');
const oracledb = require('oracledb');

// ─── CONFIG ───
const PROXY_PORT = 3001;
const EBS_HOST = '192.168.56.102';
const EBS_PORT = 8000;
const EBS_PROTOCOL = 'http';

// Oracle DB connection (thin mode — no Oracle Client needed)
const DB_CONFIG = {
  user: 'apps',
  password: 'apps',
  connectString: `${EBS_HOST}:1521/EBSDB`
};

// Use thick mode (requires Oracle Instant Client)
try {
  oracledb.initOracleClient();
  console.log('Oracle client initialized in thick mode');
} catch (err) {
  if (err.errorNum !== 4043) {
    console.error('Warning: Oracle thick client init failed:', err.message);
    console.error('Falling back to thin mode — may not work with Oracle 12.1');
  }
}
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

// ─── HELPERS ───
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function jsonResponse(res, status, data) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ─── SERVER ───
const server = http.createServer(async (req, res) => {
  cors(res);

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Strip /api prefix
  let targetPath = req.url;
  if (targetPath.startsWith('/api')) {
    targetPath = targetPath.substring(4);
  }
  if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;

  // ─── SQL QUERY ENDPOINT ───
  if (targetPath === '/query' && req.method === 'POST') {
    try {
      const body = JSON.parse(await readBody(req));
      const sql = body.sql;
      if (!sql) return jsonResponse(res, 400, { error: 'Missing sql parameter' });

      // Block dangerous operations
      const upper = sql.toUpperCase().trim();
      if (upper.startsWith('DROP') || upper.startsWith('TRUNCATE') || upper.startsWith('ALTER') || upper.startsWith('CREATE')) {
        return jsonResponse(res, 403, { error: 'DDL statements are not allowed' });
      }

      console.log(`[SQL] ${sql.substring(0, 120)}${sql.length > 120 ? '...' : ''}`);

      let conn;
      try {
        conn = await oracledb.getConnection(DB_CONFIG);
        const result = await conn.execute(sql, [], {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
          maxRows: 5000,
          fetchInfo: {
            // Convert dates to strings
            "SCHEDULED_START_DATE": { type: oracledb.STRING },
            "SCHEDULED_COMPLETION_DATE": { type: oracledb.STRING },
            "EFFECTIVE_START_DATE": { type: oracledb.STRING },
            "EFFECTIVE_END_DATE": { type: oracledb.STRING },
            "LAST_UPDATE_DATE": { type: oracledb.STRING },
            "CREATION_DATE": { type: oracledb.STRING }
          }
        });

        console.log(`[SQL] ← ${result.rows.length} rows`);
        return jsonResponse(res, 200, {
          rows: result.rows,
          rowCount: result.rows.length,
          metaData: result.metaData
        });
      } finally {
        if (conn) await conn.close();
      }

    } catch (e) {
      console.error(`[SQL] ERROR: ${e.message}`);
      return jsonResponse(res, 500, { error: e.message });
    }
  }

  // ─── CORS PROXY to EBS HTTP ───
  console.log(`[PROXY] ${req.method} ${targetPath} → ${EBS_PROTOCOL}://${EBS_HOST}:${EBS_PORT}${targetPath}`);

  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    'Accept': 'application/json',
  };
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  const client = EBS_PROTOCOL === 'https' ? https : http;
  const proxyReq = client.request({
    hostname: EBS_HOST,
    port: EBS_PORT,
    path: targetPath,
    method: req.method,
    headers: headers,
    rejectUnauthorized: false,
  }, (proxyRes) => {
    console.log(`[PROXY] ← ${proxyRes.statusCode} ${targetPath}`);
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[PROXY] ERROR: ${err.message}`);
    jsonResponse(res, 502, {
      error: `Proxy error: ${err.message}`,
      hint: `Check that EBS is running at ${EBS_HOST}:${EBS_PORT}`
    });
  });

  req.pipe(proxyReq);
});

server.listen(PROXY_PORT, () => {
  console.log(`\n  Oracle EBS Proxy running on http://localhost:${PROXY_PORT}`);
  console.log(`  CORS relay  → ${EBS_PROTOCOL}://${EBS_HOST}:${EBS_PORT}`);
  console.log(`  SQL queries → ${DB_CONFIG.connectString} (as ${DB_CONFIG.user})`);
  console.log(`\n  Set Proxy URL in Joeyi to: http://localhost:${PROXY_PORT}/api`);
  console.log(`  Press Ctrl+C to stop\n`);
});
