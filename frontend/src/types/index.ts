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
  /** Trạng thái tài khoản: ACTIVE | LOCKED. */
  status?: 'ACTIVE' | 'LOCKED';
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
}

export type RoleName = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface UserCreateRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  status?: 'ACTIVE' | 'LOCKED';
  roles: RoleName[];
}

export interface UserUpdateRequest {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  status?: 'ACTIVE' | 'LOCKED';
  roles?: RoleName[];
  /** Để trống = giữ nguyên mật khẩu hiện tại. */
  password?: string;
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
  transportModeId?: number | null;
  transportModeName?: string | null;
  departurePointId?: number | null;
  departurePointName?: string | null;
  airlineId?: number | null;
  airlineName?: string | null;
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
  transports?: TourTransportSummary[];
  images: string[];
  itineraries: ItineraryResponse[];
}

export interface TourTransportSummary {
  transportModeId: number;
  transportModeName: string;
  transportModeIcon?: string | null;
  departurePointId?: number | null;
  departurePointName?: string | null;
  airlineId?: number | null;
  airlineName?: string | null;
  airlineCode?: string | null;
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
  transportModeId?: number | null;
  departurePointId?: number | null;
  airlineId?: number | null;
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
  images?: TourImageRequest[];
  itineraries?: ItineraryRequest[];
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
  // Điểm khởi hành
  departurePointId?: number | null;
  departurePointName?: string | null;
  // Phương tiện di chuyển
  transportModeId?: number | null;
  transportModeName?: string | null;
  transportModeIcon?: string | null;
  // Hãng hàng không
  airlineId?: number | null;
  airlineName?: string | null;
  airlineCode?: string | null;
  // Giá riêng của chuyến (null = dùng giá tour)
  adultPrice?: number | null;
  childPrice?: number | null;
}

export interface ScheduleRequest {
  tourId: number;
  departureDate: string;
  returnDate: string;
  totalSeats: number;
  status?: 'OPEN' | 'CLOSED';
  departurePointId?: number | null;
  transportModeId?: number | null;
  airlineId?: number | null;
  clearAirline?: boolean;
  adultPrice?: number | null;
  childPrice?: number | null;
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
  // Phương tiện khách chọn khi đặt tour
  transportModeId?: number | null;
  airlineId?: number | null;
  departurePointId?: number | null;
  guests: GuestRequest[];
}

export interface BookingResponse {
  id: number;
  bookingCode: string;
  tourId: number;
  tourName: string;
  tourCode: string;
  departureDate: string;
  // Phương tiện khách đã chọn
  transportModeId?: number | null;
  transportModeName?: string | null;
  transportModeIcon?: string | null;
  airlineId?: number | null;
  airlineName?: string | null;
  departurePointId?: number | null;
  departurePointName?: string | null;
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

// ============== Tour Tag ==============
export interface TourTagResponse {
  id: number;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface TourTagRequest {
  name: string;
  slug: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============== Attraction ==============
export interface AttractionResponse {
  id: number;
  name: string;
  destinationId?: number;
  destinationName?: string;
  description?: string;
  image?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface AttractionRequest {
  name: string;
  destinationId: number;
  description?: string;
  image?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============== Departure Point ==============
export interface DeparturePointResponse {
  id: number;
  name: string;
  city: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DeparturePointRequest {
  name: string;
  city: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============== Transport Mode ==============
export interface TransportModeResponse {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TransportModeRequest {
  name: string;
  description?: string;
  icon?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============== Airline ==============
export interface AirlineResponse {
  id: number;
  code: string;
  name: string;
  logo?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AirlineRequest {
  code: string;
  name: string;
  logo?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============== Banner ==============
export type BannerPosition = 'HOME_HERO' | 'HOME_SIDE' | 'HOME_MIDDLE' | 'TOUR_LIST' | 'TOUR_DETAIL';

export interface BannerResponse {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: BannerPosition;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerRequest {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: BannerPosition;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
