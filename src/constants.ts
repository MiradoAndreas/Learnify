export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const THUMBNAIL_FALLBACK = "/placeholder/thumbnail-placeholder.png";

export const DEFAULT_COURSE_LIMIT = 4


export const INSTANT_SEARCH_INDEX_NAME = "courses"
export const INSTANT_SUGGESTIONS_INDEX = "courses_query_suggestions"

export const INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES = ['categories', 'title', 'query', 'description'];