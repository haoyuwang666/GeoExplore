import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange, label = 'items' }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label={`${label} pagination`}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label={`Previous page of ${label}`}
      >
        <ChevronLeft size={16} />
        Previous
      </button>
      <span>Page <strong>{page}</strong> of {totalPages}</span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label={`Next page of ${label}`}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
