from django import forms
from django.contrib import admin
from django.contrib.admin.widgets import FilteredSelectMultiple

from .models import (
    Brand,
    Category,
    CategoryFeature,
    Feature,
    FeatureValue,
    Inventory,
    PricingTier,
    Product,
    ProductFeature,
    ProductGallery,
    ProductSale,
    ProductVariant,
    SaleType,
    Unit,
    VariantFeature,
)


# =========================================================
# CUSTOM FORMS
# =========================================================

class ProductFeatureForm(forms.ModelForm):
    feature_values = forms.ModelMultipleChoiceField(
        queryset=FeatureValue.objects.all(),
        widget=FilteredSelectMultiple("Feature Values", is_stacked=False),
        required=False,
    )

    class Meta:
        model = ProductFeature
        fields = "__all__"


class VariantFeatureForm(forms.ModelForm):
    feature_values = forms.ModelMultipleChoiceField(
        queryset=FeatureValue.objects.all(),
        widget=FilteredSelectMultiple("Feature Values", is_stacked=False),
        required=True,
    )

    class Meta:
        model = VariantFeature
        fields = "__all__"


class ProductSaleForm(forms.ModelForm):
    class Meta:
        model = ProductSale
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if "variant" in self.fields:
            product_id = self.data.get("product") or self.initial.get("product")

            if product_id:
                self.fields["variant"].queryset = ProductVariant.objects.filter(
                    product_id=product_id
                )
            else:
                self.fields["variant"].queryset = ProductVariant.objects.none()

    def clean(self):
        cleaned_data = super().clean()

        product = cleaned_data.get("product")
        variant = cleaned_data.get("variant")

        if product and variant:
            if variant.product_id != product.id:
                self.add_error(
                    "variant",
                    "Selected variant does not belong to the selected product."
                )

        return cleaned_data


# =========================================================
# FEATURE VALUE INLINE
# =========================================================

class FeatureValueInline(admin.TabularInline):
    model = FeatureValue
    extra = 3
    fields = ("value", "sort_order", "is_active")
    ordering = ("sort_order", "value")


# =========================================================
# BRAND
# =========================================================

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at", "updated_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("name",)


# =========================================================
# CATEGORY
# =========================================================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "parent", "status", "slug", "created_at", "updated_at")
    list_filter = ("status", "created_at", "updated_at")
    search_fields = ("title", "slug", "description")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("parent",)
    ordering = ("title",)


# =========================================================
# FEATURE
# =========================================================

@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ("name", "key", "type", "is_active", "sort_order", "created_at")
    list_filter = ("type", "is_active")
    search_fields = ("name", "key")
    ordering = ("sort_order", "name")
    inlines = [FeatureValueInline]  # برای اضافه کردن چند Value


# =========================================================
# FEATURE VALUE
# =========================================================

@admin.register(FeatureValue)
class FeatureValueAdmin(admin.ModelAdmin):
    list_display = ("value", "feature", "is_active", "sort_order", "created_at")
    list_filter = ("feature", "is_active")
    search_fields = ("value", "feature__name")
    autocomplete_fields = ("feature",)
    ordering = ("feature", "sort_order", "value")


# =========================================================
# PRODUCT FEATURE
# =========================================================

class ProductFeatureInline(admin.TabularInline):
    model = ProductFeature
    form = ProductFeatureForm
    extra = 1
    autocomplete_fields = ("feature",)
    fields = ("feature", "feature_values", "custom_value", "sort_order")


@admin.register(ProductFeature)
class ProductFeatureAdmin(admin.ModelAdmin):
    form = ProductFeatureForm
    list_display = ("product", "feature", "get_feature_values", "custom_value", "sort_order", "created_at")
    list_filter = ("feature", "created_at")
    search_fields = ("product__title", "feature__name", "feature_values__value", "custom_value")
    autocomplete_fields = ("product", "feature")
    ordering = ("product", "sort_order")

    def get_feature_values(self, obj):
        return ", ".join([fv.value for fv in obj.feature_values.all()])
    get_feature_values.short_description = "Feature Values"


# =========================================================
# CATEGORY FEATURE
# =========================================================

@admin.register(CategoryFeature)
class CategoryFeatureAdmin(admin.ModelAdmin):
    list_display = ("category", "feature", "feature_value", "custom_value", "sort_order", "created_at")
    list_filter = ("feature", "created_at")
    search_fields = ("category__title", "feature__name", "feature_value__value", "custom_value")
    autocomplete_fields = ("category", "feature", "feature_value")
    ordering = ("category", "sort_order")


# =========================================================
# VARIANT FEATURE
# =========================================================

class VariantFeatureInline(admin.TabularInline):
    model = VariantFeature
    form = VariantFeatureForm
    extra = 1
    autocomplete_fields = ("feature",)
    fields = ("feature", "feature_values")


@admin.register(VariantFeature)
class VariantFeatureAdmin(admin.ModelAdmin):
    form = VariantFeatureForm
    list_display = ("variant", "feature", "get_feature_values", "created_at")
    list_filter = ("feature", "created_at")
    search_fields = ("variant__sku", "variant__title", "feature__name", "feature_values__value")
    autocomplete_fields = ("variant", "feature")
    ordering = ("variant", "feature")

    def get_feature_values(self, obj):
        return ", ".join([fv.value for fv in obj.feature_values.all()])
    get_feature_values.short_description = "Feature Values"


# =========================================================
# PRODUCT VARIANT INLINE
# =========================================================

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ("title", "sku", "barcode", "is_active")
    show_change_link = True


# =========================================================
# PRODUCT GALLERY INLINE
# =========================================================

class ProductGalleryInline(admin.TabularInline):
    model = ProductGallery
    extra = 1
    fields = ("image", "sort_order", "is_active")


# =========================================================
# PRODUCT
# =========================================================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "brand", "status", "slug", "created_at", "updated_at")
    list_filter = ("status", "brand", "categories", "created_at", "updated_at")
    search_fields = ("title", "slug", "description", "brand__name", "categories__title")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("brand", "categories")
    filter_horizontal = ("categories",)
    inlines = (ProductFeatureInline, ProductVariantInline, ProductGalleryInline)

    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "brand", "categories", "slug", "status")
        }),
        ("Media", {
            "fields": ("cover_image", "pdf", "video_file", "video_url")
        }),
        ("Description", {
            "fields": ("description",)
        }),
        ("Dates", {
            "fields": ("created_at", "updated_at")
        }),
    )

    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


# =========================================================
# PRODUCT SALE INLINE
# =========================================================

class ProductSaleInline(admin.TabularInline):
    model = ProductSale
    form = ProductSaleForm
    extra = 0
    fields = ("sale_type", "unit", "purchase_price", "selling_price", "minimum_quantity", "maximum_quantity", "is_active")
    autocomplete_fields = ("sale_type", "unit")
    show_change_link = True


# =========================================================
# PRODUCT VARIANT
# =========================================================

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("title", "product", "sku", "barcode", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("title", "sku", "barcode", "product__title")
    autocomplete_fields = ("product",)
    inlines = (VariantFeatureInline, ProductSaleInline)
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Variant Information", {
            "fields": ("product", "title", "sku", "barcode", "is_active")
        }),
        ("Dates", {
            "fields": ("created_at", "updated_at")
        }),
    )


# =========================================================
# SALE TYPE
# =========================================================

@admin.register(SaleType)
class SaleTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at", "updated_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "description")
    ordering = ("name",)


# =========================================================
# UNIT
# =========================================================

@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("name", "symbol", "is_active", "created_at", "updated_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "symbol", "description")
    ordering = ("name",)


# =========================================================
# PRODUCT SALE
# =========================================================

class PricingTierInline(admin.TabularInline):
    model = PricingTier
    extra = 1
    fields = ("min_quantity", "max_quantity", "price", "is_active")


class InventoryInline(admin.StackedInline):
    model = Inventory
    extra = 0
    max_num = 1
    fields = ("quantity", "is_active")


@admin.register(ProductSale)
class ProductSaleAdmin(admin.ModelAdmin):
    form = ProductSaleForm
    list_display = ("product", "variant", "sale_type", "unit", "selling_price", "minimum_quantity", "maximum_quantity", "is_active")
    list_filter = ("sale_type", "unit", "is_active", "created_at")
    search_fields = ("product__title", "variant__title", "variant__sku", "sale_type__name", "unit__name")
    autocomplete_fields = ("product", "variant", "sale_type", "unit")
    inlines = (PricingTierInline, InventoryInline)
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Product", {
            "fields": ("product", "variant")
        }),
        ("Sale Configuration", {
            "fields": ("sale_type", "unit", "minimum_quantity", "maximum_quantity",'purchase_step')
        }),
        ("Pricing", {
            "fields": ("purchase_price", "selling_price")
        }),
        ("Status", {
            "fields": ("is_active",)
        }),
        ("Dates", {
            "fields": ("created_at", "updated_at")
        }),
    )


# =========================================================
# PRICING TIER
# =========================================================

@admin.register(PricingTier)
class PricingTierAdmin(admin.ModelAdmin):
    list_display = ("product_sale", "min_quantity", "max_quantity", "price", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("product_sale__product__title", "product_sale__variant__title", "product_sale__variant__sku")
    autocomplete_fields = ("product_sale",)
    ordering = ("product_sale", "min_quantity")


# =========================================================
# INVENTORY
# =========================================================

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("product_sale", "quantity", "is_active", "created_at", "updated_at")
    list_filter = ("is_active", "created_at", "updated_at")
    search_fields = ("product_sale__product__title", "product_sale__variant__title", "product_sale__variant__sku", "product_sale__unit__name")
    autocomplete_fields = ("product_sale",)
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-updated_at",)


# =========================================================
# PRODUCT GALLERY
# =========================================================

@admin.register(ProductGallery)
class ProductGalleryAdmin(admin.ModelAdmin):
    list_display = ("product", "sort_order", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("product__title",)
    autocomplete_fields = ("product",)
    ordering = ("product", "sort_order")