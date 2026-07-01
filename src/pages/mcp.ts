import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';
import { ExtractionError, MAX_BASE64_CHARS, extractWithGemini } from '../lib/server/extraction';
import { dataToCSV, dataToXlsxBase64 } from '../lib/server/spreadsheet';

export const prerender = false;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  } & Record<string, unknown>;
};

const TOOL_NAME = 'convert_document_to_spreadsheet';

function rpcResult(id: JsonRpcRequest['id'], result: unknown) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, result }), {
    headers: {
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': '2025-03-26',
    },
  });
}

function rpcError(id: JsonRpcRequest['id'], code: number, message: string, data?: unknown) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message, data } }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': '2025-03-26',
    },
  });
}

function toolList() {
  return [
    {
      name: TOOL_NAME,
      title: '엑셀변신 - 이미지/PDF를 엑셀로 변환',
      description: '이미지 또는 PDF에서 표 데이터를 추출해 JSON, CSV, XLSX(base64)로 반환합니다. 무료 테스트는 최대 5장 또는 10MB까지 지원합니다.',
      inputSchema: {
        type: 'object',
        properties: {
          file_url: {
            type: 'string',
            description: '서버에서 접근 가능한 이미지/PDF URL. file_base64 대신 사용할 수 있습니다.',
          },
          file_base64: {
            type: 'string',
            description: '이미지/PDF 파일의 base64 본문. file_url 대신 사용할 수 있습니다.',
          },
          mime_type: {
            type: 'string',
            enum: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
          },
          filename: {
            type: 'string',
            description: '결과 파일명에 사용할 원본 파일명',
          },
          output_format: {
            type: 'string',
            enum: ['xlsx', 'csv', 'json'],
            default: 'xlsx',
          },
        },
        oneOf: [
          { required: ['file_url'] },
          { required: ['file_base64', 'mime_type'] },
        ],
      },
    },
  ];
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

async function loadFile(args: Record<string, unknown>) {
  const fileBase64 = asString(args.file_base64);
  const fileUrl = asString(args.file_url);
  const explicitMimeType = asString(args.mime_type);

  if (fileBase64) {
    return {
      base64: fileBase64.replace(/^data:[^;]+;base64,/, ''),
      mimeType: explicitMimeType ?? '',
    };
  }
  if (!fileUrl) {
    throw new ExtractionError('file_url 또는 file_base64가 필요합니다.', 400);
  }

  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new ExtractionError(`파일을 가져오지 못했습니다: ${response.status}`, 400);
  }
  const mimeType = explicitMimeType || response.headers.get('content-type')?.split(';')[0] || '';
  const contentLength = Number(response.headers.get('content-length') || '0');
  if (contentLength > 10 * 1024 * 1024) {
    throw new ExtractionError('무료 테스트는 최대 5장 또는 파일당 10MB까지 지원합니다. 더 많은 페이지/이미지는 유료 플랜 준비중입니다.', 402, 'PAID_PLAN_PREPARING');
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  if (base64.length > MAX_BASE64_CHARS) {
    throw new ExtractionError('무료 테스트는 최대 5장 또는 파일당 10MB까지 지원합니다. 더 많은 페이지/이미지는 유료 플랜 준비중입니다.', 402, 'PAID_PLAN_PREPARING');
  }
  return { base64, mimeType };
}

async function callConvertTool(args: Record<string, unknown>) {
  const { base64, mimeType } = await loadFile(args);
  const filename = asString(args.filename) ?? 'extracted';
  const outputFormat = asString(args.output_format) ?? 'xlsx';
  const data = await extractWithGemini(base64, mimeType);

  if (outputFormat === 'json') {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
      structuredContent: data,
    };
  }

  if (outputFormat === 'csv') {
    const csv = dataToCSV(data);
    return {
      content: [
        {
          type: 'text',
          text: csv,
        },
      ],
      structuredContent: {
        filename: filename.replace(/\.[^.]+$/, '') + '.csv',
        mimeType: 'text/csv',
        csv,
        extracted: data,
      },
    };
  }

  const xlsxBase64 = dataToXlsxBase64(data, filename.replace(/\.[^.]+$/, '').slice(0, 31));
  return {
    content: [
      {
        type: 'text',
        text: [
          '엑셀 변환이 완료됐습니다.',
          `파일명: ${filename.replace(/\.[^.]+$/, '')}.xlsx`,
          'structuredContent.xlsxBase64 값을 .xlsx 파일로 저장하면 됩니다.',
        ].join('\n'),
      },
    ],
    structuredContent: {
      filename: filename.replace(/\.[^.]+$/, '') + '.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xlsxBase64,
      extracted: data,
    },
  };
}

export const GET: APIRoute = async () => {
  return new Response('엑셀변신 MCP endpoint. Use JSON-RPC POST.', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'MCP-Protocol-Version': '2025-03-26',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let payload: JsonRpcRequest;
  try {
    payload = await request.json();
  } catch {
    return rpcError(null, -32700, 'Invalid JSON');
  }

  try {
    if (payload.method === 'initialize') {
      return rpcResult(payload.id, {
        protocolVersion: '2025-03-26',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'excel-byeonsin',
          title: '엑셀변신',
          version: '0.1.0',
        },
      });
    }

    if (payload.method === 'notifications/initialized') {
      return new Response(null, { status: 202 });
    }

    if (payload.method === 'tools/list') {
      return rpcResult(payload.id, { tools: toolList() });
    }

    if (payload.method === 'tools/call') {
      const name = payload.params?.name;
      if (name !== TOOL_NAME) {
        return rpcError(payload.id, -32602, `Unknown tool: ${name}`);
      }
      const result = await callConvertTool(payload.params?.arguments ?? {});
      return rpcResult(payload.id, result);
    }

    return rpcError(payload.id, -32601, `Method not found: ${payload.method}`);
  } catch (err) {
    if (err instanceof ExtractionError) {
      return rpcError(payload.id, -32000, err.message, { status: err.status, code: err.code });
    }
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return rpcError(payload.id, -32603, message);
  }
};
