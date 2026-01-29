/**
 * Cloudflare Worker - Airtable Products & Variants API
 * 
 * Environment Variables Required:
 * - AIRTABLE_API_KEY: Your Airtable Personal Access Token
 * 
 * Base ID: appR3SXKcn3s0DI3A
 * Products Table ID: tbltxupoBniwctuov
 * Variants Table ID: tblokW8iyXD1smKx6
 */

const AIRTABLE_BASE_ID = 'appR3SXKcn3s0DI3A';
const PRODUCTS_TABLE_ID = 'tbltxupoBniwctuov';
const VARIANTS_TABLE_ID = 'tblokW8iyXD1smKx6';
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function airtableRequest(env, tableId, method = 'GET', body = null, recordId = null, params = {}) {
  let url = AIRTABLE_API_URL + '/' + AIRTABLE_BASE_ID + '/' + tableId;
  if (recordId) {
    url += '/' + recordId;
  }
  
  const queryParams = new URLSearchParams(params);
  if (queryParams.toString()) {
    url += '?' + queryParams.toString();
  }

  const options = {
    method,
    headers: {
      'Authorization': 'Bearer ' + env.AIRTABLE_API_KEY,
      'Content-Type': 'application/json',
    },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return response.json();
}

function parsePath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  return {
    resource: parts[0] || null,
    id: parts[1] || null,
  };
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const { resource, id } = parsePath(url.pathname);
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!resource || !['products', 'variants'].includes(resource)) {
    return jsonResponse({ error: 'Invalid endpoint. Use /products or /variants' }, 404);
  }

  const tableId = resource === 'products' ? PRODUCTS_TABLE_ID : VARIANTS_TABLE_ID;

  try {
    switch (method) {
      case 'GET':
        if (id) {
          const record = await airtableRequest(env, tableId, 'GET', null, id);
          return jsonResponse(formatRecord(record));
        } else {
          const params = {};
          const filterByFormula = url.searchParams.get('filter');
          if (filterByFormula) params.filterByFormula = filterByFormula;
          
          const maxRecords = url.searchParams.get('maxRecords');
          if (maxRecords) params.maxRecords = maxRecords;
          
          const sort = url.searchParams.get('sort');
          if (sort) params['sort[0][field]'] = sort;
          
          const direction = url.searchParams.get('direction');
          if (direction) params['sort[0][direction]'] = direction;
          
          const pageSize = url.searchParams.get('pageSize');
          if (pageSize) params.pageSize = pageSize;
          
          const offset = url.searchParams.get('offset');
          if (offset) params.offset = offset;

          const data = await airtableRequest(env, tableId, 'GET', null, null, params);
          return jsonResponse({
            records: data.records?.map(formatRecord) || [],
            offset: data.offset,
          });
        }

      case 'POST':
        const createBody = await request.json();
        const created = await airtableRequest(env, tableId, 'POST', {
          records: Array.isArray(createBody) 
            ? createBody.map(r => ({ fields: r }))
            : [{ fields: createBody }]
        });
        
        if (created.records?.length === 1) {
          return jsonResponse(formatRecord(created.records[0]), 201);
        }
        return jsonResponse({
          records: created.records?.map(formatRecord) || []
        }, 201);

      case 'PUT':
      case 'PATCH':
        if (!id) {
          return jsonResponse({ error: 'Record ID required for update' }, 400);
        }
        const updateBody = await request.json();
        const updated = await airtableRequest(env, tableId, 'PATCH', {
          records: [{ id, fields: updateBody }]
        });
        return jsonResponse(formatRecord(updated.records?.[0]));

      case 'DELETE':
        if (!id) {
          return jsonResponse({ error: 'Record ID required for delete' }, 400);
        }
        await airtableRequest(env, tableId, 'DELETE', null, null, { 'records[]': id });
        return jsonResponse({ deleted: true, id });

      default:
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }
  } catch (error) {
    return jsonResponse({ error: error.message || 'Internal server error' }, 500);
  }
}

function formatRecord(record) {
  if (!record) return null;
  return {
    id: record.id,
    ...record.fields,
    createdTime: record.createdTime,
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};
