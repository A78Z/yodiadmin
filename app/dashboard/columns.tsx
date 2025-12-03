"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { IShippingInfo } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye } from "lucide-react";
import { toast } from "sonner";
import { CART } from "@/lib/types/types";

export type Order = {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  selectedCurrency: string;
  valueCurrency: number;
  products: CART[];
  paymentMethod: string;
  shippingCost: number;
  shippingInfo: IShippingInfo;
  userId: {
    firstname: string;
    lastname: string;
    email: string;
  };
};

const updateOrderStatus = async (orderId: string, status: string) => {
  console.log(orderId, status);
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du statut");
    }

    const updatedOrder = await response.json();
    toast.success("Statut mis à jour avec succès", {
      style: {
        color: "#10B981",
      },
      position: "top-right",
    });

    // Dispatch un événement personnalisé avec la commande mise à jour
    const event = new CustomEvent("orderStatusUpdated", {
      detail: updatedOrder,
    });
    window.dispatchEvent(event);

    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    toast.error("Erreur lors de la mise à jour du statut", {
      style: {
        color: "#EF4444",
      },
      position: "top-right",
    });
    return false;
  }
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: "Numéro de commande",
    cell: ({ row }) => {
      console.log(row.original);
      const order = row.original;
      return "#" + order._id.slice(-6).toUpperCase();
    },
  },
  {
    accessorKey: "shippingInfo",
    header: "Client",
    cell: ({ row }) => {
      const user = row.original.shippingInfo as IShippingInfo;
      return `${user.firstname} ${user.lastname}`;
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const amount = row.getValue("total") as number;
      return amount + " " + row.original.selectedCurrency;
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.original.status as string;
      const statusInfo = ORDER_STATUS[status];

      if (!statusInfo) {
        console.error(`Invalid status: ${status}`);
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-300">
            Statut inconnu
          </Badge>
        );
      }

      const Icon = statusInfo.icon;
      return (
        <Badge className={statusInfo.color}>
          <Icon className="mr-1 h-4 w-4" />
          {statusInfo.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return formatDate(row.getValue("createdAt"));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => {
              // This will be handled by the parent component
              const event = new CustomEvent("viewOrder", { detail: order });
              window.dispatchEvent(event);
            }}
          >
            <Eye
              size={32}
              className="text-[#A36F5E] transition-all duration-300 hover:text-[#A36F5E]"
            />
            <span className="sr-only">Voir la commande</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal
                  size={32}
                  className="text-[#A36F5E] transition-all duration-300 hover:text-[#A36F5E]"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(ORDER_STATUS).map(([status, info]) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => updateOrderStatus(order._id, status as string)}
                >
                  <info.icon className="mr-2 h-4 w-4" />
                  {info.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
