window.PXUTheme.jsCustomContactForm={init:function(){const o=$(".contact-form__form");if($("[data-is-required]").length){var t=$(".contact-form__list .checkbox");t.prop("required",!0),$(".contact-form__list .checkbox").on("change",function(){t.prop("required",!0),t.is(":checked")&&t.prop("required",!1)})}o.on("submit",function(o){const t=$(this),e=$(".contact-form__blocks [data-checkbox-required]",t),c=window.PXUTheme.translation.contact_form_checkbox_error,n=$(".form__error",t);let r=!0;for(let o=0;o<e.length;o++)$("input[type=checkbox]:checked",e[o]).length?r=!0:(n.html(c),r=!1);r||event.preventDefault()})},unload:function(){$(".contact-form__form").find(":submit").off()}};