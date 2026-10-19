export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ============== Auth ==============
export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ============== Category ==============
export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CategoryRequest {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============== Destination ==============
export interface DestinationResponse {
  id: number;
  name: string;
  province: string;
  description?: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DestinationRequest {
  name: string;
  province: string;
  description?: string;
  image?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============== Tour ==============
export type TourStatus = 'ACTIVE' | 'HIDDEN' | 'INACTIVE';

export interface TourResponse {
  id: number;
  code: string;
  name: string;
  coverImage?: string;
  destinationName?: string;
  categoryName?: string;
  originalPrice?: number;
  adultPrice: number;
  childPrice: number;
  averageRating: number;
  reviewCount: number;
  durationDays: number;
  featured: boolean;
  status: TourStatus;
}

export interface ItineraryResponse {
  id: number;
  dayNumber: number;
  title: string;
  description?: string;
}

export interface TourDetailResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  destinationId?: number;
  destinationName?: string;
  durationDays: number;
  durationNights: number;
  originalPrice?: number;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  maxPeople: number;
  averageRating: number;
  reviewCount: number;
  status?: TourStatus;
  featured?: boolean;
  departureDates: string[];
  images: string[];
  itineraries: ItineraryResponse[];
}

export interface TourImageRequest {
  imageUrl: string;
  cover?: boolean;
  sortOrder?: number;
}

export interface ItineraryRequest {
  dayNumber: number;
  title: string;
  description?: string;
}

export interface TourCreateRequest {
  code: string;
  name: string;
  categoryId: number;
  destinationId: number;
  description?: string;
  durationDays: number;
  durationNights: number;
  originalPrice?: number;
  adultPrice: number;
  childPrice: number;
  infantPrice?: number;
  maxPeople: number;
  status?: 'ACTIVE' | 'HIDDEN' | 'INACTIVE';
  featured?: boolean;
  images: TourImageRequest[];
  itineraries: ItineraryRequest[];
}

export interface TourUpdateRequest {
  name: string;
  description?: string;
  durationDays: number;
  durationNights: number;
  originalPrice?: number;
  adultPrice: number;
  childPrice: number;
  infantPrice?: number;
  maxPeople: number;
  status?: 'ACTIVE' | 'HIDDEN' | 'INACTIVE';
  featured?: boolean;
}

export interface TourSearchParams {
  keyword?: string;
  categoryId?: number;
  destinationId?: number;
  minPrice?: number;
  maxPrice?: number;
  durationDays?: number;
  departureDate?: string;
  featured?: boolean;
  discount?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

// ============== Schedule ==============
export interface ScheduleResponse {
  id: number;
  tourId: number;
  tourName: string;
  departureDate: string;
  returnDate: string;
  totalSeats: number;
  availableSeats: number;
  status: 'OPEN' | 'CLOSED';
}

export interface ScheduleRequest {
  tourId: number;
  departureDate: string;
  returnDate: string;
  totalSeats: number;
  status?: 'OPEN' | 'CLOSED';
}

// ============== Booking ==============
export interface GuestRequest {
  fullName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  email?: string;
  identityNumber?: string;
}

export interface GuestResponse {
  id: number;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  email?: string;
  identityNumber?: string;
}

export interface PaymentResponse {
  id: number;
  bookingId: number;
  bookingCode: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  transactionRef?: string;
  paidAt?: string;
}

export interface BookingRequest {
  tourId: number;
  scheduleId: number;
  adultCount: number;
  childCount?: number;
  infantCount?: number;
  couponCode?: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
  guests: GuestRequest[];
}

export interface BookingResponse {
  id: number;
  bookingCode: string;
  tourId: number;
  tourName: string;
  tourCode: string;
  departureDate: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  totalPeople: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  guests: GuestResponse[];
  payments: PaymentResponse[];
}

// ============== Review ==============
export interface ReviewRequest {
  bookingId: number;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  tourId: number;
  tourName: string;
  userName: string;
  rating: number;
  comment?: string;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
}

// ============== Coupon ==============
export interface CouponResponse {
  id: number;
  code: string;
  name: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  maxUsage: number;
  usedCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CouponRequest {
  code: string;
  name: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  maxUsage: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============== Admin / Dashboard ==============
export interface DashboardResponse {
  totalCustomers: number;
  totalTours: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
}

// ============== Home ==============
export interface HomeResponse {
  featuredTours: TourResponse[];
  newTours: TourResponse[];
  discountedTours: TourResponse[];
  topRatedTours: TourResponse[];
  popularDestinations: DestinationResponse[];
  categories: CategoryResponse[];
}

// ============== Tour Q&A ==============
export type ActiveStatus = 'ACTIVE' | 'INACTIVE';
export type QaSortBy = 'NEWEST' | 'OLDEST' | 'MOST_REPLIES' | 'HAS_ANSWER' | 'UPDATED';
export type QaQuickRange = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

export interface TourQaResponse {
  id: number;
  tourId: number;
  tourName: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  question: string;
  status: ActiveStatus;
  replyCount: number;
  createdAt: string;
  updatedAt?: string;
  replies?: QaReplyResponse[];
}

export interface TourQaRequest {
  tourId: number;
  question: string;
}

export interface QaReplyResponse {
  id: number;
  qaId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  reply: string;
  isAnswer: boolean;
  status: ActiveStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface QaReplyRequest {
  qaId: number;
  reply: string;
}

export interface TourQaSearchParams {
  keyword?: string;
  tourId?: number;
  userId?: number;
  status?: ActiveStatus;
  hasReply?: boolean;
  hasAcceptedAnswer?: boolean;
  quickRange?: QaQuickRange;
  fromDate?: string;
  toDate?: string;
  sortBy?: QaSortBy;
  page?: number;
  size?: number;
}
