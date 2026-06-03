'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_GEMINI_MODEL_ID,
  FALLBACK_GEMINI_CHAT_MODELS,
  type GeminiChatModelOption,
} from '@/lib/ai/gemini-models'

const STORAGE_KEY = 'creek-chat-gemini-model'

type ChatModelsConfig = {
  defaultModelId: string
  models: GeminiChatModelOption[]
}

let cachedConfig: ChatModelsConfig | null = null
let inflightConfig: Promise<ChatModelsConfig> | null = null

async function loadChatModelsConfig(): Promise<ChatModelsConfig> {
  if (cachedConfig) {
    return cachedConfig
  }

  if (inflightConfig) {
    return inflightConfig
  }

  inflightConfig = (async () => {
    let config: ChatModelsConfig = {
      defaultModelId: DEFAULT_GEMINI_MODEL_ID,
      models: FALLBACK_GEMINI_CHAT_MODELS,
    }

    try {
      const res = await fetch('/api/chat/models')
      if (res.ok) {
        const data = (await res.json()) as ChatModelsConfig
        if (data.models.length > 0) {
          config = data
        }
      }
    } catch {
      // 使用本地兜底
    }

    cachedConfig = config
    return config
  })().finally(() => {
    inflightConfig = null
  })

  return inflightConfig
}

function resolveInitialModelId(config: ChatModelsConfig): string {
  const allowed = config.models.length > 0 ? config.models : []
  const allowedIds = new Set(allowed.map((m) => m.id))
  const fallback = allowedIds.has(config.defaultModelId)
    ? config.defaultModelId
    : (allowed[0]?.id ?? DEFAULT_GEMINI_MODEL_ID)

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && allowedIds.has(stored)) {
      return stored
    }
  } catch {
    // ignore
  }

  return fallback
}

export function useChatModel() {
  const [models, setModels] = useState<GeminiChatModelOption[]>(
    () => cachedConfig?.models ?? []
  )
  const [modelId, setModelId] = useState(DEFAULT_GEMINI_MODEL_ID)
  const [ready, setReady] = useState(() => cachedConfig !== null)

  useEffect(() => {
    let cancelled = false

    void loadChatModelsConfig().then((config) => {
      if (cancelled) return
      setModels(config.models)
      setModelId(resolveInitialModelId(config))
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const selectModel = useCallback((id: string) => {
    setModelId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // ignore
    }
  }, [])

  const selectedModel =
    models.find((m) => m.id === modelId) ??
    models[0] ??
    null

  return {
    models,
    modelId,
    selectedModel,
    selectModel,
    ready,
  }
}
