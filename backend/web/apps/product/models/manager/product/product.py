from django.db import models
from django.db.models import Count, F, Prefetch, Q
from django.utils import timezone


class ProductManager(models.Manager):

    def detail_by_slug(self, slug):
        """
        Public Product Detail.

        Loads:
        - Brand
        - Categories
        - Gallery
        - Product Features
        - Variants
        - Variant Features
        - Variant Feature Values
        - Variant Sales
        - Variant Inventory
        - Variant Pricing Tiers
        - Direct Product Sales
        - Direct Product Inventory
        - Direct Product Pricing Tiers
        - Active Product Discounts
        - Related Products
        """

        from apps.product.models.category import Category
        from apps.product.models.feature_value import FeatureValue
        from apps.product.models.product_feature import ProductFeature
        from apps.product.models.product_gallery import ProductGallery
        from apps.product.models.product_sale import ProductSale
        from apps.product.models.product_variant import ProductVariant
        from apps.product.models.pricing_tier import PricingTier
        from apps.product.models.variant_feature import VariantFeature
        from apps.product.models.discount import ProductDiscount

        # ============================================================
        # Current Time
        # ============================================================

        now = timezone.now()

        # ============================================================
        # Categories
        # ============================================================

        categories_queryset = (
            Category.objects
            .filter(
                status="published",
            )
            .only(
                "id",
                "title",
                "slug",
                "image",
                "parent_id",
            )
            .order_by(
                "title",
            )
        )

        # ============================================================
        # Gallery
        # ============================================================

        gallery_queryset = (
            ProductGallery.objects
            .filter(
                is_active=True,
            )
            .only(
                "id",
                "product_id",
                "image",
                "sort_order",
                "is_active",
            )
            .order_by(
                "sort_order",
                "id",
            )
        )

        # ============================================================
        # Feature Values
        # ============================================================

        feature_values_queryset = (
            FeatureValue.objects
            .filter(
                is_active=True,
            )
            .only(
                "id",
                "feature_id",
                "value",
                "sort_order",
                "is_active",
            )
            .order_by(
                "sort_order",
                "id",
            )
        )

        # ============================================================
        # Product Features
        # ============================================================

        product_features_queryset = (
            ProductFeature.objects
            .select_related(
                "feature",
            )
            .prefetch_related(
                Prefetch(
                    "feature_values",
                    queryset=feature_values_queryset,
                ),
            )
            .only(
                "id",
                "product_id",
                "feature_id",
                "custom_value",
                "sort_order",
                "feature__id",
                "feature__name",
                "feature__key",
                "feature__type",
                "feature__is_active",
            )
            .order_by(
                "sort_order",
                "id",
            )
        )

        # ============================================================
        # Variant Features
        # ============================================================

        variant_features_queryset = (
            VariantFeature.objects
            .select_related(
                "feature",
            )
            .prefetch_related(
                Prefetch(
                    "feature_values",
                    queryset=feature_values_queryset,
                ),
            )
            .only(
                "id",
                "variant_id",
                "feature_id",
                "created_at",
                "feature__id",
                "feature__name",
                "feature__key",
                "feature__type",
                "feature__is_active",
            )
            .order_by(
                "feature_id",
                "id",
            )
        )

        # ============================================================
        # Pricing Tiers
        # ============================================================

        pricing_tiers_queryset = (
            PricingTier.objects
            .filter(
                is_active=True,
            )
            .only(
                "id",
                "product_sale_id",
                "min_quantity",
                "max_quantity",
                "price",
                "is_active",
            )
            .order_by(
                "min_quantity",
                "id",
            )
        )

        # ============================================================
        # Sales
        # ============================================================

        sales_queryset = (
            ProductSale.objects
            .filter(
                is_active=True,
            )
            .select_related(
                "sale_type",
                "unit",
                "inventory",
            )
            .prefetch_related(
                Prefetch(
                    "pricing_tiers",
                    queryset=pricing_tiers_queryset,
                ),
            )
            .only(
                "id",
                "product_id",
                "variant_id",
                "sale_type_id",
                "unit_id",
                "purchase_price",
                "selling_price",
                "purchase_step",
                "minimum_quantity",
                "maximum_quantity",
                "is_active",
                "created_at",

                # Sale Type
                "sale_type__id",
                "sale_type__name",
                "sale_type__description",
                "sale_type__is_active",

                # Unit
                "unit__id",
                "unit__name",
                "unit__symbol",
                "unit__description",
                "unit__is_active",

                # Inventory
                "inventory__id",
                "inventory__product_sale_id",
                "inventory__quantity",
                "inventory__is_active",
            )
            .order_by(
                "id",
            )
        )

        # ============================================================
        # Active Product Discounts
        # ============================================================

        active_discounts_queryset = (
            ProductDiscount.objects
            .filter(
                is_active=True,
                starts_at__lte=now,
                expires_at__gt=now,
            )
            .only(
                "id",
                "name",
                "percentage",
                "starts_at",
                "expires_at",
                "is_active",
            )
            .order_by(
                "-percentage",
                "-created_at",
            )
        )

        # ============================================================
        # Variants
        # ============================================================

        variants_queryset = (
            ProductVariant.objects
            .filter(
                is_active=True,
            )
            .prefetch_related(
                Prefetch(
                    "features",
                    queryset=variant_features_queryset,
                ),
                Prefetch(
                    "sales",
                    queryset=sales_queryset,
                ),
            )
            .only(
                "id",
                "product_id",
                "title",
                "sku",
                "barcode",
                "is_active",
                "created_at",
            )
            .order_by(
                "id",
            )
        )

        # ============================================================
        # Product
        # ============================================================

        product = (
            self.get_queryset()
            .filter(
                status="published",
                slug=slug,
            )
            .select_related(
                "brand",
            )
            .prefetch_related(
                # Categories
                Prefetch(
                    "categories",
                    queryset=categories_queryset,
                ),

                # Gallery
                Prefetch(
                    "gallery",
                    queryset=gallery_queryset,
                ),

                # Product Features
                Prefetch(
                    "features",
                    queryset=product_features_queryset,
                ),

                # Variants
                Prefetch(
                    "variants",
                    queryset=variants_queryset,
                ),

                # Direct Product Sales
                Prefetch(
                    "sales",
                    queryset=sales_queryset,
                ),

                # Active Product Discounts
                Prefetch(
                    "discounts",
                    queryset=active_discounts_queryset,
                    to_attr="active_discounts",
                ),
            )
            .only(
                "id",
                "brand_id",
                "title",
                "cover_image",
                "slug",
                "status",
                "description",
                "pdf",
                "video_file",
                "video_url",
                "created_at",
                "updated_at",

                # Brand
                "brand__id",
                "brand__name",
                "brand__slug",
                "brand__logo",
                "brand__description",
                "brand__is_active",
            )
            .first()
        )

        # ============================================================
        # Product Not Found
        # ============================================================

        if product is None:
            return None

        # ============================================================
        # Related Products
        # ============================================================

        product_features = list(
            product.features.all()
        )

        feature_ids = {
            product_feature.feature_id
            for product_feature in product_features
            if product_feature.feature_id
        }

        feature_value_ids = set()

        for product_feature in product_features:
            feature_value_ids.update(
                product_feature.feature_values.values_list(
                    "id",
                    flat=True,
                )
            )

        category_ids = set(
            product.categories.values_list(
                "id",
                flat=True,
            )
        )

        # ============================================================
        # Related Product Filter
        # ============================================================

        related_filter = Q()

        if feature_ids:
            related_filter |= Q(
                features__feature_id__in=feature_ids,
            )

        if feature_value_ids:
            related_filter |= Q(
                features__feature_values__id__in=feature_value_ids,
            )

        if category_ids:
            related_filter |= Q(
                categories__id__in=category_ids,
            )

        # ============================================================
        # Related Products
        # ============================================================

        if related_filter:

            related_products_queryset = (
                self.get_queryset()
                .filter(
                    status="published",
                )
                .exclude(
                    pk=product.pk,
                )
                .filter(
                    related_filter,
                )
                .select_related(
                    "brand",
                )
                .prefetch_related(
                    Prefetch(
                        "categories",
                        queryset=categories_queryset,
                    ),
                    Prefetch(
                        "features",
                        queryset=product_features_queryset,
                    ),
                )
                .annotate(
                    shared_feature_values=Count(
                        "features__feature_values",
                        filter=Q(
                            features__feature_values__id__in=feature_value_ids,
                        ),
                        distinct=True,
                    ),
                    shared_features=Count(
                        "features__feature",
                        filter=Q(
                            features__feature_id__in=feature_ids,
                        ),
                        distinct=True,
                    ),
                    shared_categories=Count(
                        "categories",
                        filter=Q(
                            categories__id__in=category_ids,
                        ),
                        distinct=True,
                    ),
                )
                .order_by(
                    "-shared_feature_values",
                    "-shared_features",
                    "-shared_categories",
                    "-created_at",
                )[:8]
            )

        else:

            related_products_queryset = (
                self.get_queryset()
                .filter(
                    status="published",
                )
                .exclude(
                    pk=product.pk,
                )
                .select_related(
                    "brand",
                )
                .prefetch_related(
                    Prefetch(
                        "categories",
                        queryset=categories_queryset,
                    ),
                    Prefetch(
                        "features",
                        queryset=product_features_queryset,
                    ),
                )
                .order_by(
                    "-created_at",
                )[:8]
            )

        # ============================================================
        # Attach Related Products
        # ============================================================

        product.related_products = list(
            related_products_queryset
        )

        return product