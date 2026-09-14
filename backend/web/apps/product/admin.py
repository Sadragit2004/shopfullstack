from django import forms

from django.contrib import admin

from django.forms.models import BaseInlineFormSet

from .models import (

    Brand,

    Category,

    CategoryFeature,

    Feature,

    FeatureValue,

    Inventory,

    PricingTier,

    Product,

    ProductDiscount,

    ProductFeature,

    ProductGallery,

    ProductSale,

    ProductVariant,

    SaleType,

    Unit,

    VariantFeature,

)


# =========================================================
# Base Admin
# =========================================================

class BaseAdmin(admin.ModelAdmin):

    list_per_page = 50

    save_on_top = True


# =========================================================
# Product Feature Form
# =========================================================

class ProductFeatureForm(forms.ModelForm):

    class Meta:

        model = ProductFeature

        fields = "__all__"


# =========================================================
# Variant Feature Form
# =========================================================

class VariantFeatureForm(forms.ModelForm):

    class Meta:

        model = VariantFeature

        fields = "__all__"


# =========================================================
# Product Sale Form
# =========================================================

class ProductSaleForm(forms.ModelForm):

    class Meta:

        model = ProductSale

        fields = "__all__"

    selling_price = forms.DecimalField(

        label="قیمت فروش",

        required=True,

        min_value=0,

        max_digits=18,

        decimal_places=2,

    )


# =========================================================
# Product Sale Inline Form
# =========================================================

class ProductSaleInlineForm(forms.ModelForm):

    inventory_quantity = forms.DecimalField(

        label="موجودی",

        required=False,

        min_value=0,

        max_digits=18,

        decimal_places=3,

        widget=forms.NumberInput(

            attrs={

                "step": "0.001",

                "min": "0",

            }

        ),

    )

    inventory_is_active = forms.BooleanField(

        label="موجودی فعال",

        required=False,

        initial=True,

    )

    class Meta:

        model = ProductSale

        fields = "__all__"

    selling_price = forms.DecimalField(

        label="قیمت فروش",

        required=True,

        min_value=0,

        max_digits=18,

        decimal_places=2,

    )

    def __init__(

        self,

        *args,

        parent_variant=None,

        **kwargs,

    ):

        self.parent_variant = parent_variant

        super().__init__(*args, **kwargs)

        # -----------------------------------------
        # موجودی فعلی Sale
        # -----------------------------------------

        if self.instance.pk:

            try:

                inventory = self.instance.inventory

            except Inventory.DoesNotExist:

                inventory = None

            if inventory is not None:

                self.fields[

                    "inventory_quantity"

                ].initial = inventory.quantity

                self.fields[

                    "inventory_is_active"

                ].initial = inventory.is_active

    def _post_clean(self):

        """

        قبل از اجرای ProductSale.clean()

        محصول و Variant والد را مشخص می‌کنیم.

        """

        if self.parent_variant is not None:

            if self.parent_variant.product_id:

                self.instance.product_id = (

                    self.parent_variant.product_id

                )

            if self.parent_variant.pk:

                self.instance.variant_id = (

                    self.parent_variant.pk

                )

        super()._post_clean()


# =========================================================
# Product Sale Inline FormSet
# =========================================================

class ProductSaleInlineFormSet(BaseInlineFormSet):

    def get_form_kwargs(self, index):

        kwargs = super().get_form_kwargs(index)

        kwargs["parent_variant"] = self.instance

        return kwargs

    def save_new(self, form, commit=True):

        instance = super().save_new(

            form,

            commit=False,

        )

        instance.product_id = self.instance.product_id

        instance.variant_id = self.instance.pk

        if commit:

            instance.save()

            form.save_m2m()

        return instance

    def save_existing(

        self,

        form,

        instance,

        commit=True,

    ):

        instance.product_id = self.instance.product_id

        instance.variant_id = self.instance.pk

        return super().save_existing(

            form,

            instance,

            commit=commit,

        )


# =========================================================
# Feature Value Inline
# =========================================================

class FeatureValueInline(admin.TabularInline):

    model = FeatureValue

    extra = 1

    fields = (

        "value",

        "sort_order",

        "is_active",

    )


# =========================================================
# Brand
# =========================================================

@admin.register(Brand)
class BrandAdmin(BaseAdmin):

    list_display = (

        "name",

        "slug",

        "is_active",

        "created_at",

        "updated_at",

    )

    list_filter = (

        "is_active",

        "created_at",

    )

    search_fields = (

        "name",

        "slug",

    )

    prepopulated_fields = {

        "slug": ("name",),

    }

    ordering = (

        "-created_at",

    )


# =========================================================
# Category
# =========================================================

@admin.register(Category)
class CategoryAdmin(BaseAdmin):

    list_display = (

        "title",

        "parent",

        "status",

        "slug",

        "created_at",

    )

    list_filter = (

        "status",

        "created_at",

    )

    search_fields = (

        "title",

        "slug",

    )

    prepopulated_fields = {

        "slug": ("title",),

    }

    autocomplete_fields = (

        "parent",

    )

    ordering = (

        "-created_at",

    )


# =========================================================
# Feature
# =========================================================

@admin.register(Feature)
class FeatureAdmin(BaseAdmin):

    list_display = (

        "name",

        "key",

        "type",

        "sort_order",

        "is_active",

    )

    list_filter = (

        "type",

        "is_active",

    )

    search_fields = (

        "name",

        "key",

    )

    ordering = (

        "sort_order",

        "name",

    )

    inlines = (

        FeatureValueInline,

    )


# =========================================================
# Feature Value
# =========================================================

@admin.register(FeatureValue)
class FeatureValueAdmin(BaseAdmin):

    list_display = (

        "value",

        "feature",

        "sort_order",

        "is_active",

    )

    list_filter = (

        "feature",

        "is_active",

    )

    search_fields = (

        "value",

        "feature__name",

    )

    autocomplete_fields = (

        "feature",

    )

    ordering = (

        "feature",

        "sort_order",

        "value",

    )


# =========================================================
# Category Feature
# =========================================================

@admin.register(CategoryFeature)
class CategoryFeatureAdmin(BaseAdmin):

    list_display = (

        "category",

        "feature",

        "feature_value",

        "custom_value",

        "sort_order",

    )

    list_filter = (

        "category",

        "feature",

    )

    search_fields = (

        "category__title",

        "feature__name",

        "feature_value__value",

        "custom_value",

    )

    autocomplete_fields = (

        "category",

        "feature",

        "feature_value",

    )

    ordering = (

        "category",

        "sort_order",

    )


# =========================================================
# Product Feature Inline
# =========================================================

class ProductFeatureInline(admin.TabularInline):

    model = ProductFeature

    form = ProductFeatureForm

    extra = 1


# =========================================================
# Product Feature Admin
# =========================================================

@admin.register(ProductFeature)
class ProductFeatureAdmin(BaseAdmin):

    form = ProductFeatureForm

    list_display = (

        "product",

        "feature",

        "custom_value",

        "sort_order",

    )

    list_filter = (

        "feature",

    )

    search_fields = (

        "product__title",

        "feature__name",

        "custom_value",

    )

    autocomplete_fields = (

        "product",

        "feature",

    )

    ordering = (

        "product",

        "sort_order",

    )


# =========================================================
# Variant Feature Inline
# =========================================================

class VariantFeatureInline(admin.TabularInline):

    model = VariantFeature

    form = VariantFeatureForm

    extra = 1


# =========================================================
# Variant Feature Admin
# =========================================================

@admin.register(VariantFeature)
class VariantFeatureAdmin(BaseAdmin):

    form = VariantFeatureForm

    list_display = (

        "variant",

        "feature",

    )

    list_filter = (

        "feature",

    )

    search_fields = (

        "variant__title",

        "variant__sku",

        "feature__name",

    )

    autocomplete_fields = (

        "variant",

        "feature",

    )

    ordering = (

        "variant",

        "feature",

    )


# =========================================================
# Product Gallery Inline
# =========================================================

class ProductGalleryInline(admin.TabularInline):

    model = ProductGallery

    extra = 1

    fields = (

        "image",

        "sort_order",

        "is_active",

    )


# =========================================================
# Pricing Tier Inline
# =========================================================

class PricingTierInline(admin.TabularInline):

    model = PricingTier

    extra = 1

    fields = (

        "min_quantity",

        "max_quantity",

        "price",

        "is_active",

    )


# =========================================================
# Inventory Inline
# =========================================================

class InventoryInline(admin.StackedInline):

    model = Inventory

    extra = 0

    max_num = 1

    fields = (

        "quantity",

        "is_active",

    )


# =========================================================
# Product Sale Inline
# =========================================================

class ProductSaleInline(admin.TabularInline):

    model = ProductSale

    form = ProductSaleInlineForm

    formset = ProductSaleInlineFormSet

    # مهم:
    # فرم خالی اضافی نساز

    extra = 0

    fields = (

        "sale_type",

        "unit",

        "purchase_price",

        "selling_price",

        "purchase_step",

        "minimum_quantity",

        "maximum_quantity",

        "inventory_quantity",

        "inventory_is_active",

        "is_active",

    )

    autocomplete_fields = (

        "sale_type",

        "unit",

    )


# =========================================================
# Product Variant Inline
# =========================================================

class ProductVariantInline(admin.TabularInline):

    model = ProductVariant

    extra = 1

    fields = (

        "title",

        "sku",

        "barcode",

        "is_active",

    )


# =========================================================
# Product Admin
# =========================================================

@admin.register(Product)
class ProductAdmin(BaseAdmin):

    list_display = (

        "title",

        "brand",

        "status",

        "slug",

        "created_at",

        "updated_at",

    )

    list_filter = (

        "status",

        "brand",

        "created_at",

    )

    search_fields = (

        "title",

        "slug",

        "brand__name",

    )

    prepopulated_fields = {

        "slug": ("title",),

    }

    autocomplete_fields = (

        "brand",

    )

    filter_horizontal = (

        "categories",

    )

    inlines = (

        ProductFeatureInline,

        ProductGalleryInline,

        ProductVariantInline,

    )

    ordering = (

        "-created_at",

    )


# =========================================================
# Product Variant Admin
# =========================================================

@admin.register(ProductVariant)
class ProductVariantAdmin(BaseAdmin):

    list_display = (

        "title",

        "product",

        "sku",

        "barcode",

        "is_active",

        "created_at",

    )

    list_filter = (

        "product",

        "is_active",

        "created_at",

    )

    search_fields = (

        "title",

        "sku",

        "barcode",

        "product__title",

    )

    autocomplete_fields = (

        "product",

    )

    inlines = (

        VariantFeatureInline,

        ProductSaleInline,

    )

    ordering = (

        "-created_at",

    )

    def save_formset(

        self,

        request,

        form,

        formset,

        change,

    ):

        # =================================================
        # ProductSale داخل ProductVariant
        # =================================================

        if formset.model is ProductSale:

            parent_variant = form.instance

            # -----------------------------------------
            # ابتدا اعتبارسنجی کامل FormSet
            # -----------------------------------------

            if not formset.is_valid():

                return

            # -----------------------------------------
            # فرم‌های جدید/ویرایش‌شده
            # -----------------------------------------

            instances = formset.save(

                commit=False

            )

            # -----------------------------------------
            # ذخیره Sale ها
            # -----------------------------------------

            for inline_form, instance in zip(

                formset.forms,

                instances,

            ):

                # -------------------------------------
                # فرم خالی را کاملاً نادیده بگیر
                # -------------------------------------

                if not inline_form.has_changed():

                    continue

                # -------------------------------------
                # حذف‌شده
                # -------------------------------------

                if inline_form.cleaned_data.get(

                    "DELETE",

                    False,

                ):

                    continue

                # -------------------------------------
                # قیمت فروش باید وجود داشته باشد
                # -------------------------------------

                selling_price = (

                    inline_form.cleaned_data.get(

                        "selling_price"

                    )

                )

                if selling_price is None:

                    continue

                # -------------------------------------
                # اتصال به Product
                # -------------------------------------

                instance.product_id = (

                    parent_variant.product_id

                )

                # -------------------------------------
                # اتصال به Variant
                # -------------------------------------

                instance.variant_id = (

                    parent_variant.pk

                )

                # -------------------------------------
                # ذخیره ProductSale
                # -------------------------------------

                instance.save()

                # -------------------------------------
                # ذخیره موجودی
                # -------------------------------------

                quantity = (

                    inline_form.cleaned_data.get(

                        "inventory_quantity"

                    )

                )

                inventory_is_active = (

                    inline_form.cleaned_data.get(

                        "inventory_is_active"

                    )

                )

                if quantity is not None:

                    Inventory.objects.update_or_create(

                        product_sale=instance,

                        defaults={

                            "quantity": quantity,

                            "is_active": (

                                inventory_is_active

                                if inventory_is_active

                                is not None

                                else True

                            ),

                        },

                    )

            # -----------------------------------------
            # حذف Sale های حذف‌شده
            # -----------------------------------------

            for deleted_object in (

                formset.deleted_objects

            ):

                deleted_object.delete()

            # -----------------------------------------
            # ذخیره M2M
            # -----------------------------------------

            formset.save_m2m()

            return

        # =================================================
        # سایر Inline ها
        # =================================================

        super().save_formset(

            request,

            form,

            formset,

            change,

        )


# =========================================================
# Sale Type
# =========================================================

@admin.register(SaleType)
class SaleTypeAdmin(BaseAdmin):

    list_display = (

        "name",

        "is_active",

        "created_at",

    )

    list_filter = (

        "is_active",

        "created_at",

    )

    search_fields = (

        "name",

        "description",

    )

    ordering = (

        "name",

    )


# =========================================================
# Unit
# =========================================================

@admin.register(Unit)
class UnitAdmin(BaseAdmin):

    list_display = (

        "name",

        "symbol",

        "is_active",

        "created_at",

    )

    list_filter = (

        "is_active",

        "created_at",

    )

    search_fields = (

        "name",

        "symbol",

    )

    ordering = (

        "name",

    )


# =========================================================
# Product Sale Admin
# =========================================================

@admin.register(ProductSale)
class ProductSaleAdmin(BaseAdmin):

    form = ProductSaleForm

    list_display = (

        "product",

        "variant",

        "sale_type",

        "unit",

        "selling_price",

        "purchase_step",

        "minimum_quantity",

        "maximum_quantity",

        "is_active",

    )

    list_filter = (

        "is_active",

        "sale_type",

        "unit",

        "created_at",

    )

    search_fields = (

        "product__title",

        "variant__title",

        "variant__sku",

        "sale_type__name",

        "unit__name",

    )

    autocomplete_fields = (

        "product",

        "variant",

        "sale_type",

        "unit",

    )

    inlines = (

        PricingTierInline,

        InventoryInline,

    )

    ordering = (

        "-created_at",

    )


# =========================================================
# Pricing Tier Admin
# =========================================================

@admin.register(PricingTier)
class PricingTierAdmin(BaseAdmin):

    list_display = (

        "product_sale",

        "min_quantity",

        "max_quantity",

        "price",

        "is_active",

    )

    list_filter = (

        "is_active",

    )

    search_fields = (

        "product_sale__product__title",

        "product_sale__variant__title",

        "product_sale__variant__sku",

    )

    autocomplete_fields = (

        "product_sale",

    )

    ordering = (

        "min_quantity",

    )


# =========================================================
# Inventory Admin
# =========================================================

@admin.register(Inventory)
class InventoryAdmin(BaseAdmin):

    list_display = (

        "product_sale",

        "quantity",

        "is_active",

        "created_at",

        "updated_at",

    )

    list_filter = (

        "is_active",

        "created_at",

    )

    search_fields = (

        "product_sale__product__title",

        "product_sale__variant__title",

        "product_sale__variant__sku",

    )

    autocomplete_fields = (

        "product_sale",

    )

    ordering = (

        "-updated_at",

    )


# =========================================================
# Product Gallery Admin
# =========================================================

@admin.register(ProductGallery)
class ProductGalleryAdmin(BaseAdmin):

    list_display = (

        "product",

        "sort_order",

        "is_active",

        "created_at",

    )

    list_filter = (

        "is_active",

        "created_at",

    )

    search_fields = (

        "product__title",

    )

    autocomplete_fields = (

        "product",

    )

    ordering = (

        "product",

        "sort_order",

    )


# =========================================================
# Product Discount Admin
# =========================================================

@admin.register(ProductDiscount)
class ProductDiscountAdmin(BaseAdmin):

    list_display = (

        "name",

        "percentage",

        "starts_at",

        "expires_at",

        "is_active",

        "created_at",

    )

    list_filter = (

        "is_active",

        "starts_at",

        "expires_at",

        "created_at",

    )

    search_fields = (

        "name",

    )

    filter_horizontal = (

        "products",

    )

    ordering = (

        "-created_at",

    )

    readonly_fields = (

        "created_at",

        "updated_at",

    )

    fieldsets = (

        (

            "اطلاعات تخفیف",

            {

                "fields": (

                    "name",

                    "percentage",

                    "products",

                ),

            },

        ),

        (

            "زمان‌بندی",

            {

                "fields": (

                    "starts_at",

                    "expires_at",

                    "is_active",

                ),

            },

        ),

        (

            "اطلاعات سیستم",

            {

                "fields": (

                    "created_at",

                    "updated_at",

                ),

            },

        ),

    )