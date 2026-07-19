import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { formatUsd, formatMw } from '../utils/constants'
import StatusBadge from './StatusBadge'

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('company', { header: '기업' }),
  columnHelper.accessor((row) => [row.city, row.region, row.country].filter(Boolean).join(', '), {
    id: 'location',
    header: '위치',
  }),
  columnHelper.accessor('status', {
    header: '상태',
    cell: (info) => <StatusBadge status={info.getValue()} needsReview={info.row.original.needs_review} />,
  }),
  columnHelper.accessor('capacity_mw', { header: '용량', cell: (info) => formatMw(info.getValue()) }),
  columnHelper.accessor('investment_usd', { header: '투자금액', cell: (info) => formatUsd(info.getValue()) }),
  columnHelper.accessor('announced_date', { header: '발표일' }),
  columnHelper.accessor('expected_completion', { header: '완공예정' }),
  columnHelper.accessor('source_url', {
    header: '출처',
    cell: (info) =>
      info.getValue() ? (
        <a href={info.getValue()} target="_blank" rel="noreferrer">
          {info.row.original.source_name || '링크'}
        </a>
      ) : (
        '-'
      ),
    enableSorting: false,
  }),
]

export default function TableView({ sites }) {
  const [sorting, setSorting] = useState([{ id: 'company', desc: false }])
  const data = useMemo(() => sites, [sites])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  return (
    <div className="table-view">
      <table className="data-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted()] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          이전
        </button>
        <span>
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
        </span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          다음
        </button>
      </div>
    </div>
  )
}
