'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Loading from "./loading";

const API_URL = 'http://localhost:8000/api/products';

function LoadingSkeleton({ count }) {
  const items = new Array(count).fill(0);
  return (
    <div aria-busy="true" aria-label="loading products">
      {items.map((_, i) => (
        <div key={i} className="skeleton-row" style={{display:'flex',gap:12,alignItems:'center',padding:'8px 0'}}>
          <div style={{width:48,height:48,background:'#e6e6e6',borderRadius:6}} />
          <div style={{flex:1}}>
            <div style={{height:12,background:'#eee',width:'60%',borderRadius:4,marginBottom:6}} />
            <div style={{height:10,background:'#f3f3f3',width:'30%',borderRadius:4}} />
          </div>
        </div>
      ))}
    </div>
  );
}


export default function ProductsPage() {
  const apiUrl = "http://localhost:8000/api/products";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [search, setSearch] = useState("");

  const listRef = useRef(null);

  const productsByIdRef = useRef(new Map());

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectProduct = useCallback((product) => {
    setDetailError(null);
    setSelectedProduct(null);
    setDetailLoading(true);

    if (product && product.name && product.price) {
      setSelectedProduct(product);
      setDetailLoading(false);
      return;
    }

    if (!product || !product.id) {
      setDetailError("Invalid product selected");
      setDetailLoading(false);
      return;
    }

    fetch(`${apiUrl}/${product.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setSelectedProduct(data))
      .catch((err) => setDetailError(err.message))
      .finally(() => setDetailLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);


  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;


    while (ul.firstChild) ul.removeChild(ul.firstChild);

    const map = productsByIdRef.current;
    map.clear();
    for (const p of products) {
      if (p && p.id != null) map.set(String(p.id), p);
    }

    if (loading || filteredProducts.length === 0) return;

    // build fragment
    const frag = document.createDocumentFragment();

    filteredProducts.forEach((product) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'button');
      li.style.cursor = 'pointer';
      li.style.marginBottom = '8px';
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';

      const left = document.createElement('strong');
      left.textContent = product.name ?? '';
      left.style.marginRight = '8px';

      const right = document.createElement('span');
      right.textContent = `$${Number(product.price).toFixed(2)}`;

      li.appendChild(left);
      li.appendChild(right);

      li.dataset.productId = String(product.id);

      const onClick = () => {
        const id = li.dataset.productId;
        const prod = productsByIdRef.current.get(String(id));
        handleSelectProduct(prod);
      };
      li.addEventListener('click', onClick);

      li._cleanup = () => li.removeEventListener('click', onClick);

      frag.appendChild(li);
    });

    ul.appendChild(frag);

    return () => {
      if (!ul) return;
      Array.from(ul.children).forEach((child) => {
        try {
          if (child && child._cleanup) child._cleanup();
        } catch (e) {
        }
      });
    };
  }, [filteredProducts, loading, products, handleSelectProduct]);

  return (
    <div>
      <h1>Products</h1>
      {/* Search Box */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "16px",
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      {loading && <LoadingSkeleton count={2} />}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* Use an empty UL that we'll populate via DocumentFragment */}
      <ul ref={listRef} aria-live="polite" style={{ listStyle: 'none', padding: 0, margin: 0 }} />

      {!loading && filteredProducts.length === 0 && <p>No products found.</p>}

      {selectedProduct && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "16px",
            marginTop: "24px",
            borderRadius: "8px",
            maxWidth: "400px",
          }}
        >
          <h2>Product Details</h2>
          {detailLoading && <Loading />}
          {detailError && <p style={{ color: "red" }}>Error: {detailError}</p>}
          {!detailLoading && !detailError && (
            <div>
              <p>
                <strong>ID:</strong> {selectedProduct.id}
              </p>
              <p>
                <strong>Name:</strong> {selectedProduct.name}
              </p>
              <p>
                <strong>Price:</strong> ${selectedProduct.price}
              </p>
            </div>
          )}
          <button
            style={{ marginTop: "12px" }}
            onClick={() => setSelectedProduct(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}