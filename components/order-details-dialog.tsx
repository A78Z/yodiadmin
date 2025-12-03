"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order } from "@/app/dashboard/columns";
import { ORDER_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Clock3,
  CreditCard,
  LoaderCircle,
  MapPin,
  PackageCheck,
  PackageX,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { CART } from "@/lib/types/types";

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  console.log(order);

  // Timeline/étapes de la commande
  function StepperOrder({ status }: { status: string }) {
    const steps = [
      {
        key: "created",
        label: "Commande passée",
        icon: ShoppingCart,
        color: "#FFCD00",
      },
      {
        key: "processing",
        label: "Traitement",
        icon: LoaderCircle,
        color: "#3B82F6",
      },
      { key: "pending", label: "En attente", icon: Clock3, color: "#F59E42" },
      {
        key: "delivered",
        label: "Livrée",
        icon: PackageCheck,
        color: "#22C55E",
      },
      { key: "cancelled", label: "Annulée", icon: PackageX, color: "#EF4444" },
    ];
    const statusIndex = steps.findIndex((s) => status === s.key);
    return (
      <div className="flex items-center gap-2 w-full mb-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx < statusIndex || idx === statusIndex;
          const color = isActive ? step.color : "#E5E7EB";
          const iconColor = isActive ? "white" : "#A3A3A3";
          return (
            <div key={step.key} className="flex items-center gap-2 flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold border transition-all"
                style={{
                  backgroundColor: isActive ? color : "#F3F4F6",
                  borderColor: isActive ? color : "#E5E7EB",
                  color: iconColor,
                }}
              >
                <Icon size={18} color={iconColor} />
              </div>
              {idx < steps.length - 1 && (
                <div
                  className="h-1 flex-1 rounded-full transition-all"
                  style={{
                    backgroundColor: idx < statusIndex ? color : "#E5E7EB",
                  }}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl shadow-2xl border-0 max-h-[90vh] overflow-y-auto scrollbar-hide">
        {order &&
          (() => {
            const status =
              ORDER_STATUS[order.status as keyof typeof ORDER_STATUS];
            const StatusIcon = status.icon;
            return (
              <div className="bg-white/90 backdrop-blur-xl p-6 md:p-10 flex flex-col gap-6 relative">
                <DialogHeader className="flex flex-row items-center justify-between mb-2">
                  <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                    <span
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${status.color} shadow-sm`}
                    >
                      <span className="flex items-center justify-center w-4 h-4">
                        <StatusIcon size={16} />
                      </span>
                      {status.label}
                    </span>
                    <span className="text-gray-400 font-mono text-xs ml-2">
                      {formatDate(order.createdAt)}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                {/* Timeline/étapes */}
                <StepperOrder status={order.status as string} />
                {/* Liste produits */}
                <div className="flex flex-col gap-3">
                  <div className="font-semibold text-black/80 mb-1">
                    Produits commandés
                  </div>
                  <div className="flex flex-col gap-2">
                    {(order.products as CART[]).map((prod, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 shadow-sm"
                      >
                        {prod.imageUrl && (
                          <Image
                            src={prod.imageUrl}
                            alt={prod.title}
                            width={40}
                            height={40}
                            className="rounded object-cover w-10 h-10"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-black/90 text-sm line-clamp-1">
                            {prod.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            x{prod.quantity}
                          </div>

                          {prod.brand && (
                            <div className="text-xs text-gray-500">
                              Marque : {prod.brand}
                            </div>
                          )}
                          {prod.category && (
                            <div className="text-xs text-gray-500">
                              Catégorie : {prod.category}
                            </div>
                          )}
                          {prod.etiquette && (
                            <div className="text-xs text-gray-500">
                              Etiquette : {prod.etiquette}
                            </div>
                          )}
                          {prod.sku && (
                            <div className="text-xs text-gray-500">
                              Sku : {prod.sku}
                            </div>
                          )}
                        </div>
                        {prod.price && prod.discount && prod.discount > 0 && (
                          <div className="text-xs text-black/80 font-semibold">
                            {prod.discount && prod.discount > 0 && (
                              <span className="ml-2">
                                {Number((
                                  prod.price -
                                    (prod.price * prod.discount) / 100
                                ) / order.valueCurrency).toFixed(2)}{" "}
                                {order.selectedCurrency}
                              </span>
                            )}
                            {!prod.discount && prod.price > 0 && (
                              <span>
                                  {Number(prod.price / order.valueCurrency).toFixed(2)}{" "}
                                {order.selectedCurrency}
                              </span>
                            )}
                          </div>
                        )}
                        {prod.price && prod.discount && prod.discount > 0 && (
                          <div className="text-xs text-gray-400 font-semibold ml-2">
                            {(
                              Number((
                                prod.price - (prod.price * prod.discount) / 100
                              ) * prod.quantity
                            ) / order.valueCurrency).toFixed(2)}{" "}
                            {order.selectedCurrency}
                          </div>
                        )}
                        {prod.price && !prod.discount && (
                          <div className="text-xs text-gray-400 font-semibold ml-2">
                            {Number((
                              prod.price * prod.quantity
                            ) / order.valueCurrency).toFixed(2)}{" "}
                            {order.selectedCurrency}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Récapitulatif */}
                <div className="flex flex-col gap-2 bg-gray-50 rounded-xl p-4 mt-2">
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="text-xs text-gray-500">
                      Commande n°{" "}
                      <span className="font-semibold text-black/80">
                        {order._id.slice(-6).toUpperCase()}
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Total :{" "}
                      <span className="font-semibold text-black/80">
                        {order.total.toLocaleString()} {order.selectedCurrency}
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Articles :{" "}
                      <span className="font-semibold text-black/80">
                        {order.products.length}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center mt-2">
                    <span className="flex items-center gap-2 text-xs text-gray-500">
                      <CreditCard size={14} className="text-[#FFCD00]" />{" "}
                      <span className="font-medium">Paiement :</span>{" "}
                      <span className="font-semibold text-black/70">
                        {order.paymentMethod === "on-delivery"
                          ? "Paiement à la livraison"
                          : order.paymentMethod || "-"}
                      </span>
                      <span className="font-semibold text-black/70">
                        Zone de livraison : {order.shippingInfo.delivery}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium">Livraison :</span>{" "}
                      <span className="font-semibold text-black/70">
                        {Number(order.shippingCost / order.valueCurrency).toFixed(2) || "-"}{" "}
                        {order.selectedCurrency}
                      </span>
                    </span>
                  </div>
                </div>
                {/* Bloc adresse de livraison complet */}
                {order.shippingInfo && (
                  <div className="flex flex-col gap-1 bg-white/80 rounded-xl p-4 mt-3 border border-gray-100">
                    <div className="font-semibold text-black/80 mb-1 flex items-center gap-2">
                      <MapPin size={16} className="text-[#FFCD00]" /> Adresse de
                      livraison
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-gray-700">
                      {order.shippingInfo.lastname &&
                        order.shippingInfo.firstname && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Nom :</span>{" "}
                            <span>
                              {order.shippingInfo.lastname}{" "}
                              {order.shippingInfo.firstname}
                            </span>
                          </div>
                        )}
                      {order.shippingInfo.address && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Adresse :</span>{" "}
                          <span>{order.shippingInfo.address}</span>
                        </div>
                      )}
                      {order.shippingInfo.city && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Ville :</span>{" "}
                          <span>{order.shippingInfo.city}</span>
                        </div>
                      )}
                      {order.shippingInfo.phone && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Téléphone :</span>{" "}
                          <span>{order.shippingInfo.phone}</span>
                        </div>
                      )}
                      {order.shippingInfo.postalCode && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Code postal :</span>{" "}
                          <span>{order.shippingInfo.postalCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
      </DialogContent>
    </Dialog>
  );
}
