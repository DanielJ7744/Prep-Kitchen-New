/******/ (() => {
	// webpackBootstrap
	var __webpack_exports__ = {};
	window.PXUTheme.jsAjaxCart = {
		init: function ($section) {
			// Add settings from schema to current object
			window.PXUTheme.jsAjaxCart = $.extend(this, window.PXUTheme.getSectionData($section));

			if (isScreenSizeLarge() || this.cart_action == "drawer") {
				this.initializeAjaxCart();
			} else {
				this.initializeAjaxCartOnMobile();
			}

			if (this.cart_action == "drawer") {
				this.ajaxCartDrawer = $("[data-ajax-cart-drawer]");

				$(document).on("click", "[data-ajax-cart-trigger]", function (e) {
					e.preventDefault();
					window.PXUTheme.jsAjaxCart.showDrawer();

					return false;
				});
			} else if (this.cart_action == "mini_cart") {
				this.showMiniCartOnHover();
			}

			$(document).on("click", ".ajax-submit", function (e) {
				e.preventDefault();
				const $addToCartForm = $(this).closest("form");
				window.PXUTheme.jsAjaxCart.addToCart($addToCartForm);

				return false;
			});

			$(document).on("click", "[data-ajax-cart-delete]", function (e) {
				e.preventDefault();
				const lineID = $(this).parents("[data-line-item]").data("line-item");
				console.log(lineID);
				window.PXUTheme.jsAjaxCart.removeFromCart(lineID);

				if (window.PXUTheme.jsCart) {
					window.PXUTheme.jsCart.removeFromCart(lineID);
				}

				return false;
			});

			$(document).on("click", "[data-ajax-cart-delete-all]", function (e) {
				e.preventDefault();

				window.PXUTheme.jsAjaxCart.clearCart();
			});

			$(document).on("click", "[data-ajax-cart-close]", function (e) {
				e.preventDefault();
				window.PXUTheme.jsAjaxCart.hideDrawer();
				window.PXUTheme.jsAjaxCart.hideMiniCart();

				return false;
			});
		},
		showMiniCartOnHover: function () {
			const $el = $("[data-ajax-cart-trigger]");

			$el.hover(
				function () {
					if (
						window.PXUTheme.theme_settings.header_layout == "centered" &&
						$(".header-sticky-wrapper").hasClass("is-sticky")
					) {
						$(".header-sticky-wrapper [data-ajax-cart-trigger]").addClass("show-mini-cart");
					} else {
						$el.addClass("show-mini-cart");
					}
				},
				function () {
					$el.removeClass("show-mini-cart");
				}
			);
		},
		hideMiniCart: function () {
			if (this.cart_action != "mini_cart") return false;
			const $el = $("[data-ajax-cart-close]").parents("[data-ajax-cart-trigger]");
			$el.removeClass("show-mini-cart");
		},
		toggleMiniCart: function () {
			const $el = $(".mobile-header [data-ajax-cart-trigger]");

			// Removes url to the cart page so user is not redirected
			$el.attr("href", "#");

			$el.off("touchstart").on("touchstart", function (e) {
				// If user clicks inside the element, do nothing
				if (e.target.closest("[data-ajax-cart-mini_cart]")) {
					return;
				}

				// Loads content into ajaxCart container for mobile header
				window.PXUTheme.jsAjaxCart.initializeAjaxCartOnMobile();

				// If user clicks outside the element, toggle the mini cart
				$el.toggleClass("show-mini-cart");
			});
		},
		showDrawer: function () {
			if (this.cart_action != "drawer") return false;
			this.ajaxCartDrawer.addClass("is-visible");
			$(".ajax-cart__overlay").addClass("is-visible");
			//lock screen behind cart
			// $("body").addClass("locked");

			// Get scroll top and set position of fixed
			document.body.style.top = `-${window.scrollY}px`;
			document.body.style.position = 'fixed';
		},
		hideDrawer: function () {
			if (this.cart_action != "drawer") return false;
			this.ajaxCartDrawer.removeClass("is-visible");
			$(".ajax-cart__overlay").removeClass("is-visible");
			// $("body").removeClass("locked");

			// Re scroll back when cart drawer is hidden
			const scrollY = document.body.style.top;
			const scrollYNum = parseInt(scrollY || '0') * -1;
			document.body.style.position = '';
			document.body.style.top = '';
			window.scrollBy(0, scrollYNum);
			if (scrollYNum > 0) {
				document.getElementById('header').style.position = 'fixed';
				document.getElementById('header').style.top = 0;
				document.getElementById('header').style.bottom = '';
			}
		},
		removeFromCart: function (lineID, callback) {
			$.ajax({
				type: "POST",
				url: "/cart/change.js",
				data: "quantity=0&line=" + lineID,
				dataType: "json",
				success: function (cart) {
					window.PXUTheme.jsAjaxCart.updateView();
				},
				error: function (XMLHttpRequest, textStatus) {
					var response = eval("(" + XMLHttpRequest.responseText + ")");
					response = response.description;
				},
			});
		},
		clearCart: function () {
			$.ajax({
				type: "POST",
				url: "/cart/clear.js",
				data: "",
				dataType: "json",
				success: function (cart) {
					window.PXUTheme.jsAjaxCart.updateView();
				},
				error: function (XMLHttpRequest, textStatus) {
					/* error code */
				},
			});
			return false;
		},
		initializeAjaxCart: function () {
			window.PXUTheme.asyncView
				.load(
					window.PXUTheme.routes.cart_url, // template name
					"ajax" // view name (suffix)
				)
				.done(({ html, options }) => {
					$("[data-ajax-cart-content]").html(html.content);

					typeof window.BOLD !== "undefined" &&
						typeof window.BOLD.common !== "undefined" &&
						typeof window.BOLD.common.eventEmitter !== "undefined" &&
						typeof window.BOLD.common.eventEmitter.emit !== "undefined" &&
						BOLD.common.eventEmitter.emit("BOLD_COMMON_cart_loaded");
					// Converting the currencies
					if (window.PXUTheme.currencyConverter) {
						window.PXUTheme.currencyConverter.convertCurrencies();
					}
				})
				.fail(() => {
					// some error handling
				});
		},
		initializeAjaxCartOnMobile: function () {
			this.toggleMiniCart();

			window.PXUTheme.asyncView
				.load(
					window.PXUTheme.routes.cart_url, // template name
					"ajax" // view name (suffix)
				)
				.done(({ html, options }) => {
					$(".mobile-header [data-ajax-cart-content]").html(html.content);

					typeof window.BOLD !== "undefined" &&
						typeof window.BOLD.common !== "undefined" &&
						typeof window.BOLD.common.eventEmitter !== "undefined" &&
						typeof window.BOLD.common.eventEmitter.emit !== "undefined" &&
						BOLD.common.eventEmitter.emit("BOLD_COMMON_cart_loaded");
				})
				.fail(() => {
					// some error handling
				});
		},
		addToCart: function ($addToCartForm) {
			const $addToCartBtn = $addToCartForm.find(".button--add-to-cart");

			$addToCartForm.removeClass("shopify-product-form--unselected-error");

			if ($addToCartBtn[0].hasAttribute("data-options-unselected")) {
				const cartWarning = `<p class="cart-warning__message animated bounceIn">${window.PXUTheme.translation.select_variant}</p>`;

				$(".warning").remove();

				$addToCartForm.addClass("shopify-product-form--unselected-error").find(".cart-warning").html(cartWarning);

				$addToCartBtn.removeAttr("disabled").removeClass("disabled");

				$addToCartBtn.find(".icon").removeClass("zoomOut").addClass("zoomIn");

				$addToCartBtn
					.find("span:not(.icon)")
					.text($addToCartBtn.data("label"))
					.removeClass("zoomOut")
					.addClass("zoomIn");
			} else {
				$.ajax({
					url: "/cart/add.js",
					dataType: "json",
					cache: false,
					type: "post",
					/* BOLD PO Fix
        data: $addToCartForm.serialize(),
        */
					data: window.FormData ? new FormData($addToCartForm[0]) : $addToCartForm.serialize(),
					contentType: false,
					processData: false,
					beforeSend: function () {
						var isThisFlyingPage = document.getElementsByClassName("flying-cart-helper");
						if (!(isThisFlyingPage.length > 0)) {
							$addToCartBtn.attr("disabled", "disabled").addClass("disabled");
						}
						$addToCartBtn.find("span").removeClass("fadeInDown").addClass("animated zoomOut");
					},
					success: function (product) {
						// Start Flying cart

						var isFlyingPage = document.getElementsByClassName("flying-cart-helper");

						if (isFlyingPage.length > 0) {
							let shopping_cart = document.querySelector(".header-cart__icon--desktop");
							const addedButton = document.querySelector(".button--add-to-cart__flying.active");
							let target_parent = addedButton.parentNode.parentNode.parentNode.parentNode.parentNode;

							if (screen.width < 799) {
								shopping_cart = document.querySelector(".header-cart__icon--mobile");
								target_parent = addedButton.parentNode.parentNode.parentNode.parentNode;
							}

							target_parent.classList.add("flying");
							let img = target_parent.querySelector("img");
							let flying_img = img.cloneNode();
							flying_img.classList.add("flying-img-before");
							target_parent.appendChild(flying_img);

							// Finding position of flying image

							const flying_img_pos = flying_img.getBoundingClientRect();
							const shopping_cart_pos = shopping_cart.getBoundingClientRect();

							let data = {
								left:
									shopping_cart_pos.left -
									(shopping_cart_pos.width / 2 + flying_img_pos.left + flying_img_pos.width / 2),
								top: shopping_cart_pos.bottom - flying_img_pos.bottom + 30,
							};

							flying_img.style.cssText = `
												--left : ${data.left.toFixed(2)}px;
												--top : ${data.top.toFixed(2)}px;
												`;

							if (screen.width < 799) {
								let dynamicStyles = null;

								const cssBody = `
								@keyframes fly_to_cart_mobile {
									0% {
										left: 0;
										top: 0;
										opacity: 0.5;
									}
									45%, 50% {
										left: 0;
										top: -60px;
										transform: scale(.4);
										opacity: 0.5;
									}
									100% {
										left: ${data.left.toFixed(2)}px;
										top: ${data.top.toFixed(2)}px;
										transform: scale(.1);
										opacity: 0.5;
									}
								}
							`;

								// Disable Scroll temporary
								scrollTop = window.pageYOffset || document.documentElement.scrollTop;
								scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
								window.onscroll = function() {
									window.scrollTo(scrollLeft, scrollTop);
								};
								//Disable Scroll temporary

								if (!dynamicStyles) {
									dynamicStyles = document.createElement("style");
									dynamicStyles.type = "text/css";
									document.head.appendChild(dynamicStyles);
								}

								dynamicStyles.sheet.insertRule(cssBody, dynamicStyles.length);

								// Enable Scroll Again
								setTimeout(() => {
									window.onscroll = function() {};
								}, 500)
								// Enable Scroll Again
							}

							flying_img.classList.add("flying-img");

							setTimeout(() => {
								target_parent.style.zIndex = "";
								target_parent.removeChild(flying_img);
								shopping_cart.classList.add("active");
								target_parent.classList.remove("flying");
							}, 900);

							setTimeout(() => {
								shopping_cart.classList.remove("active");
							}, 2000);
						}

						// End Flying cart

						let $el = $("[data-ajax-cart-trigger]");

						$addToCartBtn.find(".checkmark").addClass("checkmark-active");

						function addedToCart() {
							if (!isScreenSizeLarge()) {
								$el = $(".mobile-header [data-ajax-cart-trigger]");
								window.PXUTheme.scrollToTop($el);
							} else {
								$el = $("[data-ajax-cart-trigger]");
							}

							$el.addClass("show-mini-cart");

							$addToCartBtn.find("span").removeClass("fadeInDown");
						}

						window.setTimeout(function () {
							$addToCartBtn.removeAttr("disabled").removeClass("disabled");

							$addToCartBtn.find(".checkmark").removeClass("checkmark-active");

							$addToCartBtn.find(".text, .icon").removeClass("zoomOut").addClass("fadeInDown");

							$addToCartBtn.on("webkitAnimationEnd oanimationend msAnimationEnd animationend", addedToCart);
						}, 1000);
						//Hide the drawer for collection All
						let collectionAll = $(".collection-section");
						console.log("collection All", collectionAll);
						if (collectionAll == null || collectionAll.length <= 0) {
							window.PXUTheme.jsAjaxCart.showDrawer();
						}
						window.PXUTheme.jsAjaxCart.updateView();

						if (window.PXUTheme.jsCart) {
							$.ajax({
								dataType: "json",
								async: false,
								cache: false,
								dataType: "html",
								url: "/cart",
								success: function (html) {
									const cartForm = $(html).find(".cart__form");
									$(".cart__form").replaceWith(cartForm);
								},
							});
						}
					},
					error: function (XMLHttpRequest) {
						let response = eval("(" + XMLHttpRequest.responseText + ")");
						response = response.description;

						const cartWarning = `<p class="cart-warning__message animated bounceIn">${response.replace(
							"All 1 ",
							"All "
						)}</p>`;

						$(".warning").remove();

						$addToCartForm.find(".cart-warning").html(cartWarning);

						$addToCartBtn.removeAttr("disabled").removeClass("disabled");

						$addToCartBtn.find(".icon").removeClass("zoomOut").addClass("zoomIn");

						$addToCartBtn
							.find("span:not(.icon)")
							.text($addToCartBtn.data("label"))
							.removeClass("zoomOut")
							.addClass("zoomIn");
					},
				});
			}
		},
		updateView: function () {
			window.PXUTheme.asyncView
				.load(
					window.PXUTheme.routes.cart_url, // template name
					"ajax" // view name (suffix)
				)
				.done(({ html, options }) => {
					if (options.item_count > 0) {
						const itemList = $(html.content).find(".ajax-cart__list");
						const cartDetails = $(html.content).find(".ajax-cart__details-wrapper");
						const c_total = cartDetails.children(".ajax-cart__subtotal").children("span.money").text();
						const cartTotal = $.trim(c_total);

						$(".ajax-cart__list").replaceWith(itemList);
						$(".ajax-cart__details-wrapper").replaceWith(cartDetails);
						$(".ajax-cart__empty-cart-message").addClass("is-hidden");
						$(".ajax-cart__form").removeClass("is-hidden");
						$("[data-ajax-cart-trigger]").addClass("has-cart-count");
						$('[data-bind="itemCount"]').text(options.item_count);
						$('[data-total="cartTotal"]').text(cartTotal);
					} else {
						$(".ajax-cart__empty-cart-message").removeClass("is-hidden");
						$(".ajax-cart__form").addClass("is-hidden");
						$("[data-ajax-cart-trigger]").removeClass("has-cart-count");
						$('[data-bind="itemCount"]').text("0");
						$('[data-total="cartTotal"]').text(0.0);
					}

					if (window.PXUTheme.currencyConverter) {
						window.PXUTheme.currencyConverter.convertCurrencies();
					}

                  if (window.BOLD && BOLD.common && BOLD.common.eventEmitter &&
                  typeof BOLD.common.eventEmitter.emit === 'function'){
                BOLD.common.eventEmitter.emit('BOLD_COMMON_cart_loaded');
 }


				})
				.fail(() => {
					// some error handling
				});
		},
		unload: function ($section) {
			// Clear event listeners in theme editor
			$(".ajax-submit").off();
			$("[data-ajax-cart-delete]").off();
		},
	};

	/******/
})();
