

interface HelloData {
  message: string
}

export const fetchHelloMessage = async (): Promise<HelloData> => {
  const response = await fetch('/api/hello')

  if (!response.ok) {
    throw new Error('Failed to fetch hello message')
  }

  return response.json()
}