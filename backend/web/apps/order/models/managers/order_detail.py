# apps/order/models/managers/order_detail.py

from django.db import models


class OrderDetailManager(models.Manager):

    def for_order(self, order):
        return self.filter(
            order=order,
        )

    def for_product(self, product):
        return self.filter(
            product=product,
        )

    def for_variant(self, variant):
        return self.filter(
            variant=variant,
        )

    def create_detail(
        self,
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
        from ..services.order_detail import OrderDetailService

        return OrderDetailService.create(
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
            feature_snapshot=feature_snapshot,
            quantity=quantity,
            unit_price=unit_price,
            subtotal_price=subtotal_price,
            product_discount_percent=product_discount_percent,
            product_discount_amount=product_discount_amount,
            final_unit_price=final_unit_price,
            total_price=total_price,
            cost_price=cost_price,
        )