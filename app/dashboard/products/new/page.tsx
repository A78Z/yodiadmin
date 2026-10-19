"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categories, SUBCATEGORY } from "@/lib/data";
import Link from "next/link";

interface Benefit {
  id: string;
  value: string;
}

export default function NewProductPage() {
  const router = useRouter();
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<
    SUBCATEGORY[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (formData.category) {
      const subCatSelected = categories.find(
        (category) => category.slug === formData.category
      )?.subcategories;

      if (subCatSelected) {
        setSelectedSubcategory(subCatSelected || null);
      }else{
        setSelectedSubcategory(null);
      }
    }
  }, [formData.category]);

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

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la création du produit"
        );
      }

      toast.success("Produit créé avec succès", {
        duration: 3000,
        style: { color: "#10B981" },
        position: "top-right",

      });

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création du produit", {
        duration: 3000,
        style: { color: "#EF4444" },
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div><p className="admin-eyebrow">Maison Yodi-K · Catalogue</p><h1 className="font-serif text-3xl">Un nouveau soin.</h1></div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer un nouveau produit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image" className="mb-2">
                    Image du produit *
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
                            className="object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePreview("");
                              setFormData((prev) => ({
                                ...prev,
                                imageUrl: "",
                              }));
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
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                    placeholder="Nom du produit"
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
                    min="1"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                        stock: e.target.value,
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                    placeholder="Nom de la marque"
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
                    placeholder="Code produit unique"
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
                    placeholder="Description détaillée du produit"
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
                    placeholder="Instructions d'utilisation"
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
              <Link href="/dashboard/products">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#A36F5E] hover:bg-[#A36F5E]/80 text-white"
              >
                {loading ? "Création..." : "Créer le produit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
