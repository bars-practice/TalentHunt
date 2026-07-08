const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Класс для обработки ошибок сервера
export class ApiError extends Error {
  public status?: number
  public responseData?: any

  constructor(
    message: string,
    status?: number,
    responseData?: any
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.responseData = responseData
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = { ...options.headers as Record<string, string> }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    }

    try {
      const response = await fetch(url, config)
      return await this.parseResponse<T>(response)
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(error instanceof Error ? error.message : 'Network error')
    }
  }

  // Обработка ответов сервера
  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: 'Unknown error' }
      }
      throw new ApiError(
        errorData.message || errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData
      )
    }

    if (response.status === 204) {
      return null as T
    }

    return await response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async download(endpoint: string, fallbackFilename = 'download.pdf'): Promise<void> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, { credentials: 'include' })

    if (!response.ok) {
      let errorData: unknown
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: 'Unknown error' }
      }
      const message =
        typeof errorData === 'object' &&
        errorData !== null &&
        ('message' in errorData || 'error' in errorData)
          ? String((errorData as { message?: string; error?: string }).message
              ?? (errorData as { error?: string }).error)
          : `HTTP ${response.status}`
      throw new ApiError(message, response.status, errorData)
    }

    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition')
    const filename =
      disposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/)?.[1]
        ?? fallbackFilename

    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = decodeURIComponent(filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  }
}

export const api = new ApiClient(API_BASE_URL)