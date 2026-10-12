import { authService } from "../auth/authService";

export interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  category: string;
  badge: string;
  description: string;
  storeUrl?: string;
  storeType?: string;
  packageName?: string;
  iconUrl?: string;
  technologies?: string[];
  features?: string[];
  status?: string;
  isFeatured?: boolean;
  createdAt?: string;
}

const getApiBase = () => import.meta.env.VITE_API_URL || "";

export const productsService = {
  async getProducts(): Promise<ProductItem[]> {
    const token = authService.getToken();
    const endpoint = token ? `${getApiBase()}/api/products/all` : `${getApiBase()}/api/products`;
    try {
      const res = await fetch(endpoint, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json"
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch products:", e);
    }
    return [];
  },

  async createProduct(product: Partial<ProductItem>): Promise<{ success: boolean; data?: ProductItem; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      });
      const json = await res.json();
      return json;
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to create product" };
    }
  },

  async updateProduct(id: string, product: Partial<ProductItem>): Promise<{ success: boolean; data?: ProductItem; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      });
      const json = await res.json();
      return json;
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to update product" };
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async toggleProduct(id: string): Promise<boolean> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/products/${id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
};
