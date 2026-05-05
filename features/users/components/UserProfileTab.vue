<script setup lang="ts">
import type { UserResponse } from "~/features/users/types";

const props = defineProps<{
  user: UserResponse;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const usersApi = useUsersAdminApi();
const { phoneRegionOptions, genderOptions, userStatusOptions, verificationStatusOptions } = useAuthOptions();

const actionPending = ref(false);
const actionError = ref("");
const actionSuccess = ref("");

const inferPhoneRegion = (phone: string, fallback: string) => {
  const normalized = phone.trim();

  if (!normalized.startsWith("+")) {
    return fallback;
  }

  const regionMap: Array<{ prefix: string; region: string }> = [
    { prefix: "+84", region: "VN" },
    { prefix: "+65", region: "SG" },
    { prefix: "+60", region: "MY" },
    { prefix: "+66", region: "TH" },
    { prefix: "+81", region: "JP" },
    { prefix: "+82", region: "KR" },
    { prefix: "+86", region: "CN" },
    { prefix: "+852", region: "HK" },
    { prefix: "+886", region: "TW" },
    { prefix: "+91", region: "IN" },
    { prefix: "+49", region: "DE" },
    { prefix: "+33", region: "FR" },
    { prefix: "+44", region: "GB" },
    { prefix: "+61", region: "AU" },
    { prefix: "+64", region: "NZ" },
    { prefix: "+63", region: "PH" },
    { prefix: "+62", region: "ID" },
    { prefix: "+1", region: "US" },
    { prefix: "+39", region: "IT" },
    { prefix: "+34", region: "ES" },
    { prefix: "+31", region: "NL" },
    { prefix: "+46", region: "SE" },
    { prefix: "+41", region: "CH" },
    { prefix: "+48", region: "PL" },
    { prefix: "+351", region: "PT" },
    { prefix: "+55", region: "BR" },
    { prefix: "+52", region: "MX" },
    { prefix: "+7", region: "RU" },
    { prefix: "+971", region: "AE" },
    { prefix: "+966", region: "SA" },
    { prefix: "+90", region: "TR" },
    { prefix: "+27", region: "ZA" },
    { prefix: "+855", region: "KH" },
  ];

  return regionMap.find((entry) => normalized.startsWith(entry.prefix))?.region ?? fallback;
};

const toPhoneInput = (phone: string, region: string) => {
  const value = phone.trim();

  if (!value.startsWith("+")) {
    return value;
  }

  const dialCodeMap: Record<string, string> = {
    VN: "+84", US: "+1", CA: "+1", GB: "+44", AU: "+61",
    NZ: "+64", SG: "+65", MY: "+60", TH: "+66", ID: "+62",
    PH: "+63", JP: "+81", KR: "+82", CN: "+86", HK: "+852",
    TW: "+886", IN: "+91", DE: "+49", FR: "+33",
    IT: "+39", ES: "+34", NL: "+31", SE: "+46", CH: "+41",
    PL: "+48", PT: "+351", BR: "+55", MX: "+52", RU: "+7",
    AE: "+971", SA: "+966", TR: "+90", ZA: "+27", KH: "+855",
  };

  const dialCode = dialCodeMap[region];

  if (dialCode && value.startsWith(dialCode)) {
    return value.slice(dialCode.length);
  }

  return value.replace(/^\+/, "");
};

const updateForm = reactive({
  email: "",
  phone: "",
  phoneRegion: "VN",
  fullName: "",
  userName: "",
  gender: "Unknown",
  img: "",
  userStatus: "Active",
  emailStatus: "Verified",
  phoneStatus: "Unverified",
});

watch(
  () => props.user,
  (user) => {
    if (!user) return;
    const region = inferPhoneRegion(user.phone, updateForm.phoneRegion);
    updateForm.email = user.email;
    updateForm.phoneRegion = region;
    updateForm.phone = toPhoneInput(user.phone, region);
    updateForm.fullName = user.fullName;
    updateForm.userName = user.userName;
    updateForm.gender = user.gender || "Unknown";
    updateForm.img = user.img || "";
    updateForm.userStatus = user.userStatus;
    updateForm.emailStatus = user.emailStatus;
    updateForm.phoneStatus = user.phoneStatus;
  },
  { immediate: true },
);

const submitUpdate = async () => {
  actionPending.value = true;
  actionError.value = "";
  actionSuccess.value = "";

  try {
    await usersApi.updateUser(props.user.id, {
      email: updateForm.email,
      phone: updateForm.phone,
      phoneRegion: updateForm.phoneRegion,
      fullName: updateForm.fullName,
      userName: updateForm.userName,
      gender: updateForm.gender,
      img: updateForm.img,
      userStatus: updateForm.userStatus,
      emailStatus: updateForm.emailStatus,
      phoneStatus: updateForm.phoneStatus,
    });
    actionSuccess.value = "User record updated.";
    emit("refresh");
  } catch (requestError) {
    actionError.value = getProblemMessage(requestError, "Unable to update the user.");
  } finally {
    actionPending.value = false;
  }
};
</script>

<template>
  <div class="grid gap-6 content-start max-w-6xl">
    <AppPanel title="Edit user" description="Update identity fields, verification states, and account status for this user.">
      <form class="form-stack" @submit.prevent="submitUpdate">
        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="updateForm.fullName" label="Full name" />
          <AppInput v-model="updateForm.userName" label="Username (Optional)" />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppInput v-model="updateForm.email" label="Email" type="email" />
          <div class="grid gap-4 md:grid-cols-[minmax(9rem,0.55fr)_minmax(0,1fr)]">
            <AppSelect v-model="updateForm.phoneRegion" label="Phone region" :options="phoneRegionOptions" />
            <AppInput v-model="updateForm.phone" label="Phone number" type="tel" />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppSelect v-model="updateForm.gender" label="Gender" :options="genderOptions" />
          <AppSelect v-model="updateForm.userStatus" label="Account status" :options="userStatusOptions" />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <AppSelect v-model="updateForm.emailStatus" label="Email verification" :options="verificationStatusOptions" />
          <AppSelect v-model="updateForm.phoneStatus" label="Phone verification" :options="verificationStatusOptions" />
        </div>

        <AppInput v-model="updateForm.img" label="Avatar URL" />

        <div class="panel-action-row">
          <AppButton :loading="actionPending" type="submit">Save changes</AppButton>
        </div>

        <AppNotice v-if="actionSuccess" tone="success" title="Update completed">
          {{ actionSuccess }}
        </AppNotice>

        <AppNotice v-if="actionError" tone="danger" title="Update failed">
          {{ actionError }}
        </AppNotice>
      </form>
    </AppPanel>
  </div>
</template>
