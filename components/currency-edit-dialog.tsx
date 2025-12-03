"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Currency {
  _id: string;
  name: string;
  rate: number;
}

interface CurrencyEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function CurrencyEditDialog({
  open,
  onOpenChange,
  onUpdate,
}: CurrencyEditDialogProps) {
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchCurrency();
    }
  }, [open]);

  const fetchCurrency = async () => {
    try {
      setFetching(true);
      setError("");
      const response = await fetch("/api/currency");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de la devise");
      }
      const data = await response.json();

      setCurrency(data);
      setName(data.name || "");
      setRate(data.rate?.toString() || "");
    } catch (error) {
      console.error("Erreur:", error);
      setError("Impossible de charger la devise");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/currency/${currency?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          rate: Number(rate),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Erreur lors de la mise à jour", {
          duration: 3000,
          style: { color: "#EF4444" },
          position: "top-right",
        });
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      const updatedCurrency = await response.json();
      setCurrency(updatedCurrency);
      toast.success("Devise mise à jour avec succès", {
        duration: 3000,
        style: { color: "#10B981" },
        position: "top-right",
      });
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour de la devise", {
        duration: 3000,
        style: { color: "#EF4444" },
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl shadow-2xl border-0">
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8 flex flex-col gap-6 relative">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Modifier la devise
              </DialogTitle>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Mettez à jour le nom ou le taux de change de votre devise
            </p>
          </DialogHeader>

          {fetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="currency-name"
                  className="text-sm font-semibold text-gray-700"
                >
                  Nom de la devise
                </Label>
                <Input
                  id="currency-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: FCFA, USD, EUR..."
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="currency-rate"
                  className="text-sm font-semibold text-gray-700"
                >
                  Taux de change
                </Label>
                <Input
                  id="currency-rate"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="Ex: 1.0, 655.957..."
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500">
                  Taux de conversion par rapport à la devise de base
                </p>
              </div>

              {currency && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-900 mb-1">
                    Devise actuelle
                  </p>
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">{currency.name}</span> -
                    Taux: <span className="font-semibold">{currency.rate}</span>
                  </p>
                </div>
              )}

              <DialogFooter className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Mise à jour...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
