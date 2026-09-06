export interface TemplateListItem {
  id: string
  label: string
  description: string
  category: string
  thumbnail: string
}

export type SchemaNodeType = string | SchemaNodeType[] | { [key: string]: SchemaNodeType }

export interface TemplateSchema {
  id: string
  label: string
  description: string
  variables: Record<string, SchemaNodeType>
  placeholders?: Record<string, unknown>
}

export interface EnumOption {
  value: string
  label: string
}

export interface BrandSettings {
  companyName: string
  legalName: string
  logoDataUrl: string
  logoName: string
  colorPrimary: string
  colorAccent: string
  font: string
  contactEmail: string
  website: string
  footerNote: string
}

export interface PreviewRequestPayload {
  templateId: string
  variables: Record<string, unknown>
}

export interface PreviewResponse {
  contentHtml: string
}

export type BuilderStatus = 'idle' | 'loading-templates' | 'loading-schema' | 'rendering' | 'error'