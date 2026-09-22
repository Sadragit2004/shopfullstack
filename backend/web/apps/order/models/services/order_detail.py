
from django.db import transaction

from ..order_detail import OrderDetail


class OrderDetailService:

    @staticmethod
    @transaction.atomic
    def create(
        *,
        order,
        product,
        product_sale,
        quantity,
        unit_price,
        subtotal_price,
        final_unit_price,
        total_price,
        variant=None,
        pricing_tier=None,
        product_title,
        product_slug,
        product_image="",
        brand_name="",
        variant_title="",
        variant_sku="",
        variant_barcode="",
        sale_type_name,
        unit_name,
        unit_symbol,
        feature_snapshot=None,
        product_discount_percent=0,
        product_discount_amount=0,
        cost_price=None,
    ):
        return OrderDetail.objects.create(
            order=order,
            product=product,
            variant=variant,
            product_sale=product_sale,
            pricing_tier=pricing_tier,

            product_title=product_title,
            product_slug=product_slug,
            product_image=product_image,
            brand_name=brand_name,

            variant_title=variant_title,
            variant_sku=variant_sku,
            variant_barcode=variant_barcode,

            sale_type_name=sale_type_name,
            unit_name=unit_name,
            unit_symbol=unit_symbol,

            feature_snapshot=feature_snapshot or [],

            quantity=quantity,

            unit_price=unit_price,
            subtotal_price=subtotal_price,

            product_discount_percent=(
                product_discount_percent
            ),

            product_discount_amount=(
                product_discount_amount
            ),

            final_unit_price=final_unit_price,
            total_price=total_price,

            cost_price=cost_price,
        )

