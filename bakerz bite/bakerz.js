// ==========================================================
//  Bakerz Bite — main JavaScript (one file, used by all pages)
//  Sections:
//   1. Footer year          6. Menu filters + sorting
//   2. Dark theme           7. Add to Cart / Buy Now buttons
//   3. Mobile menu          8. Product details popup (modal)
//   4. Helper functions     9. Order form + Thank You message
//   5. Shopping cart       10. Contact form
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

  // ---------- 1. FOOTER YEAR ----------
  var year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }


  // ---------- 2. DARK THEME ----------
  // Idea: the button adds/removes the class "dark-mode" on <body>.
  // The CSS does the colour change. localStorage remembers the choice.
  var themeButton = document.getElementById("themeToggle");

  // When the page loads, check what the user chose last time
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");

      // Save the new choice so it stays on every page
      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }
    });
  }


  // ---------- 3. MOBILE MENU ----------
  var hamburger = document.getElementById("hamburger");
  var navLinks = document.getElementById("navLinks");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("show-menu");
    });
  }


  // ---------- 4. HELPER FUNCTIONS ----------

  // "Rs. 2,600" -> 2600  (remove everything that is not a digit)
  function getPrice(text) {
    return parseInt(text.replace(/\D/g, "")) || 0;
  }

  // 2600 -> "Rs. 2,600"
  function formatPrice(number) {
    return "Rs. " + number.toLocaleString("en-US");
  }

  // Read name, price and category from a product card
  function getProductInfo(card) {
    var priceTag = card.querySelector(".card-price");
    var categoryTag = card.querySelector(".card-cat");

    return {
      name: card.querySelector("h3").textContent.trim(),
      price: priceTag ? getPrice(priceTag.textContent) : 0,   // offer cards have no price tag
      category: categoryTag ? categoryTag.textContent.trim() : ""
    };
  }

  // Small message that appears at the bottom for 2 seconds
  var toastTimer;
  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2000);
  }


  // ---------- 5. SHOPPING CART ----------
  // The cart is an array of objects: [{ name: "Croissant", price: 280, qty: 2 }, ...]
  // It is saved in localStorage as text (JSON), so it stays when the page changes.

  // 5a. Build the cart button + cart panel with JavaScript,
  //     so we do not have to copy the same HTML into every page.
  var cartHTML =
    '<button type="button" class="cart-btn cart-float" id="cartBtn" aria-label="Open cart">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
    '<span class="cart-count" id="cartCount">0</span>' +
  '</button>' +
    '<div class="cart-overlay" id="cartOverlay"></div>' +
    '<aside class="cart-drawer" id="cartDrawer">' +
      '<div class="cart-head">' +
        '<h3>Your Cart</h3>' +
        '<button type="button" class="cart-close" id="cartClose" aria-label="Close cart">&times;</button>' +
      '</div>' +
      '<div class="cart-items" id="cartItems"></div>' +
      '<div class="cart-foot">' +
        '<p class="cart-total">Total: <span id="cartTotal">Rs. 0</span></p>' +
        '<p class="cart-note" id="cartNote"></p>' +
        '<button type="button" class="btn btn-primary btn-sm btn-buy-now" id="checkoutBtn">Checkout</button>' +
        '<button type="button" class="btn btn-sm btn-add-cart" id="clearCartBtn">Clear Cart</button>' +
      '</div>' +
    '</aside>' +
    '<div class="toast" id="toast"></div>';

  document.body.insertAdjacentHTML("beforeend", cartHTML);

  
  var cartBtn = document.getElementById("cartBtn");
  var cartDrawer = document.getElementById("cartDrawer");
  var cartOverlay = document.getElementById("cartOverlay");
  var cartItems = document.getElementById("cartItems");

  // 5b. Read / save the cart
  function getCart() {
    var saved = localStorage.getItem("cart");
    if (saved) {
      return JSON.parse(saved);   // text -> array
    }
    return [];
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));   // array -> text
    renderCart();
  }

  // 5c. Add a product (if it is already in the cart, just increase quantity)
  function addToCart(name, price) {
    var cart = getCart();
    var found = false;

    cart.forEach(function (item) {
      if (item.name === name) {
        item.qty = item.qty + 1;
        found = true;
      }
    });

    if (!found) {
      cart.push({ name: name, price: price, qty: 1 });
    }

    saveCart(cart);
    showToast(name + " added to cart");
  }

  // 5d. Draw the cart on the screen
  function renderCart() {
    var cart = getCart();
    var html = "";
    var total = 0;
    var count = 0;
    var hasOffer = false;

    if (cart.length === 0) {
      html = '<p class="cart-empty">Your cart is empty.</p>';
    }

    cart.forEach(function (item, index) {
      total = total + item.price * item.qty;
      count = count + item.qty;
      if (item.price === 0) hasOffer = true;

      html +=
        '<div class="cart-item">' +
          '<div class="cart-item-info">' +
            '<h4>' + item.name + '</h4>' +
            '<p>' + (item.price > 0 ? formatPrice(item.price) : "Special offer") + '</p>' +
          '</div>' +
          '<div class="cart-qty">' +
            '<button type="button" data-action="minus" data-index="' + index + '">-</button>' +
            '<span>' + item.qty + '</span>' +
            '<button type="button" data-action="plus" data-index="' + index + '">+</button>' +
          '</div>' +
          '<button type="button" class="cart-remove" data-action="remove" data-index="' + index + '">Remove</button>' +
        '</div>';
    });

    cartItems.innerHTML = html;
    document.getElementById("cartTotal").textContent = formatPrice(total);
    document.getElementById("cartCount").textContent = count;
    document.getElementById("cartNote").textContent =
      hasOffer ? "Offer items are priced when we confirm your order." : "";
  }

  // 5e. + / - / Remove buttons inside the cart.
  //     One listener on the parent handles every button (event.target = the clicked one).
  cartItems.addEventListener("click", function (event) {
    var action = event.target.dataset.action;
    if (!action) return;

    var index = Number(event.target.dataset.index);
    var cart = getCart();

    if (action === "plus") {
      cart[index].qty = cart[index].qty + 1;
    } else if (action === "minus") {
      cart[index].qty = cart[index].qty - 1;
      if (cart[index].qty === 0) {
        cart.splice(index, 1);   // qty reached 0 -> remove the item
      }
    } else if (action === "remove") {
      cart.splice(index, 1);
    }

    saveCart(cart);
  });

  // 5f. Open / close the cart panel
  function openCart() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");
  }

  function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");
  }

  if (cartBtn) cartBtn.addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // 5g. Clear cart
  document.getElementById("clearCartBtn").addEventListener("click", function () {
    saveCart([]);
  });

  // 5h. Checkout: send the cart items to the order form
  document.getElementById("checkoutBtn").addEventListener("click", function () {
    var cart = getCart();

    if (cart.length === 0) {
      showToast("Your cart is empty");
      return;
    }

    var parts = [];
    var totalQty = 0;

    cart.forEach(function (item) {
      parts.push(item.name + " x" + item.qty);   // e.g. "Butter Croissant x2"
      totalQty = totalQty + item.qty;
    });

    localStorage.setItem("pendingOrder", JSON.stringify({
      item: parts.join(", "),
      category: "",
      qty: totalQty,
      fromCart: true
    }));

    window.location.href = "order.html";
  });

  // Show the correct cart when the page loads
  renderCart();


  // ---------- 6. MENU FILTERS + SORTING ----------
  // All filters (category, search, badge) work TOGETHER inside applyFilters().
  var productGrid = document.getElementById("productGrid");
  var searchInput = document.getElementById("searchInput");
  var sortSelect = document.getElementById("sortSelect");
  var badgeSelect = document.getElementById("badgeSelect");
  var emptyState = document.getElementById("emptyState");
  var categoryButtons = document.querySelectorAll("#catPills button");

  // Remember the ORIGINAL order of the cards (needed for "Sort: Featured")
  var allCards = productGrid ? Array.from(productGrid.querySelectorAll(".card")) : [];

  var activeCategory = "All";   // which category button is selected

  function applyFilters() {
    var searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var badge = badgeSelect ? badgeSelect.value : "all";
    var visible = 0;

    allCards.forEach(function (card) {
      var name = card.querySelector("h3").textContent.toLowerCase();
      var desc = card.querySelector(".card-desc").textContent.toLowerCase();
      var category = card.querySelector(".card-cat").textContent.trim();

      // Check 1: category
      var categoryMatch = (activeCategory === "All" || category === activeCategory);

      // Check 2: search text (looks in name, description and category)
      var searchMatch = name.includes(searchText) ||
                        desc.includes(searchText) ||
                        category.toLowerCase().includes(searchText);

      // Check 3: badge (Bestseller / New / Popular) — we look for the badge inside the card
      var badgeMatch = true;
      if (badge === "bestseller") {
        badgeMatch = card.querySelector(".pill-best") !== null;
      } else if (badge === "new") {
        badgeMatch = card.querySelector(".pill-new") !== null;
      } else if (badge === "popular") {
        badgeMatch = card.querySelector(".pill-pop") !== null;
      }

      // Show the card only if ALL three checks passed
      if (categoryMatch && searchMatch && badgeMatch) {
        card.style.display = "";
        visible++;
      } else {
        card.style.display = "none";
      }
    });

    // "No items match" message
    if (emptyState) {
      emptyState.style.display = (visible === 0) ? "block" : "none";
    }
  }

  function sortCards() {
    if (!productGrid) return;

    var sorted = allCards.slice();   // make a copy so the original order is never lost
    var choice = sortSelect.value;

    if (choice === "price-low") {
      sorted.sort(function (a, b) {
        return getProductInfo(a).price - getProductInfo(b).price;
      });
    } else if (choice === "price-high") {
      sorted.sort(function (a, b) {
        return getProductInfo(b).price - getProductInfo(a).price;
      });
    } else if (choice === "name") {
      sorted.sort(function (a, b) {
        return getProductInfo(a).name.localeCompare(getProductInfo(b).name);   // A to Z
      });
    }
    // choice === "default": the copy is still in the original order

    // Put the cards back into the grid in the new order
    sorted.forEach(function (card) {
      productGrid.appendChild(card);
    });
  }

  // Category buttons
  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      categoryButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });
      button.classList.add("active");

      activeCategory = button.dataset.cat;
      applyFilters();
    });
  });

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (badgeSelect) badgeSelect.addEventListener("change", applyFilters);
  if (sortSelect) sortSelect.addEventListener("change", sortCards);


  // ---------- 7. ADD TO CART / BUY NOW BUTTONS ----------
  // Buy Now: save what the user wants, then open the order page.
  function buyNow(name, category) {
    localStorage.setItem("pendingOrder", JSON.stringify({
      item: name,
      category: category,
      qty: 1,
      fromCart: false
    }));
    window.location.href = "order.html";
  }

  // Works for menu cards AND offer cards
  document.querySelectorAll(".card .btn-add-cart, .offer-card .btn-add-cart").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();   // do NOT open the product popup when a button is clicked

      var product = getProductInfo(button.closest(".card, .offer-card"));
      addToCart(product.name, product.price);
    });
  });

  document.querySelectorAll(".card .btn-buy-now, .offer-card .btn-buy-now").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();

      var product = getProductInfo(button.closest(".card, .offer-card"));
      buyNow(product.name, product.category);
    });
  });


  // ---------- 8. PRODUCT DETAILS POPUP (MODAL) ----------
  var modal = document.getElementById("modalOverlay");
  var modalClose = document.getElementById("modalClose");
  var modalAddCart = document.getElementById("modalAddCart");
  var modalBuyNow = document.getElementById("modalBuyNow");
  var currentProduct = null;   // remembers which product the popup is showing

  function closeModal() {
    if (modal) modal.classList.remove("active");
  }

  allCards.forEach(function (card) {
    card.addEventListener("click", function () {
      if (!modal) return;

      currentProduct = getProductInfo(card);

      // Fill the popup with this card's data
      document.getElementById("modalTitle").textContent = currentProduct.name;
      document.getElementById("modalPrice").textContent = formatPrice(currentProduct.price);
      document.getElementById("modalDesc").textContent = card.querySelector(".card-desc").textContent;

      // Copy the picture
      var image = card.querySelector("img");
      var modalMedia = document.getElementById("modalMedia");
      modalMedia.innerHTML = "";
      if (image) {
        var newImage = document.createElement("img");
        newImage.src = image.src;
        newImage.alt = currentProduct.name;
        modalMedia.appendChild(newImage);
      }

      // "Details" tags: category + badges (Bestseller, New, Popular)
      var tags = document.getElementById("modalTags");
      tags.innerHTML = '<span class="tag">' + currentProduct.category + '</span>';
      card.querySelectorAll(".pill").forEach(function (pill) {
        tags.innerHTML += '<span class="tag">' + pill.textContent + '</span>';
      });

      // We have no ingredients data, so hide that empty block
      document.getElementById("modalIngredients").parentElement.style.display = "none";

      modal.classList.add("active");
    });
  });

  // Buttons inside the popup
  if (modalAddCart) {
    modalAddCart.addEventListener("click", function () {
      addToCart(currentProduct.name, currentProduct.price);
    });
  }

  if (modalBuyNow) {
    modalBuyNow.addEventListener("click", function () {
      buyNow(currentProduct.name, currentProduct.category);
    });
  }

  // Close the popup: X button, click outside the box, or Escape key
  if (modalClose) modalClose.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal();
      closeCart();
    }
  });


  // ---------- 9. ORDER FORM + THANK YOU MESSAGE ----------
  var orderForm = document.getElementById("orderForm");

  if (orderForm) {
    var pickup = document.getElementById("fulfil-pickup");
    var delivery = document.getElementById("fulfil-delivery");
    var addressField = document.getElementById("addressField");
    var orderConfirm = document.getElementById("orderConfirm");
    var itemInput = document.getElementById("ord-item");
    var categorySelect = document.getElementById("ord-category");
    var qtyInput = document.getElementById("ord-qty");
    var dateInput = document.getElementById("ord-date");
    var pendingOrder = null;   // order coming from Buy Now or cart Checkout

    // 9a. Show the address box only for Delivery.
    //     (We use style.display because the CSS of .field would ignore the "hidden" attribute.)
    function checkDelivery() {
      addressField.style.display = delivery.checked ? "" : "none";
    }
    pickup.addEventListener("change", checkDelivery);
    delivery.addEventListener("change", checkDelivery);
    checkDelivery();

    // 9b. Do not allow past dates
    var today = new Date();
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");
    var todayText = today.getFullYear() + "-" + month + "-" + day;
    dateInput.min = todayText;

    // 9c. Fill the form with the product chosen on the menu / offers page
    var savedOrder = localStorage.getItem("pendingOrder");
    if (savedOrder) {
      pendingOrder = JSON.parse(savedOrder);
      localStorage.removeItem("pendingOrder");   // use it only once

      itemInput.value = pendingOrder.item;
      qtyInput.value = pendingOrder.qty;
      if (pendingOrder.category) {
        categorySelect.value = pendingOrder.category;
      }
    }

    // 9d. Paragraph for error messages (created here, placed above the button)
    var orderError = document.createElement("p");
    orderError.className = "form-error";
    orderForm.insertBefore(orderError, orderForm.querySelector(".order-submit"));

    // 9e. When the form is submitted
    orderForm.addEventListener("submit", function (event) {
      event.preventDefault();   // stop the page from reloading

      var name = document.getElementById("ord-name").value.trim();
      var phone = document.getElementById("ord-phone").value.trim();
      var address = document.getElementById("ord-address").value.trim();
      var category = categorySelect.value;
      var item = itemInput.value.trim();
      var qty = Number(qtyInput.value);
      var date = dateInput.value;
      var time = document.getElementById("ord-time").value;

      // Collect every mistake in a list
      var errors = [];

      if (name.length < 3) {
        errors.push("Please enter your full name.");
      }

      // Pakistani mobile number: 03 followed by 9 digits (spaces and dashes are allowed)
      var cleanPhone = phone.replace(/[\s-]/g, "");
      if (!/^03\d{9}$/.test(cleanPhone)) {
        errors.push("Enter a valid phone number like 0300-1234567.");
      }

      if (delivery.checked && address.length < 5) {
        errors.push("Please enter your delivery address.");
      }

      // A cart order can hold items from many categories, so category is only needed for single items
      var fromCart = pendingOrder && pendingOrder.fromCart;
      if (!fromCart && category === "") {
        errors.push("Please choose a category.");
      }

      if (item === "") {
        errors.push("Please enter the item you want.");
      }

      if (!(qty >= 1)) {
        errors.push("Quantity must be at least 1.");
      }

      if (date === "") {
        errors.push("Please choose a date.");
      } else if (date < todayText) {
        errors.push("The date cannot be in the past.");
      }

      if (time === "") {
        errors.push("Please select a time slot.");
      }

      // If there is any mistake: show them and stop
      if (errors.length > 0) {
        orderError.textContent = errors.join("\n");
        return;
      }

      // ---- Everything is correct ----
      orderError.textContent = "";

      // Build the Thank You message BEFORE resetting the form
      orderConfirm.textContent =
        "Thank you, " + name + "! Your " + (delivery.checked ? "delivery" : "pickup") +
        " order for " + item + " has been received. We will call you on " + phone +
        " shortly to confirm.";
      orderConfirm.hidden = false;

      // If the order came from the cart, empty the cart now
      if (fromCart) {
        saveCart([]);
      }
      pendingOrder = null;

      orderForm.reset();
      checkDelivery();
      orderConfirm.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }


  // ---------- 10. CONTACT FORM ----------
  var contactForm = document.getElementById("contactForm");
  var contactMsg = document.getElementById("contactMsg");

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = document.getElementById("cName").value.trim();
      var email = document.getElementById("cEmail").value.trim();
      var message = document.getElementById("cMsg").value.trim();

      if (name === "" || email === "" || message === "") {
        alert("Please fill in all fields.");
        return;
      }

      if (contactMsg) {
        contactMsg.textContent = "Thank you " + name + "! Your message has been sent successfully.";
      }

      contactForm.reset();
    });
  }

});

// ===== FAQ ACCORDION =====

// 1. Get all the FAQ items from the page
var faqItems = document.querySelectorAll(".faq-item");

// 2. Go through each item one by one
faqItems.forEach(function (item) {
  var question = item.querySelector(".faq-question");
  var icon = item.querySelector(".faq-icon");

  // 3. When the question is clicked...
  question.addEventListener("click", function () {

    // Remember if this item was already open
    var wasOpen = item.classList.contains("active");

    // Close every item first (so only one stays open)
    faqItems.forEach(function (other) {
      other.classList.remove("active");
      other.querySelector(".faq-icon").textContent = "+";
    });

    // If it was closed, open it. If it was open, it stays closed.
    if (!wasOpen) {
      item.classList.add("active");
      icon.textContent = "−";
    }
  });
});

// ===== PART 1: DATE AND TIME =====

var greetingText = document.getElementById("greeting");
var dateTimeText = document.getElementById("date-time");

function showDateTime() {
  var now = new Date();

  // Format the date, e.g. "Thursday, 1 October 2026"
  var date = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Format the time, e.g. "03:45:10 PM"
  var time = now.toLocaleTimeString("en-US");

  dateTimeText.textContent = date + " | " + time;

  // Greeting based on the hour (0-23)
  var hour = now.getHours();

  if (hour < 12) {
    greetingText.textContent = "Good morning!";
  } else if (hour < 18) {
    greetingText.textContent = "Good afternoon!";
  } else {
    greetingText.textContent = "Good evening!";
  }
}

showDateTime();                  // run once right away
setInterval(showDateTime, 1000); // then update every 1 second


// ===== PART 2: USER LOCATION =====

var locationText = document.getElementById("location-text");
var locationBtn = document.getElementById("location-btn");

// When the user clicks the button, ask the browser for their location
locationBtn.addEventListener("click", function () {

  // Some old browsers do not support location
  if (!navigator.geolocation) {
    locationText.textContent = "Location is not supported in this browser";
    return;
  }

  locationText.textContent = "Finding your location...";
  navigator.geolocation.getCurrentPosition(locationFound, locationError);
});

// Runs if the user allows location
function locationFound(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;

  // Free service that turns latitude/longitude into a city name
  var url = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lon + "&localityLanguage=en";

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var city = data.city || data.locality;
      locationText.textContent = "Your location: " + city + ", " + data.countryName;
    })
    .catch(function () {
      // If the city lookup fails, just show the numbers
      locationText.textContent = "Your location: " + lat.toFixed(2) + ", " + lon.toFixed(2);
    });
}

// Runs if the user blocks location or something goes wrong
function locationError() {
  locationText.textContent = "Location blocked. Please allow location access.";
}