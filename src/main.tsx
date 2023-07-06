import React, { HTMLProps, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  Column,
  Row,
  Table,
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { makeData, Person } from "./makeData";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Dragable elements

const DraggableRow = ({
  row,
  reorderRow,
}: {
  row: Row<Person>;
  reorderRow: (draggedRowIndex: number, targetRowIndex: number) => void;
}) => {
  const [, dropRef] = useDrop({
    accept: "row",
    drop: (draggedRow: Row<Person>) => reorderRow(draggedRow.index, row.index),
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => row,
    type: "row",
  });

  return (
    <tr
      ref={previewRef} //previewRef could go here
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {row.getVisibleCells().map((cell) =>
        cell.column.id === "dragButton" ? (
          <td ref={dropRef} key={cell.id}>
            <button ref={dragRef}>
              <i className="gg-components"></i>
            </button>
          </td>
        ) : (
          <td key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      )}
    </tr>
  );
};

function App() {
  const [checkboxCount, setCheckboxCount] = useState(0);
  const [toggle, setToggle] = useState(false);
  const rerender = React.useReducer(() => ({}), {})[1];
  const reorderRow = (draggedRowIndex: number, targetRowIndex: number) => {
    data.splice(
      targetRowIndex,
      0,
      data.splice(draggedRowIndex, 1)[0] as Person
    );
    setData([...data]);
  };

  const handleToggle = (isChecked, id) => {
    // console.log(id);
    !isChecked ? setToggle(true) : setToggle(false);
    // console.log(isChecked);

    // setShowNewRow((prev) => !prev);
  };

  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        // accessorFn: (row) => row.lastName,
        id: "dragButton",
        cell: (info) => info.getValue(),
        header: () => <span></span>,
        footer: (props) => props.column.id,
      },

      {
        accessorKey: "firstName",
        header: ({ table }) => (
          <>
            {/* <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />{" "} */}
            {/* <button
              {...{
                onClick: table.getToggleAllRowsExpandedHandler(),
              }}
            >
              {table.getIsAllRowsExpanded() ? "👇" : "👉"}
            </button>{" "} */}
            First Name
          </>
        ),
        cell: ({ row, getValue }) => (
          <div
            style={{
              // Since rows are flattened by default,
              // we can use the row.depth property
              // and paddingLeft to visually indicate the depth
              // of the row
              paddingLeft: `${row.depth * 2}rem`,
            }}
          >
            <>
              <IndeterminateCheckbox
                {...{
                  checked: row.getIsSelected(),
                  onClick: () => handleToggle(row.getIsSelected(), row.id),
                  // onClick: () =>
                  //   handleToggle(
                  //     selectedIds.includes(row.getIsSelected()),
                  //     row.id
                  //   ),
                  indeterminate: row.getIsSomeSelected(),
                  onChange: row.getToggleSelectedHandler(),
                }}
              />{" "}
              {row.getCanExpand() ? (
                <button
                  {...{
                    onClick: row.getToggleExpandedHandler(),
                    style: { cursor: "pointer" },
                  }}
                >
                  {/* <i className="gg-chevron-double-right"></i> */}
                  {row.getIsExpanded() ? (
                    <i className="gg-chevron-double-down"></i>
                  ) : (
                    <i className="gg-chevron-double-right"></i>
                  )}
                </button>
              ) : (
                "🔵"
              )}{" "}
              {getValue()}
            </>
          </div>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.lastName,
        id: "lastName",
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "age",
        header: () => "Age",
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "visits",
        header: () => <span>Visits</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "status",
        header: "Status",
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "progress",
        header: "Profile Progress",
        footer: (props) => props.column.id,
      },
    ],
    []
  );

  const [data, setData] = React.useState(() => makeData(100, 5, 3));
  // const refreshData = () => setData(() => makeData(100, 5, 3))
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.userId, //good to have guaranteed unique row ids/keys for rendering
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const pagination = table.getState().pagination;

  return (
    <div className="p-2">
      <div className="h-2" />
      <table
        {...{
          style: {
            width: table.getCenterTotalSize(),
          },
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    {...{
                      key: header.id,
                      colSpan: header.colSpan,
                      style: {
                        width: header.getSize(),
                      },
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    <div
                      {...{
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `resizer ${
                          header.column.getIsResizing() ? "isResizing" : ""
                        }`,
                      }}
                    ></div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {toggle && (
            <tr>
              <td>Count: {checkboxCount}</td>
              {/* <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td> */}
            </tr>
          )}
          {table.getRowModel().rows.map((row) => {
            if (row.depth != 0) {
              return (
                <DraggableRow key={row.id} row={row} reorderRow={reorderRow} />
              );
            }
            return (
              <DraggableRow key={row.id} row={row} reorderRow={reorderRow} />
            );
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {pagination.pageIndex + 1} of {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      {/* <div>{table.getRowModel().rows.length} Rows</div>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div> */}
      <pre>{JSON.stringify(expanded, null, 2)}</pre>
    </div>
  );
}

function Filter({
  column,
  table,
}: {
  column: Column<any, any>;
  table: Table<any>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === "number" ? (
    <div className="flex space-x-2">
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
    />
  );
}

function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
);
