import type { BaseEntity } from "./GlobalType"

export interface Attachment extends BaseEntity {
  name: string
  url?: string
  size?: number
  mimeType?: string
}
