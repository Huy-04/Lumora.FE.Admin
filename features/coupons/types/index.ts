export interface CouponResponse {
  id: string;
  code: string;
  percent: number;
  maxDiscountAmount: number;
  maxRedemptions: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  isExpired: boolean;
  isUpcoming: boolean;
  remainingRedemptions: number;
  isFullyRedeemed: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponRequest {
  code: string;
  percent: number;
  maxDiscountAmount: number;
  maxRedemptions: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface UpdateCouponRequest {
  code: string;
  percent: number;
  maxDiscountAmount: number;
  maxRedemptions: number;
  startsAt: string;
  expiresAt: string;
}
