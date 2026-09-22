from decimal import (
    Decimal,
    InvalidOperation,
    ROUND_HALF_UP,
)

from django.db import models, transaction
from django.utils import timezone

from ..order import Order
from ..order_detail import OrderDetail
from ..order_discount import OrderDiscount
from ..order_coupon import OrderCoupon


class OrderService:

    MONEY_QUANT = Decimal("0.01")
    RIAL_MULTIPLIER = Decimal("10")

    # =========================================================
    # Helpers
    # =========================================================

    @staticmethod
    def money(value):
        return Decimal(value).quantize(
            OrderService.MONEY_QUANT,
            rounding=ROUND_HALF_UP,
        )

    @staticmethod
    def decimal(value):
        try:
            return Decimal(str(value))
        except (
            InvalidOperation,
            TypeError,
            ValueError,
        ):
            raise ValueError("INVALID_DECIMAL_VALUE")

    @staticmethod
    def get_product_image(product):
        if not product.cover_image:
            return ""

        try:
            return product.cover_image.url
        except (
            AttributeError,
            ValueError,
        ):
            return str(product.cover_image)

    @staticmethod
    def calculate_percentage_amount(
        *,
        price,
        percentage,
    ):
        price = Decimal(price)
        percentage = Decimal(percentage)

        if price <= 0 or percentage <= 0:
            return Decimal("0.00")

        amount = (
            price
            * percentage
            / Decimal("100")
        )

        return OrderService.money(amount)

    # =========================================================
    # Pricing Tier
    # =========================================================

    @staticmethod
    def get_pricing_tier(
        *,
        product_sale,
        quantity,
    ):
        from apps.product.models import PricingTier

        quantity = Decimal(quantity)

        return (
            PricingTier.objects
            .filter(
                product_sale=product_sale,
                is_active=True,
                min_quantity__lte=quantity,
            )
            .filter(
                models.Q(max_quantity__isnull=True)
                | models.Q(
                    max_quantity__gte=quantity
                )
            )
            .order_by(
                "-min_quantity",
                "id",
            )
            .first()
        )

    # =========================================================
    # Product Discount
    # =========================================================

    @staticmethod
    def get_product_discount(*, product):
        from apps.product.models import ProductDiscount

        now = timezone.now()

        return (
            ProductDiscount.objects
            .filter(
                products=product,
                is_active=True,
                starts_at__lte=now,
                expires_at__gte=now,
            )
            .order_by(
                "-percentage",
                "-id",
            )
            .first()
        )

    # =========================================================
    # Coupon
    # =========================================================

    @staticmethod
    def lock_coupon(*, user, coupon):
        from apps.product.models import (
            UserDiscountCoupon,
        )

        if not coupon:
            return None

        locked_coupon = (
            UserDiscountCoupon.objects
            .select_for_update()
            .filter(
                id=coupon.id,
                user=user,
                is_active=True,
                is_used=False,
                expires_at__gt=timezone.now(),
            )
            .first()
        )

        if not locked_coupon:
            raise ValueError(
                "COUPON_NOT_AVAILABLE"
            )

        return locked_coupon

    @staticmethod
    def consume_coupon(coupon):
        coupon.is_used = True
        coupon.used_at = timezone.now()

        coupon.save(
            update_fields=[
                "is_used",
                "used_at",
                "updated_at",
            ]
        )

    # =========================================================
    # Product Sales Lock
    # =========================================================

    @staticmethod
    def lock_product_sales(*, sale_ids):
        """
        ProductSaleها را مستقیم lock می‌کند.

        ابتدا خود ProductSaleها قفل می‌شوند،
        سپس روابط بدون lock خوانده می‌شوند.
        """

        from apps.product.models import ProductSale

        locked_sales = list(
            ProductSale.objects
            .select_for_update()
            .filter(
                id__in=sale_ids,
                is_active=True,
            )
            .order_by("id")
        )

        if len(locked_sales) != len(sale_ids):
            raise ValueError(
                "PRODUCT_SALE_NOT_FOUND"
            )

        locked_sale_ids = [
            sale.id
            for sale in locked_sales
        ]

        sales = (
            ProductSale.objects
            .select_related(
                "product",
                "product__brand",
                "variant",
                "sale_type",
                "unit",
            )
            .prefetch_related(
                "product__categories",
                "variant__features",
            )
            .filter(
                id__in=locked_sale_ids,
                is_active=True,
            )
        )

        sales_map = {
            sale.id: sale
            for sale in sales
        }

        if len(sales_map) != len(sale_ids):
            raise ValueError(
                "PRODUCT_SALE_NOT_FOUND"
            )

        return sales_map

    # =========================================================
    # Create Order
    # =========================================================

    @staticmethod
    @transaction.atomic
    def create_order(
        *,
        user,
        items,
        logistics=None,
        payment_type=None,
        status=None,
        coupon=None,
    ):
        """
        ایجاد سفارش اولیه.

        در مرحله ساخت اولیه فقط محصولات سفارش ثبت می‌شوند.

        logistics:
            اختیاری

        payment_type:
            اختیاری

        coupon:
            اختیاری

        آدرس:
            در این مرحله ثبت نمی‌شود.

        موجودی:
            فقط بررسی می‌شود و کاهش پیدا نمی‌کند.
        """

        from apps.product.models import Inventory

        # =====================================================
        # Basic Validation
        # =====================================================

        if not items:
            raise ValueError(
                "ORDER_ITEMS_REQUIRED"
            )

        if not status or not status.is_active:
            raise ValueError(
                "ORDER_STATUS_NOT_AVAILABLE"
            )

        # =====================================================
        # Optional Logistics Validation
        # =====================================================

        shipping_price = Decimal("0.00")

        if logistics:

            if not logistics.is_active:
                raise ValueError(
                    "LOGISTICS_NOT_AVAILABLE"
                )

            shipping_price = OrderService.money(
                logistics.price
            )

        # =====================================================
        # Optional Payment Validation
        # =====================================================

        if payment_type:

            if not payment_type.is_active:
                raise ValueError(
                    "PAYMENT_TYPE_NOT_AVAILABLE"
                )

        # =====================================================
        # Normalize Items
        # =====================================================

        normalized_items = {}

        for item in items:

            product_sale_id = item.get(
                "product_sale_id"
            )

            raw_quantity = item.get(
                "quantity"
            )

            try:
                product_sale_id = int(
                    product_sale_id
                )
            except (
                TypeError,
                ValueError,
            ):
                raise ValueError(
                    "PRODUCT_SALE_NOT_FOUND"
                )

            if product_sale_id <= 0:
                raise ValueError(
                    "PRODUCT_SALE_NOT_FOUND"
                )

            quantity = OrderService.decimal(
                raw_quantity
            )

            if quantity <= 0:
                raise ValueError(
                    "INVALID_QUANTITY"
                )

            normalized_items[
                product_sale_id
            ] = (
                normalized_items.get(
                    product_sale_id,
                    Decimal("0"),
                )
                + quantity
            )

        if not normalized_items:
            raise ValueError(
                "ORDER_ITEMS_REQUIRED"
            )

        # =====================================================
        # Product Sales
        # =====================================================

        sale_ids = list(
            normalized_items.keys()
        )

        sales_map = (
            OrderService.lock_product_sales(
                sale_ids=sale_ids,
            )
        )

        # =====================================================
        # Optional Coupon
        # =====================================================

        locked_coupon = None

        if coupon:

            locked_coupon = (
                OrderService.lock_coupon(
                    user=user,
                    coupon=coupon,
                )
            )

        # =====================================================
        # Create Order
        # =====================================================

        order = Order.objects.create(
            user=user,
            status=status,
            logistics=logistics,
            payment_type=payment_type,
            subtotal_price=Decimal("0.00"),
            product_discount_amount=Decimal(
                "0.00"
            ),
            coupon_discount_amount=Decimal(
                "0.00"
            ),
            shipping_price=shipping_price,
            discount_percent=Decimal("0.00"),
            total_price=Decimal("0.00"),
        )

        subtotal_price = Decimal("0.00")

        product_discount_amount = Decimal(
            "0.00"
        )

        # =====================================================
        # Order Details
        # =====================================================

        for (
            product_sale_id,
            quantity,
        ) in normalized_items.items():

            product_sale = sales_map.get(
                product_sale_id
            )

            if not product_sale:
                raise ValueError(
                    "PRODUCT_SALE_NOT_FOUND"
                )

            product = product_sale.product
            variant = product_sale.variant

            # -------------------------------------------------
            # Inventory Check
            # -------------------------------------------------

            inventory = (
                Inventory.objects
                .select_for_update()
                .filter(
                    product_sale=product_sale,
                    is_active=True,
                )
                .first()
            )

            if (
                inventory
                and inventory.quantity < quantity
            ):
                raise ValueError(
                    "INSUFFICIENT_STOCK"
                )

            # -------------------------------------------------
            # Pricing Tier
            # -------------------------------------------------

            pricing_tier = (
                OrderService.get_pricing_tier(
                    product_sale=product_sale,
                    quantity=quantity,
                )
            )

            if pricing_tier:

                unit_price = (
                    OrderService.money(
                        pricing_tier.price
                    )
                )

            else:

                unit_price = (
                    OrderService.money(
                        product_sale.selling_price
                    )
                )

            # -------------------------------------------------
            # Subtotal
            # -------------------------------------------------

            line_subtotal = (
                OrderService.money(
                    unit_price * quantity
                )
            )

            # -------------------------------------------------
            # Product Discount
            # -------------------------------------------------

            product_discount = (
                OrderService.get_product_discount(
                    product=product,
                )
            )

            discount_percent = Decimal(
                "0.00"
            )

            discount_amount = Decimal(
                "0.00"
            )

            if product_discount:

                discount_percent = (
                    OrderService.money(
                        product_discount.percentage
                    )
                )

                discount_amount = (
                    OrderService.calculate_percentage_amount(
                        price=line_subtotal,
                        percentage=discount_percent,
                    )
                )

            # -------------------------------------------------
            # Final Line Price
            # -------------------------------------------------

            final_line_price = (
                OrderService.money(
                    line_subtotal
                    - discount_amount
                )
            )

            if final_line_price < 0:
                final_line_price = Decimal(
                    "0.00"
                )

            final_unit_price = (
                OrderService.money(
                    final_line_price / quantity
                )
            )

            # -------------------------------------------------
            # Feature Snapshot
            # -------------------------------------------------

            feature_snapshot = []

            if variant:

                for feature in (
                    variant.features.all()
                ):

                    feature_snapshot.append(
                        {
                            "id": feature.id,
                            "name": getattr(
                                feature,
                                "name",
                                "",
                            ),
                        }
                    )

            # -------------------------------------------------
            # Brand Snapshot
            # -------------------------------------------------

            brand_name = ""

            if product.brand:
                brand_name = (
                    product.brand.name
                )

            # -------------------------------------------------
            # Variant Snapshot
            # -------------------------------------------------

            variant_title = ""
            variant_sku = ""
            variant_barcode = ""

            if variant:

                variant_title = (
                    variant.title or ""
                )

                variant_sku = (
                    variant.sku or ""
                )

                variant_barcode = (
                    variant.barcode or ""
                )

            # -------------------------------------------------
            # Order Detail
            # -------------------------------------------------

            detail = OrderDetail.objects.create(
                order=order,
                product=product,
                variant=variant,
                product_sale=product_sale,
                pricing_tier=pricing_tier,
                product_title=product.title,
                product_slug=product.slug,
                product_image=(
                    OrderService.get_product_image(
                        product
                    )
                ),
                brand_name=brand_name,
                variant_title=variant_title,
                variant_sku=variant_sku,
                variant_barcode=variant_barcode,
                sale_type_name=(
                    product_sale.sale_type.name
                ),
                unit_name=(
                    product_sale.unit.name
                ),
                unit_symbol=(
                    product_sale.unit.symbol
                ),
                feature_snapshot=(
                    feature_snapshot
                ),
                quantity=quantity,
                unit_price=unit_price,
                subtotal_price=line_subtotal,
                product_discount_percent=(
                    discount_percent
                ),
                product_discount_amount=(
                    discount_amount
                ),
                final_unit_price=(
                    final_unit_price
                ),
                total_price=(
                    final_line_price
                ),
                cost_price=(
                    product_sale.purchase_price
                ),
            )

            # -------------------------------------------------
            # Discount Snapshot
            # -------------------------------------------------

            if product_discount:

                OrderDiscount.objects.create(
                    order_detail=detail,
                    product_discount=(
                        product_discount
                    ),
                    name=product_discount.name,
                    percentage=(
                        product_discount.percentage
                    ),
                    amount=discount_amount,
                )

            # -------------------------------------------------
            # Totals
            # -------------------------------------------------

            subtotal_price += line_subtotal

            product_discount_amount += (
                discount_amount
            )

        # =====================================================
        # Optional Coupon
        # =====================================================

        coupon_discount_amount = Decimal(
            "0.00"
        )

        if locked_coupon:

            discount_base = (
                subtotal_price
                - product_discount_amount
            )

            if discount_base < 0:
                discount_base = Decimal(
                    "0.00"
                )

            coupon_discount_amount = (
                OrderService.calculate_percentage_amount(
                    price=discount_base,
                    percentage=(
                        locked_coupon.percentage
                    ),
                )
            )

            OrderCoupon.objects.create(
                order=order,
                coupon=locked_coupon,
                code=locked_coupon.code,
                percentage=(
                    locked_coupon.percentage
                ),
                amount=coupon_discount_amount,
            )

            OrderService.consume_coupon(
                locked_coupon
            )

        # =====================================================
        # Final Total
        # =====================================================

        final_products_price = (
            subtotal_price
            - product_discount_amount
            - coupon_discount_amount
        )

        if final_products_price < 0:
            final_products_price = Decimal(
                "0.00"
            )

        total_price = OrderService.money(
            final_products_price
            + shipping_price
        )

        # =====================================================
        # Discount Percent
        # =====================================================

        total_discount = (
            product_discount_amount
            + coupon_discount_amount
        )

        if subtotal_price > 0:

            discount_percent = (
                OrderService.money(
                    (
                        total_discount
                        / subtotal_price
                    )
                    * Decimal("100")
                )
            )

            if (
                discount_percent
                > Decimal("100.00")
            ):
                discount_percent = Decimal(
                    "100.00"
                )

        else:

            discount_percent = Decimal(
                "0.00"
            )

        # =====================================================
        # Update Order
        # =====================================================

        order.subtotal_price = (
            OrderService.money(
                subtotal_price
            )
        )

        order.product_discount_amount = (
            OrderService.money(
                product_discount_amount
            )
        )

        order.coupon_discount_amount = (
            OrderService.money(
                coupon_discount_amount
            )
        )

        order.shipping_price = shipping_price

        order.discount_percent = (
            discount_percent
        )

        order.total_price = total_price

        order.save(
            update_fields=[
                "subtotal_price",
                "product_discount_amount",
                "coupon_discount_amount",
                "shipping_price",
                "discount_percent",
                "total_price",
                "updated_at",
            ]
        )

        return order

    # =========================================================
    # Pricing / Payable
    # =========================================================

    @staticmethod
    def get_payable_amount(order):
        """
        مبلغ قابل پرداخت به تومان.
        """

        if order is None:
            raise ValueError(
                "ORDER_REQUIRED"
            )

        amount = (
            order.total_price
            or Decimal("0")
        )

        if amount <= 0:
            raise ValueError(
                "ORDER_AMOUNT_INVALID"
            )

        return amount

    @staticmethod
    def get_payable_amount_rial(order):
        """
        مبلغ قابل پرداخت به ریال.
        """

        amount = (
            OrderService.get_payable_amount(
                order
            )
        )

        return int(
            amount
            * OrderService.RIAL_MULTIPLIER
        )

    @staticmethod
    def get_amount_breakdown(order):
        """
        ریز مبالغ سفارش.
        """

        if order is None:
            raise ValueError(
                "ORDER_REQUIRED"
            )

        return {
            "subtotal_price": int(
                order.subtotal_price or 0
            ),
            "product_discount_amount": int(
                order.product_discount_amount
                or 0
            ),
            "coupon_discount_amount": int(
                order.coupon_discount_amount
                or 0
            ),
            "discount_percent": float(
                order.discount_percent or 0
            ),
            "shipping_price": int(
                order.shipping_price or 0
            ),
            "total_price": int(
                order.total_price or 0
            ),
            "total_price_rial": int(
                (
                    order.total_price
                    or 0
                )
                * OrderService.RIAL_MULTIPLIER
            ),
        }

    @staticmethod
    def validate_payable(order):
        """
        بررسی قابل پرداخت بودن سفارش.
        """

        if order is None:
            return False, "ORDER_REQUIRED"

        if not order.is_payable():
            return False, "ORDER_NOT_PAYABLE"

        return True, None

    @staticmethod
    def can_create_payment(order):
        """
        بررسی قبل از ایجاد پرداخت جدید.
        """

        if order is None:
            return False, "ORDER_REQUIRED"

        if not order.is_payable():
            return False, "ORDER_NOT_PAYABLE"

        from apps.peyment.models import Peyment

        if Peyment.objects.filter(
            order=order,
            status=Peyment.PeymentStatus.ACCEPTED,
        ).exists():
            return False, "ORDER_ALREADY_PAID"

        if Peyment.objects.filter(
            order=order,
            status=Peyment.PeymentStatus.PENDING,
        ).exists():
            return False, "PENDING_PAYMENT_EXISTS"

        return True, None