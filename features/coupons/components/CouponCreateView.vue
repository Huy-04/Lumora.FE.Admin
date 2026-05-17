<script setup lang="ts">
import type { CouponCreatePage } from "~/features/coupons/composables/useCouponCreatePage";

const props = defineProps<{
  page: CouponCreatePage;
}>();

const { form, errors, errorMessage, pending, submit } = props.page;
</script>

<template>
  <div class="page-shell">
    <section class="grid max-w-6xl gap-6">
      <AppPanel eyebrow="Create coupon">
        <form class="form-stack" @submit.prevent="submit">
          <div class="grid gap-4 md:grid-cols-2">
            <AppInput
              v-model="form.code"
              label="Code"
              placeholder="SUMMER2024"
              :error="errors.code"
            />
            <AppInput
              :model-value="form.percent ? String(form.percent) : ''"
              label="Percent"
              type="number"
              placeholder="10"
              :error="errors.percent"
              @update:model-value="form.percent = Number($event)"
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput
              :model-value="form.maxDiscountAmount ? String(form.maxDiscountAmount) : ''"
              label="Max discount amount"
              type="number"
              placeholder="50000"
              :error="errors.maxDiscountAmount"
              @update:model-value="form.maxDiscountAmount = Number($event)"
            />
            <AppInput
              :model-value="form.maxRedemptions ? String(form.maxRedemptions) : ''"
              label="Max redemptions"
              type="number"
              placeholder="100"
              :error="errors.maxRedemptions"
              @update:model-value="form.maxRedemptions = Number($event)"
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <AppInput
              v-model="form.startsAt"
              label="Starts at"
              type="datetime-local"
              :error="errors.startsAt"
            />
            <AppInput
              v-model="form.expiresAt"
              label="Expires at"
              type="datetime-local"
              :error="errors.expiresAt"
            />
          </div>

          <label class="choice-row">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="h-4 w-4 rounded border-line text-ink focus:ring-ember/20"
            />
            Active on creation
          </label>

          <AppNotice v-if="errorMessage" tone="danger" title="Create coupon failed">
            {{ errorMessage }}
          </AppNotice>

          <div class="flex justify-end gap-4 border-t border-line pt-5">
            <NuxtLink class="secondary-link min-w-[9rem]" to="/coupons">
              Cancel
            </NuxtLink>
            <AppButton :loading="pending" type="submit" class="min-w-[12rem]">Create coupon</AppButton>
          </div>
        </form>
      </AppPanel>
    </section>
  </div>
</template>
