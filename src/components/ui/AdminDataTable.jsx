import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { pageItemVariants, pageListVariants } from '../../lib/pageMotion.js'
import { usePageDirection } from '../../lib/usePageDirection.js'

export default function AdminDataTable({
  columns,
  rows,
  rowKey,
  selectedKey,
  onRowClick,
  emptyMessage = 'Nothing to show.',
  tableClass = '',
  page = 1,
  pageKey,
}) {
  const gridTemplate = columns.map((c) => c.width).join(' ')
  const direction = usePageDirection(page)
  const bodyKey = pageKey ?? page
  const shellRef = useRef(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    const el = shellRef.current
    if (el && el.getBoundingClientRect().top < 80) {
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 96, behavior: 'smooth' })
    }
  }, [bodyKey])

  return (
    <div ref={shellRef} className={`admin-table-shell min-w-0 ${tableClass}`}>
      <div className="admin-table-scroll">
      <div className="admin-table" style={{ '--admin-cols': gridTemplate }}>
        <div className="admin-table-head" role="row">
          {columns.map((col) => (
            <span
              key={col.id}
              role="columnheader"
              className={`admin-table-th ${col.align === 'end' ? 'admin-table-align-end' : ''} ${col.align === 'center' ? 'admin-table-align-center' : ''}`}
            >
              {col.label}
            </span>
          ))}
        </div>
        <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={bodyKey}
          className="admin-table-body"
          custom={direction}
          variants={pageListVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {rows.length === 0 ? (
            <p className="text-muted admin-table-empty px-4 py-12 text-center text-sm font-medium">{emptyMessage}</p>
          ) : (
            rows.map((row) => {
              const key = rowKey(row)
              const selected = selectedKey === key
              return (
                <motion.div key={key} className="admin-table-row-wrap" role="row" custom={direction} variants={pageItemVariants}>
                <button
                  type="button"
                  onClick={() => onRowClick?.(row)}
                  className={`admin-table-row ${selected ? 'admin-table-row-selected' : ''}`}
                >
                  {columns.map((col) => (
                    <span
                      key={col.id}
                      role="cell"
                      className={`admin-table-td ${col.align === 'end' ? 'admin-table-align-end' : ''} ${col.align === 'center' ? 'admin-table-align-center' : ''} ${col.mobile ? `admin-cell-${col.mobile}` : ''}`}
                    >
                      {col.render(row)}
                    </span>
                  ))}
                </button>
                </motion.div>
              )
            })
          )}
        </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </div>
  )
}
