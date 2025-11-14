// ==============================
// 🧭 TOGGLE MENU & SEARCH
// ==============================
const navbarNav = document.querySelector(".navbar-nav");
const hamburger = document.querySelector("#hamburger-menu");

// Toggle menu
hamburger.onclick = () => navbarNav.classList.toggle("active");

// Klik di luar menu → tutup
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
});

// Toggle search form
const searchForm = document.querySelector(".search-form");
const searchBox = document.querySelector("#search-box");
const searchButton = document.querySelector("#search-button");

searchButton.onclick = (e) => {
  e.preventDefault();
  searchForm.classList.toggle("active");
  searchBox.focus();
};

// Klik di luar search form → tutup
document.addEventListener("click", (e) => {
  if (!searchButton.contains(e.target) && !searchForm.contains(e.target)) {
    searchForm.classList.remove("active");
  }
});


// ==============================
// 🛒 PRODUK & KERANJANG
// ==============================
let allProducts = [];
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
const cartCountElement = document.getElementById("cart-count");
const cartListElement = document.getElementById("cart-items");
const cartDropdown = document.getElementById("cart-dropdown");
const navbarCart = document.getElementById("shopping-cart");
const productContainer = document.querySelector(".row");
const productContainer1 = document.querySelector(".row1");
const productContainer2 = document.querySelector(".row2");

// Ambil tiga file JSON sekaligus
Promise.all([
  fetch('productswomen.json').then(res => {
    if (!res.ok) throw new Error("Gagal ambil produk wanita");
    return res.json();
  }),
  fetch('productsmans.json').then(res => {
    if (!res.ok) throw new Error("Gagal ambil produk pria");
    return res.json();
  }),
    fetch('productsunisex.json').then(res => {
    if (!res.ok) throw new Error("Gagal ambil produk pria");
    return res.json();
  })
])
  .then(([productsWomen, productsMans, productsUnisex]) => {
    // Simpan semua produk ke satu array gabungan
    allProducts = [...productsWomen, ...productsMans, ...productsUnisex];

    // Render produk ke kontainer masing-masing
    renderProducts(productsWomen, productContainer);
    renderProducts(productsMans, productContainer1);
    renderProducts(productsUnisex, productContainer2);
  })
  .catch(err => {
    console.error(err);
    alert("Gagal memuat produk. Periksa file JSON.");
  });


function renderProducts(products, container, options = {}) {
  const { showImage = true, showTitle = true, showPrice = true, showTag = true } = options;
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>Produk tidak ditemukan.</p>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "menu-card";

    // Format harga (angka → Rp & titik)
    const formattedOriginal = product.priceOriginal
      ? "Rp" + product.priceOriginal.toLocaleString("id-ID")
      : "";
    const formattedDiscount = product.priceDiscount
      ? "Rp" + product.priceDiscount.toLocaleString("id-ID")
      : "";

    // Tag sale/sold
    let tagHTML = "";
    if (showTag) {
      if (product.tagsoldout) {
        tagHTML = `<div class="menu-card-tagsoldout">${product.tagsoldout}</div>`;
      } else if (product.tag) {
        tagHTML = `<div class="menu-card-tagsale">${product.tag}</div>`;
      }
    }

    // Isi kartu produk
    card.innerHTML = `
      <div class="menu-card-img-container">
        ${showImage ? `<img src="${product.image}" alt="${product.title}" class="menu-card-img" />` : ""}
        ${tagHTML}
        ${showTitle ? `<h3 class="menu-card-title">${product.title}</h3>` : ""}
        ${showPrice ? `<p class="menu-card-price"><span>${formattedOriginal}</span> ${formattedDiscount}</p>` : ""}
        <a href="#" class="add-to-cart"><i data-feather="shopping-cart"></i></a>
      </div>
    `;

    // Klik gambar → buka modal
    const img = card.querySelector(".menu-card-img");
    if (img) img.addEventListener("click", () => openModal(product));

    // Klik cart → tambah item
    const cartBtn = card.querySelector(".add-to-cart");
    cartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      addToCart(product);
    });

    container.appendChild(card);
  });

  feather.replace();
}


// Fungsi menambah item ke cart
function addToCart(product) {
  const existing = cartItems.find(item => item.title === product.title);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({
      ...product,
      quantity: 1
    });
  }

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  updateCartUI();
}


// Update tampilan jumlah dan daftar keranjang
function updateCartUI() {
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartCountElement.textContent = totalQty;

  cartListElement.innerHTML = "";
  let totalPrice = 0;

  cartItems.forEach(item => {
    const itemPrice = item.priceDiscount || 0;
    const itemTotal = itemPrice * item.quantity;
    totalPrice += itemTotal;

    const li = document.createElement("li");
    li.style.marginBottom = "10px";
    li.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <span>${item.title} × ${item.quantity}</span>
        <span>Rp${itemTotal.toLocaleString("id-ID")}</span>
      </div>
      <div style="font-size:13px; color:#777;">
        ${item.priceOriginal ? `<s>Rp${item.priceOriginal.toLocaleString("id-ID")}</s>` : ""} 
        → <strong>Rp${item.priceDiscount.toLocaleString("id-ID")}</strong>
      </div>
    `;
    cartListElement.appendChild(li);
  });

  // Jika ada isi keranjang
  if (cartItems.length > 0) {
    const hr = document.createElement("hr");
    cartListElement.appendChild(hr);

    const totalLi = document.createElement("li");
    totalLi.innerHTML = `<strong>Total: Rp${totalPrice.toLocaleString("id-ID")}</strong>`;
    cartListElement.appendChild(totalLi);

    // Tombol WhatsApp
    const waBtn = document.createElement("button");
    waBtn.textContent = "Kirim ke WhatsApp";
    waBtn.style.cssText = `
      margin-top:10px; padding:8px 12px;
      background:#25D366; color:white; border:none;
      border-radius:5px; cursor:pointer; width:100%; font-weight:bold;
    `;
    waBtn.addEventListener("click", () => sendToWhatsApp(totalPrice));
    cartListElement.appendChild(waBtn);

    // Tombol Kosongkan
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Kosongkan";
    clearBtn.style.cssText = `
      margin-top:10px; padding:8px 12px;
      background:#dc3545; color:white; border:none;
      border-radius:5px; cursor:pointer; width:100%; font-weight:bold;
    `;
    clearBtn.addEventListener("click", () => {
      if (confirm("Yakin ingin mengosongkan keranjang?")) {
        cartItems = [];
        localStorage.removeItem("cartItems");
        updateCartUI();
      }
    });
    cartListElement.appendChild(clearBtn);

  } else {
    cartListElement.innerHTML = "<li>Keranjang kosong</li>";
  }

  // Simpan ulang
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}


// Toggle dropdown keranjang
navbarCart.addEventListener("click", (e) => {
  e.preventDefault();
  cartDropdown.style.display = cartDropdown.style.display === "block" ? "none" : "block";
});

// Klik di luar cart → tutup
document.addEventListener("click", (e) => {
  if (!navbarCart.contains(e.target) && !cartDropdown.contains(e.target)) {
    cartDropdown.style.display = "none";
  }
});

updateCartUI();


// ==============================
// 📱 KIRIM PESAN KE WHATSAPP
// ==============================
function sendToWhatsApp(totalPrice) {
  const phoneNumber = "6282272510831"; // Nomor admin tanpa tanda +
  let message = "*Pesanan Saya di IFYStore:*\n\n";

  cartItems.forEach(item => {
    const itemPrice = item.priceDiscount || 0;
    const itemTotal = itemPrice * item.quantity;
    const originalText = item.priceOriginal
      ? `~Rp${item.priceOriginal.toLocaleString("id-ID")}~`
      : "";
    const discountText = `*Rp${item.priceDiscount.toLocaleString("id-ID")}*`;

    message += `• *${item.title}* × ${item.quantity}\n`;
    message += `  ${originalText} → ${discountText}\n`;
    message += `  *Total ${item.title}: Rp${itemTotal.toLocaleString("id-ID")}*\n\n`;
  });

  message += "----------------------------\n";
  message += `*Total Pembayaran: Rp${totalPrice.toLocaleString("id-ID")}*\n\n`;
  message += `Nama : \nAlamat : \nMetode Pembayaran : `;

  // Encode untuk URL
  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(waUrl, "_blank");
}


// ==============================
// 🔍 FITUR PENCARIAN
// ==============================
document.getElementById("search-submit").addEventListener("click", function () {
  const keyword = document.getElementById("search-box").value.toLowerCase();
  const filtered = allProducts.filter(product =>
    product.title.toLowerCase().includes(keyword) ||
    (product.description && product.description.toLowerCase().includes(keyword))
  );

  const searchResult = document.getElementById("search-result");
  searchResult.style.display = "block";

  renderProducts(filtered, document.getElementById("product-container"), {
    showImage: true,
    showTitle: true,
    showPrice: true,
    showTag: false,
  });

  searchForm.classList.remove("active");
});

// Tutup hasil pencarian
document.getElementById("close-search").addEventListener("click", function () {
  document.getElementById("search-result").style.display = "none";
});

// Klik di luar hasil pencarian → tutup
document.addEventListener("click", function (e) {
  const searchResult = document.getElementById("search-result");
  const searchBox = document.getElementById("search-box");
  const searchButton = document.getElementById("search-button");
  const searchSubmit = document.getElementById("search-submit");

  if (
    !searchResult.contains(e.target) &&
    !searchBox.contains(e.target) &&
    !searchButton.contains(e.target) &&
    !searchSubmit.contains(e.target)
  ) {
    searchResult.style.display = "none";
  }
});


// ==============================
// 🪟 MODAL PRODUK
// ==============================
function openModal(product) {
  document.getElementById("modalImage").src = product.image;
  document.getElementById("modalTitle").textContent = product.title;

  // Gunakan innerHTML agar bisa sisipkan span
  document.getElementById("modalPrice").innerHTML = `
    <span class="price-original">
      Rp${product.priceOriginal.toLocaleString("id-ID")}
    </span>
    <span class="price-discount">
      Rp${product.priceDiscount.toLocaleString("id-ID")}
    </span>
  `;

  document.getElementById("modalDescription").innerHTML =
    product.description || "Deskripsi belum tersedia.";
  document.getElementById("productModal").style.display = "block";
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

// ==============================
// 🎞️ SLIDE FOTO & VIDEO
// ==============================
const slideContainer = document.getElementById("slide-container");

fetch('galery.json')
  .then(res => res.json())
  .then(data => {
    const gallery = document.getElementById("galleryRow");
    data.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("gallery-item");

      if (item.type === "image") {
        div.innerHTML = `
          <img src="${item.src}" alt="${item.title}" />
          <p class="caption">${item.title}</p>
        `;
      } else if (item.type === "video") {
        div.innerHTML = `
          <video src="${item.src}" muted loop playsinline></video>
          <p class="caption">${item.title}</p>
        `;
      }

      div.addEventListener("click", () => openModalgalery(item));
      gallery.appendChild(div);
    });
  });

  // Setelah render selesai
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.play();  // mainkan saat terlihat
    } else {
      video.pause(); // hentikan saat di luar layar
    }
  });
}, { threshold: 0.5 }); // mainkan jika setengah video terlihat

// Terapkan observer ke semua video
setTimeout(() => {
  document.querySelectorAll(".gallery-item video").forEach(video => {
    observer.observe(video);
  });
}, 500);

// Modal logic
const modalGalery = document.getElementById("mediaModal");
const modalContent = document.getElementById("modalContent");
const closeModalBtn = document.getElementById("closeModalgalery");

function openModalgalery(item) {
  modalContent.innerHTML = "";

  let mediaElement;

  if (item.type === "image") {
    // Jika item adalah gambar
    mediaElement = document.createElement("img");
    mediaElement.src = item.src;
    mediaElement.classList.add("modal-media");
    modalContent.appendChild(mediaElement);

    // 🔍 Tombol fullscreen hanya untuk gambar
    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.classList.add("fullscreen-btn");
    fullscreenBtn.innerHTML = "⛶";
    fullscreenBtn.addEventListener("click", () => toggleFullscreen(mediaElement));
    modalContent.appendChild(fullscreenBtn);

  } else if (item.type === "video") {
    // Jika item adalah video
    mediaElement = document.createElement("video");
    mediaElement.src = item.src;
    mediaElement.controls = true;
    mediaElement.autoplay = true;
    mediaElement.classList.add("modal-media");
    modalContent.appendChild(mediaElement);
  }

  modalGalery.style.display = "flex";
}

// 🔄 Fungsi Fullscreen
function toggleFullscreen(element) {
  if (!document.fullscreenElement) {
    element.requestFullscreen().catch(err => {
      alert(`Tidak dapat masuk fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

// ❌ Tutup modal
closeModalBtn.addEventListener("click", closeModalgalery);
window.addEventListener("click", (e) => {
  if (e.target === modalGalery) closeModalgalery();
});

function closeModalgalery() {
  // Sembunyikan modal
  modalGalery.style.display = "none";

  // Hentikan semua video yang sedang berjalan
  const videos = modalContent.querySelectorAll("video");
  videos.forEach(video => {
    video.pause();
    video.currentTime = 0; // reset ke awal
  });

  // Hapus isi modal
  modalContent.innerHTML = "";
}