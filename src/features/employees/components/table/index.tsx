import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { Pagination } from "@/shared/components/pagination";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { EMPLOYEE_ALLOWED_SORT_COLUMNS } from "../../constants";
import type { Employee } from "../../schemas/model";

export interface EmployeeTableProps {
  data: QueryPaginatedReturnType<Employee>;
}

// TODO: refatorar
export const EmployeeTable = ({
  data: { data, total },
}: EmployeeTableProps) => {
  const columns = React.useMemo(() => {
    const c = createColumnHelper<Employee>();

    return [
      c.accessor("fullName", {
        header: "Nome",
        enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("fullName"),
        meta: {
          minColumnWidth: 300,
        },
      }),
      c.accessor("oabNumber", {
        header: "OAB",
        // cell: ({ row }) => formatter.oab(row.original.oabNumber ?? ""),
        enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("oabNumber"),
      }),
      c.accessor("type", {
        header: "Cargo",
        // cell: ({ row }) => formatter.employeeType(row.original.type),
        enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("type"),
      }),
      c.accessor("remunerationPercent", {
        header: "Remuneração",
        // cell: ({ row }) => formatter.percent(row.original.remunerationPercent),
        enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes(
          "remunerationPercent",
        ),
      }),
      c.accessor("contractCount", {
        header: "Contratos",
        enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("contractCount"),
      }),
      c.accessor("role", {
        header: "Perfil",
        // cell: ({ row }) => (
        //   <Badge>{formatter.employeeRole(row.original.role)}</Badge>
        // ),
        enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("role"),
      }),
      c.accessor("status", {
        header: "Status",
        // cell: ({ row }) => <EntityStatus status={row.original.status} />,
        enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("status"),
      }),
      // c.display({
      //   id: "actions",
      //   header: "Ações",
      //   cell: ({ row }) => (
      //     <ButtonEdit onClick={() => openEditModal(row.original.id)} />
      //   ),
      // }),
    ];
  }, []);

  return (
    <DataTable
      columns={columns}
      data={data}
      footerContent={<Pagination totalRecords={total} size="sm" />}
    />
  );
};
