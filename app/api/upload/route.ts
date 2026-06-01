import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-response'
import { requireAuth } from '@/lib/require-auth'
import { buildUploadPath, getSirvConfig, uploadToSirv } from '@/lib/sirv'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    if (!getSirvConfig()) {
      return apiError('sirvNotConfigured', 503)
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return apiError('fileRequired', 400)
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError('fileTooLarge', 413)
    }

    const folderParam = formData.get('folder')
    const folder =
      typeof folderParam === 'string' && folderParam.trim()
        ? folderParam.trim()
        : '/creek/uploads'

    const buffer = Buffer.from(await file.arrayBuffer())
    const sirvPath = buildUploadPath(file.name, folder)
    const contentType = file.type || 'application/octet-stream'

    const result = await uploadToSirv(buffer, {
      filename: sirvPath,
      contentType,
    })

    return NextResponse.json(
      {
        url: result.url,
        filename: result.filename,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'SIRV_NOT_CONFIGURED') {
      return apiError('sirvNotConfigured', 503)
    }
    return apiError('uploadFailed', 500)
  }
}
