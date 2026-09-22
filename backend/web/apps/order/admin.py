from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Order,
    OrderDetail,
    OrderStatus,
    Logistics,
    PaymentType,
    OrderDiscount,
    OrderCoupon,
    OrderAddress,
)


# ============================================================
# ORDER ADDRESS INLINE
# ============================================================


class OrderAddressInline(admin.StackedInline):
    model = OrderAddress
    extra = 0
    max_num = 1
    can_delete = True
    show_change_link = True

    autocomplete_fields = (
        "user_address",
    )

    fieldsets = (
        (
            "Delivery Address",
            {
                "fields": (
                    "user_address",
                ),
            },
        ),
    )


# ============================================================
# ORDER DETAIL INLINE
# ============================================================


class OrderDetailInline(admin.StackedInline):
    model = OrderDetail
    extra = 0
    show_change_link = True
    can_delete = True

    autocomplete_fields = (
        "product",
        "variant",
        "product_sale",
        "pricing_tier",
    )

    readonly_fields = (
        "created_at",
    )

    fieldsets = (
        (
            "Order Item",
            {
                "fields": (
                    "product",
                    "variant",
                    "product_sale",
                    "pricing_tier",
                    "quantity",
                ),
            },
        ),
        (
            "Product Snapshot",
            {
                "classes": ("collapse",),
                "fields": (
                    "product_title",
                    "product_slug",
                    "product_image",
                    "brand_name",
                ),
            },
        ),
        (
            "Variant Snapshot",
            {
                "classes": ("collapse",),
                "fields": (
                    "variant_title",
                    "variant_sku",
                    "variant_barcode",
                ),
            },
        ),
        (
            "Sale Snapshot",
            {
                "classes": ("collapse",),
                "fields": (
                    "sale_type_name",
                    "unit_name",
                    "unit_symbol",
                ),
            },
        ),
        (
            "Feature Snapshot",
            {
                "classes": ("collapse",),
                "fields": (
                    "feature_snapshot",
                ),
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "unit_price",
                    "subtotal_price",
                    "final_unit_price",
                    "total_price",
                ),
            },
        ),
        (
            "Product Discount",
            {
                "fields": (
                    "product_discount_percent",
                    "product_discount_amount",
                ),
            },
        ),
        (
            "Internal Financial",
            {
                "classes": ("collapse",),
                "fields": (
                    "cost_price",
                ),
            },
        ),
        (
            "System",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                ),
            },
        ),
    )


# ============================================================
# ORDER COUPON INLINE
# ============================================================


class OrderCouponInline(admin.StackedInline):
    model = OrderCoupon
    extra = 0
    max_num = 1
    can_delete = True

    autocomplete_fields = (
        "order",
    )

    readonly_fields = (
        "created_at",
    )

    fieldsets = (
        (
            "Coupon",
            {
                "fields": (
                    "coupon",
                ),
            },
        ),
        (
            "Coupon Snapshot",
            {
                "fields": (
                    "code",
                    "percentage",
                    "amount",
                ),
            },
        ),
        (
            "System",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                ),
            },
        ),
    )


# ============================================================
# ORDER ADMIN
# ============================================================


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    # --------------------------------------------------------
    # LIST
    # --------------------------------------------------------

    list_display = (
        "id",
        "uuid_short",
        "user_display",
        "status_badge",
        "logistics",
        "payment_type",
        "subtotal_price_display",
        "product_discount_display",
        "coupon_discount_display",
        "shipping_price_display",
        "total_price_display",
        "created_at",
    )

    list_display_links = (
        "id",
        "uuid_short",
    )

    list_filter = (
        "status",
        "logistics",
        "payment_type",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "id",
        "uuid",
        "user__email",
        "user__mobile",
        "user__first_name",
        "user__last_name",
    )

    date_hierarchy = "created_at"

    ordering = (
        "-created_at",
    )

    list_per_page = 50

    # --------------------------------------------------------
    # RELATIONSHIPS
    # --------------------------------------------------------

    autocomplete_fields = (
        "status",
        "logistics",
        "payment_type",
    )

    # --------------------------------------------------------
    # QUERY OPTIMIZATION
    # --------------------------------------------------------

    def get_queryset(self, request):
        queryset = super().get_queryset(request)

        return queryset.select_related(
            "user",
            "status",
            "logistics",
            "payment_type",
        )

    # --------------------------------------------------------
    # INLINES
    # --------------------------------------------------------

    inlines = (
        OrderAddressInline,
        OrderDetailInline,
        OrderCouponInline,
    )

    # --------------------------------------------------------
    # READONLY
    # --------------------------------------------------------

    readonly_fields = (
        "uuid",
        "order_summary",
        "created_at",
        "updated_at",
    )

    # --------------------------------------------------------
    # FIELDSETS
    # --------------------------------------------------------

    fieldsets = (
        (
            "Order Information",
            {
                "fields": (
                    "uuid",
                    "user",
                    "status",
                ),
            },
        ),
        (
            "Delivery & Payment",
            {
                "fields": (
                    "logistics",
                    "payment_type",
                ),
            },
        ),
        (
            "Pricing Summary",
            {
                "fields": (
                    "subtotal_price",
                    "product_discount_amount",
                    "coupon_discount_amount",
                    "shipping_price",
                    "discount_percent",
                    "total_price",
                ),
            },
        ),
        (
            "Order Summary",
            {
                "fields": (
                    "order_summary",
                ),
            },
        ),
        (
            "System",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )

    # --------------------------------------------------------
    # ORDER SUMMARY
    # --------------------------------------------------------

    @admin.display(
        description="Order Summary",
    )
    def order_summary(self, obj):

        if not obj.pk:
            return "-"

        details = obj.details.all()

        item_count = details.count()

        total_quantity = sum(
            detail.quantity
            for detail in details
        )

        return format_html(
            """
            <div style="
                padding:16px 18px;
                background:#f8f8f8;
                border:1px solid #e5e5e5;
                border-radius:12px;
                line-height:2;
                max-width:520px;
            ">
                <div>
                    <strong>Items:</strong> {}
                </div>

                <div>
                    <strong>Total Quantity:</strong> {}
                </div>

                <div>
                    <strong>Final Total:</strong>
                    {:,}
                </div>
            </div>
            """,
            item_count,
            total_quantity,
            obj.total_price or 0,
        )

    # --------------------------------------------------------
    # DISPLAY HELPERS
    # --------------------------------------------------------

    @admin.display(
        description="UUID",
        ordering="uuid",
    )
    def uuid_short(self, obj):
        return str(obj.uuid)[:8]

    @admin.display(
        description="Customer",
        ordering="user",
    )
    def user_display(self, obj):

        if not obj.user:
            return "-"

        name = (
            f"{obj.user.first_name} {obj.user.last_name}"
        ).strip()

        if name:
            return name

        return (
            getattr(obj.user, "mobile", None)
            or getattr(obj.user, "email", None)
            or str(obj.user)
        )

    @admin.display(
        description="Status",
        ordering="status",
    )
    def status_badge(self, obj):

        if not obj.status:
            return "-"

        return format_html(
            """
            <span style="
                display:inline-block;
                padding:5px 10px;
                border-radius:999px;
                background:#f0f0f0;
                font-weight:600;
                white-space:nowrap;
            ">
                {}
            </span>
            """,
            obj.status.title,
        )

    @admin.display(
        description="Subtotal",
        ordering="subtotal_price",
    )
    def subtotal_price_display(self, obj):
        return f"{obj.subtotal_price or 0:,}"

    @admin.display(
        description="Product Discount",
        ordering="product_discount_amount",
    )
    def product_discount_display(self, obj):
        return f"{obj.product_discount_amount or 0:,}"

    @admin.display(
        description="Coupon Discount",
        ordering="coupon_discount_amount",
    )
    def coupon_discount_display(self, obj):
        return f"{obj.coupon_discount_amount or 0:,}"

    @admin.display(
        description="Shipping",
        ordering="shipping_price",
    )
    def shipping_price_display(self, obj):
        return f"{obj.shipping_price or 0:,}"

    @admin.display(
        description="Total",
        ordering="total_price",
    )
    def total_price_display(self, obj):
        return f"{obj.total_price or 0:,}"


# ============================================================
# ORDER DETAIL ADMIN
# ============================================================


@admin.register(OrderDetail)
class OrderDetailAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "order",
        "product_title",
        "variant_title",
        "quantity",
        "unit_price",
        "subtotal_price",
        "product_discount_amount",
        "final_unit_price",
        "total_price",
        "created_at",
    )

    list_display_links = (
        "id",
        "product_title",
    )

    list_filter = (
        "product_sale",
        "pricing_tier",
        "created_at",
    )

    search_fields = (
        "id",
        "product_title",
        "product_slug",
        "brand_name",
        "variant_title",
        "variant_sku",
        "variant_barcode",
        "order__uuid",
    )

    autocomplete_fields = (
        "order",
        "product",
        "variant",
        "product_sale",
        "pricing_tier",
    )

    readonly_fields = (
        "created_at",
    )

    date_hierarchy = "created_at"

    ordering = (
        "-created_at",
    )

    list_per_page = 50

    fieldsets = (
        (
            "References",
            {
                "fields": (
                    "order",
                    "product",
                    "variant",
                    "product_sale",
                    "pricing_tier",
                ),
            },
        ),
        (
            "Product Snapshot",
            {
                "fields": (
                    "product_title",
                    "product_slug",
                    "product_image",
                    "brand_name",
                ),
            },
        ),
        (
            "Variant Snapshot",
            {
                "fields": (
                    "variant_title",
                    "variant_sku",
                    "variant_barcode",
                ),
            },
        ),
        (
            "Sale Snapshot",
            {
                "fields": (
                    "sale_type_name",
                    "unit_name",
                    "unit_symbol",
                ),
            },
        ),
        (
            "Feature Snapshot",
            {
                "fields": (
                    "feature_snapshot",
                ),
            },
        ),
        (
            "Quantity",
            {
                "fields": (
                    "quantity",
                ),
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "unit_price",
                    "subtotal_price",
                    "final_unit_price",
                    "total_price",
                ),
            },
        ),
        (
            "Product Discount",
            {
                "fields": (
                    "product_discount_percent",
                    "product_discount_amount",
                ),
            },
        ),
        (
            "Internal Financial",
            {
                "classes": ("collapse",),
                "fields": (
                    "cost_price",
                ),
            },
        ),
        (
            "System",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                ),
            },
        ),
    )


# ============================================================
# ORDER DISCOUNT ADMIN
# ============================================================


@admin.register(OrderDiscount)
class OrderDiscountAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "order_detail",
        "name",
        "percentage",
        "amount",
        "created_at",
    )

    list_display_links = (
        "id",
        "name",
    )

    list_filter = (
        "created_at",
    )

    search_fields = (
        "id",
        "name",
        "order_detail__product_title",
        "product_discount__name",
    )

    autocomplete_fields = (
        "order_detail",
        "product_discount",
    )

    readonly_fields = (
        "created_at",
    )

    date_hierarchy = "created_at"

    ordering = (
        "-created_at",
    )

    fieldsets = (
        (
            "References",
            {
                "fields": (
                    "order_detail",
                    "product_discount",
                ),
            },
        ),
        (
            "Discount Snapshot",
            {
                "fields": (
                    "name",
                    "percentage",
                    "amount",
                ),
            },
        ),
        (
            "System",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                ),
            },
        ),
    )


# ============================================================
# ORDER COUPON ADMIN
# ============================================================


@admin.register(OrderCoupon)
class OrderCouponAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "order",
        "code",
        "percentage",
        "amount",
        "coupon",
        "created_at",
    )

    list_display_links = (
        "id",
        "code",
    )

    list_filter = (
        "created_at",
    )

    search_fields = (
        "id",
        "code",
        "order__uuid",
        "coupon__code",
    )

    autocomplete_fields = (
        "order",
    )

    readonly_fields = (
        "created_at",
    )

    date_hierarchy = "created_at"

    ordering = (
        "-created_at",
    )

    fieldsets = (
        (
            "References",
            {
                "fields": (
                    "order",
                    "coupon",
                ),
            },
        ),
        (
            "Coupon Snapshot",
            {
                "fields": (
                    "code",
                    "percentage",
                    "amount",
                ),
            },
        ),
        (
            "System",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                ),
            },
        ),
    )


# ============================================================
# ORDER STATUS ADMIN
# ============================================================


@admin.register(OrderStatus)
class OrderStatusAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "code",
        "title",
        "is_active",
        "created_at",
    )

    list_display_links = (
        "id",
        "title",
    )

    list_filter = (
        "is_active",
        "created_at",
    )

    search_fields = (
        "code",
        "title",
    )

    ordering = (
        "created_at",
    )

    readonly_fields = (
        "created_at",
    )

    fieldsets = (
        (
            "Status",
            {
                "fields": (
                    "code",
                    "title",
                    "is_active",
                ),
            },
        ),
        (
            "System",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                ),
            },
        ),
    )


# ============================================================
# LOGISTICS ADMIN
# ============================================================


@admin.register(Logistics)
class LogisticsAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "type",
        "price",
        "is_active",
        "created_at",
    )

    list_display_links = (
        "id",
        "title",
    )

    list_filter = (
        "type",
        "is_active",
        "created_at",
    )

    search_fields = (
        "title",
        "type",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

    fieldsets = (
        (
            "Logistics",
            {
                "fields": (
                    "type",
                    "title",
                    "price",
                    "is_active",
                ),
            },
        ),
        (
            "System",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                ),
            },
        ),
    )


# ============================================================
# PAYMENT TYPE ADMIN
# ============================================================


@admin.register(PaymentType)
class PaymentTypeAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "is_active",
        "created_at",
    )

    list_display_links = (
        "id",
        "title",
    )

    list_filter = (
        "is_active",
        "created_at",
    )

    search_fields = (
        "title",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

    fieldsets = (
        (
            "Payment Type",
            {
                "fields": (
                    "title",
                    "is_active",
                ),
            },
        ),
        (
            "System",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                ),
            },
        ),
    )