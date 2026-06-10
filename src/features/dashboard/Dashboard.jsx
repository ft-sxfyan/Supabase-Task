import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' or 'Products'
  const [products, setProducts] = useState([]);
  const [dbStatus, setDbStatus] = useState('Connecting...');

  // Form Input States (For Creation)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Editing States (Tracks which card is being modified inline)
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    const fetchUserDataAndProducts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error) {
          setProducts(data || []);
          setDbStatus('Operational');
        } else {
          setDbStatus('Error loading products');
          console.error(error);
        }
      }
    };

    fetchUserDataAndProducts();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // CREATE PRODUCT
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const newProduct = {
        user_id: user.id,
        title: title,
        description: description,
        price: parseFloat(price) || 0.00,
        image_url: finalImageUrl
      };

      const { data, error: dbError } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (dbError) throw dbError;

      setProducts([data[0], ...products]);
      setTitle('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      setImagePreview('');
      setActiveTab('Products');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (id, imageUrl) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this product?");
    if (!confirmDelete) return;

    try {
      // 1. Delete record entry from Supabase database table
      const { error: dbError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 2. Safely parse and remove the asset item from storage bucket if it belongs to our bucket URL
      if (imageUrl && imageUrl.includes('product-images')) {
        const pathSegments = imageUrl.split('product-images/');
        if (pathSegments.length > 1) {
          const storagePath = pathSegments[1];
          await supabase.storage.from('product-images').remove([storagePath]);
        }
      }

      // 3. Update reactive state array locally to sync frontend layout UI instantly
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // ACTIVATE EDIT INLINE MODE
  const startEditing = (product) => {
    setEditingId(product.id);
    setEditTitle(product.title);
    setEditPrice(product.price);
    setEditDescription(product.description || '');
  };

  // UPDATE PRODUCT (SAVE ACTIONS)
  const handleUpdateProduct = async (id) => {
    try {
      const updatedFields = {
        title: editTitle,
        price: parseFloat(editPrice) || 0.00,
        description: editDescription
      };

      const { error } = await supabase
        .from('products')
        .update(updatedFields)
        .eq('id', id);

      if (error) throw error;

      // Refactor global products state array data maps
      setProducts(products.map(p => p.id === id ? { ...p, ...updatedFields } : p));
      setEditingId(null); // Close layout form toggles
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen w-full bg-black text-white flex font-sans antialiased selection:bg-white/20">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-white/[0.07] bg-white/[0.01] backdrop-blur-xl flex flex-col p-6 hidden md:flex z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 shadow-inner flex items-center justify-center relative bg-gradient-to-tr from-yellow-500 via-blue-600 to-indigo-950">
            <div className="absolute inset-0 opacity-40 mix-blend-color-dodge bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200 via-blue-400 to-transparent animate-pulse"></div>
            <span className="text-white text-xs font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10">🌌</span>
          </div>
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/90">Storage Management</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('Overview')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium tracking-wide border transition-all cursor-pointer ${
              activeTab === 'Overview'
                ? 'bg-white/[0.04] text-white border-white/10 shadow-sm shadow-white/5'
                : 'text-zinc-500 border-transparent hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
          >
            Add New Product
          </button>
          
          <button
            onClick={() => setActiveTab('Products')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium tracking-wide border transition-all cursor-pointer ${
              activeTab === 'Products'
                ? 'bg-white/[0.04] text-white border-white/10 shadow-sm shadow-white/5'
                : 'text-zinc-500 border-transparent hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
          >
            Products Page ({products.length})
          </button>
        </nav>

        <div className="border-t border-white/[0.07] pt-5 flex flex-col gap-4">
          <div className="px-2 truncate">
            <p className="text-[11px] text-zinc-400 font-medium truncate">{displayName}</p>
            <p className="text-[10px] text-zinc-600 truncate mt-0.5">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="w-full py-2.5 px-4 rounded-xl text-xs bg-white text-black hover:bg-zinc-200 transition-all text-center tracking-wide font-medium cursor-pointer">
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 p-6 md:p-12 flex flex-col gap-8 max-w-6xl mx-auto w-full overflow-y-auto">
        
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-white">
              {activeTab === 'Overview' ? 'Product Creator' : 'Active Products Directory'}
            </h1>
          </div>
          <button onClick={handleLogout} className="md:hidden py-2 px-4 rounded-xl text-xs bg-white text-black font-medium">Logout</button>
        </header>

        {/* VIEW 1: CREATION FORM */}
        {activeTab === 'Overview' && (
          <section className="w-full max-w-xl mx-auto mt-2">
            <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/10 backdrop-blur-2xl shadow-2xl">
              <form onSubmit={handleProductSubmit} className="flex flex-col gap-5 text-left">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium tracking-wider uppercase text-zinc-400">Product Title</label>
                  <input type="text" placeholder="Enter short, striking title..." value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs tracking-wide focus:outline-none focus:border-white/30" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium tracking-wider uppercase text-zinc-400">Price ($)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs tracking-wide focus:outline-none focus:border-white/30" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium tracking-wider uppercase text-zinc-400">Product Details & Description</label>
                  <textarea rows="3" placeholder="Provide depth, features, specs..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs tracking-wide resize-none focus:outline-none focus:border-white/30" />
                </div>

                <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                  <label className="text-[11px] font-medium tracking-wider uppercase text-zinc-400">Product Asset Image File</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-white/[0.01] border-white/10 hover:border-white/20 transition-all overflow-hidden relative">
                    {imagePreview ? (
                      <div className="absolute inset-0 w-full h-full bg-black">
                        <img src={imagePreview} alt="Local preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <span className="text-xl mb-1 text-zinc-500">📁</span>
                        <p className="text-xs text-zinc-400 font-light">Click to browse or drag image here</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-3.5 px-6 rounded-xl font-semibold text-black bg-white hover:bg-zinc-200 transition-all text-xs tracking-widest uppercase cursor-pointer disabled:opacity-40">
                  {submitting ? 'Uploading Asset & Publishing...' : 'Publish Product'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* VIEW 2: PRODUCTS PAGE GRID (WITH EDIT/DELETE SYSTEMS) */}
        {activeTab === 'Products' && (
          <section className="w-full transition-all">
            {products.length === 0 ? (
              <div className="w-full text-center py-20 border border-dashed border-white/10 rounded-2xl text-sm text-zinc-500">
                The product showcase directory is currently empty.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="group rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden backdrop-blur-md flex flex-col transition-all duration-300 hover:border-white/20">
                    
                    {/* Image Area */}
                    <div className="w-full aspect-[4/3] overflow-hidden bg-zinc-900 border-b border-white/[0.06] relative">
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      
                      {/* Price Badge Toggle */}
                      {editingId !== product.id && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-black/80 text-white border border-white/10">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Metadata Content Card (Conditional Render if editing or viewing) */}
                    <div className="p-5 flex flex-col flex-1 text-left relative">
                      {editingId === product.id ? (
                        /* INLINE EDIT CARD CONTROLS FORM */
                        <div className="flex flex-col gap-3 w-full">
                          <input 
                            type="text" 
                            value={editTitle} 
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/20 text-white text-xs"
                            placeholder="Title"
                          />
                          <input 
                            type="number" 
                            step="0.01"
                            value={editPrice} 
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/20 text-white text-xs"
                            placeholder="Price"
                          />
                          <textarea 
                            value={editDescription} 
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/20 text-white text-xs resize-none"
                            rows="2"
                            placeholder="Description"
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <button 
                              onClick={() => handleUpdateProduct(product.id)}
                              className="flex-1 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/10 hover:bg-white/20 text-zinc-300 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* STANDARD ACTIVE DATA TEXT VIEW MODE */
                        <>
                          <h3 className="text-md font-semibold text-white tracking-wide truncate pr-16">
                            {product.title}
                          </h3>
                          <p className="text-xs text-zinc-500 font-light mt-2 line-clamp-3 leading-relaxed flex-1">
                            {product.description || "No description provided."}
                          </p>

                          {/* ACTION UTILITY BUTTONS INTERFACE GRID */}
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
                            <button 
                              onClick={() => startEditing(product)}
                              className="flex-1 py-2 px-3 rounded-xl text-[10px] font-medium uppercase tracking-wider text-zinc-400 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:text-white transition-all cursor-pointer text-center"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id, product.image_url)}
                              className="py-2 px-3 rounded-xl text-[10px] font-medium uppercase tracking-wider text-red-400/80 bg-red-500/5 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer text-center"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
};