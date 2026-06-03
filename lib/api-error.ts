export function getApiErrorMessage(
  translate: (key: string) => string,
  code?: string,
  fallbackKey = 'errors.unknown'
): string {
  if (!code) return translate(fallbackKey)

  const knownCodes = [
    'unauthorized',
    'forbidden',
    'userNotFound',
    'toolNotFound',
    'invalidToolId',
    'userIdentityUnknown',
    'fetchToolsFailed',
    'createToolFailed',
    'updateToolFailed',
    'deleteToolFailed',
    'fetchProfileFailed',
    'fetchUsersFailed',
    'sirvNotConfigured',
    'fileRequired',
    'fileTooLarge',
    'uploadFailed',
    'titleRequired',
    'fetchGalleryFailed',
    'createGalleryFailed',
    'mediaUrlRequired',
    'invalidGalleryType',
    'invalidGalleryId',
    'galleryNotFound',
    'updateGalleryFailed',
    'deleteGalleryFailed',
    'fetchChatSessionsFailed',
    'createChatSessionFailed',
    'deleteChatSessionFailed',
    'fetchChatMessagesFailed',
    'saveChatMessagesFailed',
    'chatSessionNotFound',
    'invalidChatSessionId',
  ]

  if (knownCodes.includes(code)) {
    return translate(`errors.${code}`)
  }

  return translate(fallbackKey)
}
