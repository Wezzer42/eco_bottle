"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Eye, EyeOff, Heart, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

type WishlistItem = {
  id: string;
  addedAt: string;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
  };
};

type Props = {
  user: UserProfile;
  token: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE!;

export default function ProfileClient({ user, token }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Password change state
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Wishlist state
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const loadWishlist = useCallback(async () => {
    setWishlistLoading(true);
    try {
      const res = await fetch(`/api/backend/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      } else {
        toast.error("Failed to load wishlist");
      }
    } catch (error) {
      console.error('Wishlist load error:', error);
      toast.error("Failed to load wishlist");
    } finally {
      setWishlistLoading(false);
    }
  }, [token]);

  // Загружаем wishlist при монтировании или переключении на вкладку
  useEffect(() => {
    if (activeTab === "wishlist") {
      loadWishlist();
    }
  }, [activeTab, loadWishlist]);

  // Проверяем хэш URL для переключения на нужную вкладку
  useEffect(() => {
    if (window.location.hash === '#wishlist') {
      setActiveTab('wishlist');
    }
  }, []);

  async function removeFromWishlist(productId: number, productName: string) {
    try {
      const res = await fetch(`/api/backend/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setWishlist(prev => prev.filter(item => item.product.id !== productId));
        toast.success(`Removed "${productName}" from wishlist`, {
          icon: "💔",
        });
      } else {
        toast.error("Failed to remove item from wishlist");
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error("Failed to remove item from wishlist");
    }
  }

  async function updateProfile() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      
      if (res.ok) {
        setMessage("Profile updated successfully!");
        setEditing(false);
      } else {
        const error = await res.json();
        setMessage(error.error || "Failed to update profile");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (res.ok) {
        setMessage("Password changed successfully!");
        setChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const error = await res.json();
        setMessage(error.error || "Failed to change password");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.includes("success") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Wishlist
            {wishlist.length > 0 && (
              <span className="ml-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">
                {wishlist.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Info */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input value={user.email} disabled className="bg-gray-50" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {editing ? (
                  <div className="flex gap-2">
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                    <Button onClick={updateProfile} disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setEditing(false);
                      setName(user.name);
                    }}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <Input value={name || "Not set"} disabled className="bg-gray-50" />
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      Edit
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member since</label>
                <Input value={new Date(user.createdAt).toLocaleDateString()} disabled className="bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold">Change Password</h2>
            </div>
            
            {!changingPassword ? (
              <Button variant="outline" onClick={() => setChangingPassword(true)}>
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      className="pr-10"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={changePassword} 
                    disabled={loading || !currentPassword || newPassword.length < 8}
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setChangingPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold">My Wishlist</h2>
              {wishlist.length > 0 && (
                <span className="ml-2 bg-emerald-100 text-emerald-800 text-sm px-2 py-1 rounded-full">
                  {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {wishlistLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6">Start adding products you love to your wishlist!</p>
                <Button onClick={() => window.location.href = '/'}>
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square mb-3">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                    <p className="text-emerald-600 font-medium mb-2">
                      ${(item.product.price / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          // В будущем здесь можно добавить в корзину
                          toast.success("Added to cart!", { icon: "🛒" });
                        }}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromWishlist(item.product.id, item.product.name)}
                        className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}