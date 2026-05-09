<script setup lang="ts">
import AppDetailMetaPanel from "~/Shared/components/ui/pattern/AppDetailMetaPanel.vue";
import type {
  ProductAttributeResponse,
  ProductGalleryResponse,
  ProductResponse,
  ProductVariantResponse,
} from "~/features/products/types";

const props = defineProps<{
  product: ProductResponse;
  categoryLabel?: string;
  variants: ProductVariantResponse[];
  gallery: ProductGalleryResponse | null;
  attributes: ProductAttributeResponse | null;
  canRestore: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const { formatDateTime, enumLabel } = useAuthPresentation();
const productApi = useProductAdminApi();

const activeVariants = computed(() => props.variants.filter((variant) => variant.status === "Active").length);
const primaryImage = computed(() => props.gallery?.images.find((image) => image.isPrimary) ?? null);
const actionPending = ref<"" | "restore">("");
const actionError = ref("");

const actionErrorOpen = computed(() => actionError.value.length > 0);

const closeActionError = () => {
  actionError.value = "";
};

const restoreProduct = async () => {
  actionPending.value = "restore";
  actionError.value = "";

  try {
    await productApi.restoreProduct(props.product.id);
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to restore the product.");
  } finally {
    actionPending.value = "";
  }
};
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppConfirm
      :open="actionErrorOpen"
      title="Product action failed"
      :detail="actionError"
      cancel-label="Close"
      tone="danger"
      hide-confirm
      @cancel="closeActionError"
    />

    <AppPanel
      v-if="product.isDeleted && canRestore"
      eyebrow="Record state"
    >
      <div class="panel-action-row">
        <AppButton
          v-if="canRestore"
          :loading="actionPending === 'restore'"
          @click="restoreProduct"
        >
          Restore
        </AppButton>
      </div>
    </AppPanel>

    <AppDetailMetaPanel eyebrow="Product details">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Name</dt>
          <dd class="text-sm font-medium text-ink">{{ product.name }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Slug</dt>
          <dd class="text-sm font-medium text-ink">{{ product.slug }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Product ID</dt>
          <dd class="break-all text-xs font-mono text-smoke">{{ product.id }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Category</dt>
          <dd class="text-sm text-smoke">{{ categoryLabel || product.categoryId }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Status</dt>
          <dd class="text-sm text-smoke">{{ enumLabel(product.status) }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Deleted</dt>
          <dd class="text-sm text-smoke">{{ product.isDeleted ? "Yes" : "No" }}</dd>
        </div>
        <div v-if="product.deletedAt" class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Deleted at</dt>
          <dd class="text-sm text-smoke">{{ formatDateTime(product.deletedAt) }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Gender target</dt>
          <dd class="text-sm text-smoke">{{ enumLabel(product.genderTarget) }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Sort order</dt>
          <dd class="text-sm text-smoke">{{ product.sortOrder }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Featured</dt>
          <dd class="text-sm text-smoke">{{ product.isFeatured ? "Yes" : "No" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Short description</dt>
          <dd class="text-sm text-smoke">{{ product.content?.shortDescription || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Description</dt>
          <dd class="text-sm text-smoke">{{ product.content?.description || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Highlights</dt>
          <dd class="text-sm text-smoke">{{ product.content?.highlights || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Ingredients</dt>
          <dd class="text-sm text-smoke">{{ product.content?.ingredients || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">How to use</dt>
          <dd class="text-sm text-smoke">{{ product.content?.howToUse || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Storage guide</dt>
          <dd class="text-sm text-smoke">{{ product.content?.storageGuide || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Caution</dt>
          <dd class="text-sm text-smoke">{{ product.content?.caution || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Brand origin</dt>
          <dd class="text-sm text-smoke">{{ product.content?.brandOrigin || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Manufacture location</dt>
          <dd class="text-sm text-smoke">{{ product.content?.manufactureLocation || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Manufacture date note</dt>
          <dd class="text-sm text-smoke">{{ product.content?.manufactureDateNote || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Shelf life note</dt>
          <dd class="text-sm text-smoke">{{ product.content?.shelfLifeNote || "Not set" }}</dd>
        </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Merchandising snapshot">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Variants</dt>
          <dd class="text-sm font-medium text-ink">{{ variants.length }} total / {{ activeVariants }} active</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Gallery images</dt>
          <dd class="text-sm text-smoke">{{ gallery?.images.length ?? 0 }} linked</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Primary storefront image</dt>
          <dd class="break-all text-sm text-smoke">{{ primaryImage?.img || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Skin types</dt>
          <dd class="text-sm text-smoke">{{ attributes?.skinTypes.length ?? 0 }} assigned</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Skin concerns</dt>
          <dd class="text-sm text-smoke">{{ attributes?.skinConcerns.length ?? 0 }} assigned</dd>
        </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Search metadata">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">SEO title</dt>
          <dd class="text-sm text-smoke">{{ product.seoTitle || "Not set" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">SEO description</dt>
          <dd class="text-sm text-smoke">{{ product.seoDescription || "Not set" }}</dd>
        </div>
    </AppDetailMetaPanel>

    <AppDetailMetaPanel eyebrow="Audit trail">
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Created at</dt>
          <dd class="text-sm text-smoke">{{ formatDateTime(product.createdAt) }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Created by</dt>
          <dd class="text-sm text-smoke">{{ product.createdBy || "System" }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Updated at</dt>
          <dd class="text-sm text-smoke">{{ formatDateTime(product.updatedAt) }}</dd>
        </div>
        <div class="flex items-baseline gap-4 py-3">
          <dt class="meta-label w-40 shrink-0">Updated by</dt>
          <dd class="text-sm text-smoke">{{ product.updatedBy || "System" }}</dd>
        </div>
    </AppDetailMetaPanel>
  </div>
</template>
