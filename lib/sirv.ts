import 'server-only'

const SIRV_API_BASE = 'https://api.sirv.com'

type SirvConfig = {
  clientId: string
  clientSecret: string
  cdnUrl: string
}

type SirvTokenResponse = {
  token: string
  expiresIn: number
}

let cachedToken: string | null = null
let tokenExpiresAt = 0

export function getSirvConfig(): SirvConfig | null {
  const clientId = process.env.SIRV_CLIENT_ID
  const clientSecret = process.env.SIRV_CLIENT_SECRET
  const cdnUrl = process.env.SIRV_CDN_URL

  if (!clientId || !clientSecret || !cdnUrl) {
    return null
  }

  return { clientId, clientSecret, cdnUrl }
}

async function fetchSirvToken(config: SirvConfig): Promise<string> {
  const now = Date.now()
  if (cachedToken && tokenExpiresAt > now + 60_000) {
    return cachedToken
  }

  const response = await fetch(`${SIRV_API_BASE}/v2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `Sirv token request failed (${response.status})${detail ? `: ${detail}` : ''}`
    )
  }

  const data = (await response.json()) as SirvTokenResponse
  if (!data.token) {
    throw new Error('Sirv token response missing token')
  }

  cachedToken = data.token
  tokenExpiresAt = now + (data.expiresIn ?? 1200) * 1000

  return data.token
}

export function buildSirvPublicUrl(cdnUrl: string, filename: string): string {
  const host = cdnUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const path = filename.startsWith('/') ? filename : `/${filename}`
  return `https://${host}${path}`
}

function sanitizeFilename(name: string): string {
  const base = name.replace(/[/\\]/g, '_').replace(/\s+/g, '-')
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, '')
  return safe || 'file'
}

export function buildUploadPath(originalName: string, folder = '/creek/uploads'): string {
  const normalizedFolder = folder.startsWith('/') ? folder : `/${folder}`
  const trimmedFolder = normalizedFolder.replace(/\/$/, '')
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return `${trimmedFolder}/${unique}-${sanitizeFilename(originalName)}`
}

export async function uploadToSirv(
  body: Buffer | Uint8Array,
  options: {
    filename: string
    contentType: string
  }
): Promise<{ filename: string; url: string }> {
  const config = getSirvConfig()
  if (!config) {
    throw new Error('SIRV_NOT_CONFIGURED')
  }

  const token = await fetchSirvToken(config)
  const sirvPath = options.filename.startsWith('/')
    ? options.filename
    : `/${options.filename}`

  const uploadUrl = new URL(`${SIRV_API_BASE}/v2/files/upload`)
  uploadUrl.searchParams.set('filename', sirvPath)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': options.contentType,
    },
    body: body instanceof Buffer ? body : Buffer.from(body),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `Sirv upload failed (${response.status})${detail ? `: ${detail}` : ''}`
    )
  }

  return {
    filename: sirvPath,
    url: buildSirvPublicUrl(config.cdnUrl, sirvPath),
  }
}
