"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categories, SUBCATEGORY } from "@/lib/data";

interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  description?: string;
  category: string;
  subCategory?: string;
  stock: number;
  discount?: number;
  brand?: string;
  sku?: string;
  etiquette?: string;
  usage?: string;
  benefits?: string[];
}

interface Benefit {
  id: string;
  value: string;
}

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated: () => void;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onProductUpdated,
}: EditProductDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    subCategory: "",
    discount: "",
    imageUrl: "",
    stock: "",
    brand: "",
    sku: "",
    etiquette: "",
    description: "",
    usage: "",
  });
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<
    SUBCATEGORY[] | null
  >(null);

  useEffect(() => {
    if (formData.category) {
      const subCatSelected = categories.find(
        (category) => category.slug === formData.category
      )?.subcategories;

      if (subCatSelected) {
        setSelectedSubcategory(subCatSelected || null);
      } else {
        setSelectedSubcategory(null);
      }
    }
  }, [formData.category]);

  // Mettre à jour le formulaire quand le produit change
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        price: product.price.toString(),
        category: product.category,
        subCategory: product.subCategory || "",
        discount: (product.discount || 0).toString(),
        imageUrl: product.imageUrl,
        stock: product.stock.toString(),
        brand: product.brand || "",
        sku: product.sku || "",
        etiquette: product.etiquette || "",
        description: product.description || "",
        usage: product.usage || "",
      });
      setImagePreview(product.imageUrl);

      // Convertir les avantages en format editable
      const productBenefits = product.benefits || [];
      setBenefits(
        productBenefits.map((benefit, index) => ({
          id: `existing-${index}`,
          value: benefit,
        }))
      );
    }
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addBenefit = () => {
    const newBenefit: Benefit = {
      id: Date.now().toString(),
      value: "",
    };
    setBenefits([...benefits, newBenefit]);
  };

  const removeBenefit = (id: string) => {
    setBenefits(benefits.filter((benefit) => benefit.id !== id));
  };

  const updateBenefit = (id: string, value: string) => {
    setBenefits(
      benefits.map((benefit) =>
        benefit.id === id ? { ...benefit, value } : benefit
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);

    try {
      // Filtrer les avantages vides
      const validBenefits = benefits
        .map((benefit) => benefit.value.trim())
        .filter((value) => value.length > 0);

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        stock: parseInt(formData.stock),
        benefits: validBenefits,
      };

      const response = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la modification du produit"
        );
      }

      const updatedProduct = await response.json();

      toast.success("Produit modifié avec succès", {
        duration: 3000,
        style: { color: "#10B981" },
        position: "top-right",
      });

      // Déclencher l'événement avec le produit mis à jour
      window.dispatchEvent(
        new CustomEvent("productUpdated", {
          detail: updatedProduct,
        })
      );
      onProductUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la modification du produit", {
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
      <DialogContent className="admin-product-dialog max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="image" className="mb-2">
                  Image du produit
                </Label>
                <div className="mt-2">
                  <div
                    className="relative h-48 w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <>
                        <Image
                          src={imagePreview}
                          alt="Aperçu"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview("");
                            setFormData((prev) => ({ ...prev, imageUrl: "" }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Cliquez pour télécharger une image
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title" className="mb-2">
                  Titre du produit *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="price" className="mb-2">
                  Prix (FCFA) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="discount" className="mb-2">
                  Remise (%)
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="stock" className="mb-2">
                  Stock *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stock: e.target.value }))
                  }
                  required
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-full">
                <Label htmlFor="category" className="mb-2">
                  Catégorie *
                </Label>
                <select
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 shadow-sm p-2 rounded-md"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              {selectedSubcategory && (
                <div className="w-full">
                  <Label htmlFor="subCategory" className="mb-2">
                    Sous Catégorie
                  </Label>
                  <select
                    value={formData.subCategory}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData((prev) => ({
                        ...prev,
                        subCategory: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 shadow-sm p-2 rounded-md"
                    required
                  >
                    <option value="">Sélectionner une sous catégorie</option>
                    {selectedSubcategory.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.slug}>
                        {subcategory.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="brand" className="mb-2">
                  Marque
                </Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  placeholder="Marque du produit"
                />
              </div>

              <div>
                <Label htmlFor="sku" className="mb-2">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  placeholder="SKU du produit"
                />
              </div>

              <div>
                <Label htmlFor="etiquette" className="mb-2">
                  Étiquette
                </Label>
                <Input
                  id="etiquette"
                  value={formData.etiquette}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      etiquette: e.target.value,
                    }))
                  }
                  placeholder="Étiquette du produit"
                />
              </div>

              <div>
                <Label htmlFor="description" className="mb-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-[100px]"
                  placeholder="Description du produit"
                />
              </div>

              <div>
                <Label htmlFor="usage" className="mb-2">
                  Mode d&apos;emploi
                </Label>
                <Textarea
                  id="usage"
                  value={formData.usage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usage: e.target.value,
                    }))
                  }
                  className="min-h-[100px]"
                  placeholder="Mode d'emploi du produit"
                />
              </div>
            </div>
          </div>

          {/* Section Avantages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Avantages du produit
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBenefit}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un avantage
              </Button>
            </div>

            {benefits.map((benefit) => (
              <div key={benefit.id} className="flex gap-2">
                <Input
                  value={benefit.value}
                  onChange={(e) => updateBenefit(benefit.id, e.target.value)}
                  placeholder="Avantage du produit"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeBenefit(benefit.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#A36F5E] hover:bg-[#A36F5E]/80 text-white"
            >
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
