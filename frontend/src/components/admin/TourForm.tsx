import { useEffect, useState } from 'react';
import {
  TourCreateRequest,
  TourUpdateRequest,
  TourStatus,
  TourImageRequest,
  ItineraryRequest,
  TourDetailResponse,
  ScheduleRequest,
  ScheduleResponse,
  CategoryResponse,
  DestinationResponse,
} from '@/types';
import { scheduleApi } from '@/api/schedule.api';
import { categoryApi } from '@/api/catalog.api';
import { destinationApi } from '@/api/catalog.api';
import { X, Plus, Trash2, Calendar, Save, Image as ImageIcon } from 'lucide-react';

interface TourFormProps {
  initial?: TourDetailResponse | null;
  onClose: () => void;
  onSubmit: (data: TourCreateRequest | TourUpdateRequest, isEdit: boolean) => Promise<void>;
}

const emptyForm = (): TourCreateRequest => ({
  code: '',
  name: '',
  categoryId: 0,
  destinationId: 0,
  description: '',
  durationDays: 3,
  durationNights: 2,
  originalPrice: 0,
  adultPrice: 0,
  childPrice: 0,
  infantPrice: 0,
  maxPeople: 30,
  status: 'ACTIVE',
  featured: false,
  images: [{ imageUrl: '', cover: true }],
  itineraries: [],
});

const TourForm = ({ initial, onClose, onSubmit }: TourFormProps) => {
  const isEdit = !!initial;
  const [form, setForm] = useState<TourCreateRequest>(() => {
    if (initial) {
      return {
        code: initial.code,
        name: initial.name,
        categoryId: initial.categoryId ?? 0,
        destinationId: initial.destinationId ?? 0,
        description: initial.description ?? '',
        durationDays: initial.durationDays,
        durationNights: initial.durationNights,
        originalPrice: initial.originalPrice ?? 0,
        adultPrice: initial.adultPrice,
        childPrice: initial.childPrice,
        infantPrice: initial.infantPrice,
        maxPeople: initial.maxPeople,
        status: initial.status ?? 'ACTIVE',
        featured: initial.featured ?? false,
        images:
          initial.images.length > 0
            ? initial.images.map((url, idx) => ({ imageUrl: url, cover: idx === 0 }))
            : [{ imageUrl: '', cover: true }],
        itineraries: initial.itineraries.map((it) => ({
          dayNumber: it.dayNumber,
          title: it.title,
          description: it.description ?? '',
        })),
      };
    }
    return emptyForm();
  });

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [destinations, setDestinations] = useState<DestinationResponse[]>([]);
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [newScheduleDate, setNewScheduleDate] = useState('');

  // Load categories, destinations
  useEffect(() => {
    categoryApi
      .list()
      .then(setCategories)
      .catch(() => setCategories([]));
    destinationApi
      .list()
      .then(setDestinations)
      .catch(() => setDestinations([]));
  }, []);

  // Load schedules nếu edit
  useEffect(() => {
    if (initial) {
      scheduleApi
        .byTour(initial.id)
        .then(setSchedules)
        .catch(() => setSchedules([]));
    }
  }, [initial]);

  const update = <K extends keyof TourCreateRequest>(key: K, value: TourCreateRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateImage = (idx: number, patch: Partial<TourImageRequest>) => {
    setForm((prev) => {
      const newImages = prev.images.map((img, i) => (i === idx ? { ...img, ...patch } : img));
      // Nếu set cover=true thì clear cover ở các ảnh khác
      if (patch.cover === true) {
        return {
          ...prev,
          images: newImages.map((img, i) => ({ ...img, cover: i === idx })),
        };
      }
      return { ...prev, images: newImages };
    });
  };

  const addImage = () => {
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, { imageUrl: '', cover: false }],
    }));
  };

  const removeImage = (idx: number) => {
    setForm((prev) => {
      const newImages = prev.images.filter((_, i) => i !== idx);
      // Đảm bảo luôn có ít nhất 1 ảnh cover
      if (newImages.length > 0 && !newImages.some((img) => img.cover)) {
        newImages[0].cover = true;
      }
      return { ...prev, images: newImages };
    });
  };

  const addItinerary = () => {
    setForm((prev) => ({
      ...prev,
      itineraries: [
        ...prev.itineraries,
        { dayNumber: prev.itineraries.length + 1, title: '', description: '' },
      ],
    }));
  };

  const updateItinerary = (idx: number, patch: Partial<ItineraryRequest>) => {
    setForm((prev) => ({
      ...prev,
      itineraries: prev.itineraries.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  };

  const removeItinerary = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      itineraries: prev.itineraries
        .filter((_, i) => i !== idx)
        .map((it, i) => ({ ...it, dayNumber: i + 1 })),
    }));
  };

  // Schedules management (chỉ khi edit)
  const handleAddSchedule = async () => {
    if (!initial || !newScheduleDate) return;
    try {
      const newSched = await scheduleApi.create({
        tourId: initial.id,
        departureDate: newScheduleDate,
        returnDate: newScheduleDate, // Có thể tính = departureDate + durationDays
        totalSeats: form.maxPeople,
        status: 'OPEN',
      });
      setSchedules((prev) => [...prev, newSched]);
      setNewScheduleDate('');
    } catch (err) {
      // handled
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm('Xóa lịch khởi hành này?')) return;
    try {
      await scheduleApi.remove(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      // handled
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      alert('Vui lòng nhập tên tour');
      return;
    }
    if (!isEdit && !form.code.trim()) {
      alert('Vui lòng nhập mã tour');
      return;
    }
    if (form.categoryId === 0) {
      alert('Vui lòng chọn danh mục');
      return;
    }
    if (form.destinationId === 0) {
      alert('Vui lòng chọn điểm đến');
      return;
    }
    if (form.adultPrice <= 0) {
      alert('Giá người lớn phải lớn hơn 0');
      return;
    }
    if (form.durationDays <= 0) {
      alert('Số ngày phải lớn hơn 0');
      return;
    }
    if (form.durationNights < 0) {
      alert('Số đêm không được âm');
      return;
    }
    const validImages = form.images.filter((img) => img.imageUrl.trim());
    if (validImages.length === 0) {
      alert('Vui lòng thêm ít nhất 1 ảnh');
      return;
    }
    if (!validImages.some((img) => img.cover)) {
      alert('Vui lòng chọn 1 ảnh bìa');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const updateBody: TourUpdateRequest = {
          name: form.name,
          description: form.description,
          durationDays: form.durationDays,
          durationNights: form.durationNights,
          originalPrice: form.originalPrice,
          adultPrice: form.adultPrice,
          childPrice: form.childPrice,
          infantPrice: form.infantPrice,
          maxPeople: form.maxPeople,
          status: form.status,
          featured: form.featured,
        };
        await onSubmit(updateBody, true);
      } else {
        await onSubmit({ ...form, images: validImages }, false);
      }
    } catch (err) {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[90vh] w-full max-w-3xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Cập nhật tour' : 'Thêm tour mới'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {/* Mã + Trạng thái */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Mã tour *</label>
              <input
                disabled={isEdit}
                value={form.code}
                onChange={(e) => update('code', e.target.value)}
                className="input disabled:bg-slate-100"
                placeholder="VD: TQ-PQ-4N3D"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as TourStatus)}
                className="input"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="HIDDEN">Ẩn</option>
                <option value="INACTIVE">Ngưng</option>
              </select>
            </div>
          </div>

          {/* Tên */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Tên tour *</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input"
              placeholder="VD: Tour Phú Quốc 4N3Đ"
              required
            />
          </div>

          {/* Danh mục + Điểm đến */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Danh mục *</label>
              <select
                value={form.categoryId || ''}
                onChange={(e) => update('categoryId', Number(e.target.value))}
                className="input"
                required
                disabled={isEdit}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Điểm đến *</label>
              <select
                value={form.destinationId || ''}
                onChange={(e) => update('destinationId', Number(e.target.value))}
                className="input"
                required
                disabled={isEdit}
              >
                <option value="">-- Chọn điểm đến --</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thời lượng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Số ngày *</label>
              <input
                type="number"
                min={1}
                value={form.durationDays}
                onChange={(e) => update('durationDays', Number(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Số đêm *</label>
              <input
                type="number"
                min={0}
                value={form.durationNights}
                onChange={(e) => update('durationNights', Number(e.target.value))}
                className="input"
              />
            </div>
          </div>

          {/* Giá */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Giá gốc</label>
              <input
                type="number"
                min={0}
                value={form.originalPrice || 0}
                onChange={(e) => update('originalPrice', Number(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Giá NL *</label>
              <input
                type="number"
                min={0}
                value={form.adultPrice}
                onChange={(e) => update('adultPrice', Number(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Giá TE *</label>
              <input
                type="number"
                min={0}
                value={form.childPrice}
                onChange={(e) => update('childPrice', Number(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Giá EB</label>
              <input
                type="number"
                min={0}
                value={form.infantPrice || 0}
                onChange={(e) => update('infantPrice', Number(e.target.value))}
                className="input"
              />
            </div>
          </div>

          {/* Max people + Featured */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Số người tối đa *</label>
              <input
                type="number"
                min={1}
                value={form.maxPeople}
                onChange={(e) => update('maxPeople', Number(e.target.value))}
                className="input"
              />
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured || false}
                  onChange={(e) => update('featured', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="font-medium text-slate-700">Tour nổi bật</span>
                <span className="text-xs text-slate-400">(hiển thị ở trang chủ)</span>
              </label>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Mô tả</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="input min-h-24"
              placeholder="Mô tả chi tiết về tour..."
            />
          </div>

          {/* Hình ảnh */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">
                <ImageIcon className="mr-1 inline h-3.5 w-3.5" /> Hình ảnh *
              </label>
              <button
                type="button"
                onClick={addImage}
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-3 w-3" /> Thêm ảnh
              </button>
            </div>
            <div className="space-y-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded bg-slate-100">
                    {img.imageUrl ? (
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="url"
                    value={img.imageUrl}
                    onChange={(e) => updateImage(idx, { imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="input flex-1"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="cover"
                      checked={!!img.cover}
                      onChange={() => updateImage(idx, { cover: true })}
                    />
                    Bìa
                  </label>
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lịch trình (Itineraries) */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Lịch trình tour (Itinerary)</label>
              <button
                type="button"
                onClick={addItinerary}
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-3 w-3" /> Thêm ngày
              </button>
            </div>
            <div className="space-y-2">
              {form.itineraries.map((it, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {it.dayNumber}
                    </span>
                    <input
                      value={it.title}
                      onChange={(e) => updateItinerary(idx, { title: e.target.value })}
                      placeholder="Tiêu đề ngày (VD: Khám phá đảo ngọc)"
                      className="input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeItinerary(idx)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={it.description || ''}
                    onChange={(e) => updateItinerary(idx, { description: e.target.value })}
                    placeholder="Mô tả chi tiết..."
                    className="input min-h-16 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Schedules - chỉ hiển thị khi edit */}
          {isEdit && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-800">
                <Calendar className="h-3.5 w-3.5" /> Lịch khởi hành
              </div>
              <div className="mb-3 flex gap-2">
                <input
                  type="date"
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  className="input flex-1"
                  min={new Date().toISOString().split('T')[0]}
                />
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  disabled={!newScheduleDate}
                  className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {schedules.length === 0 ? (
                <p className="text-xs text-amber-700">Chưa có lịch khởi hành nào</p>
              ) : (
                <ul className="space-y-1 text-xs">
                  {schedules.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded border border-amber-200 bg-white px-2 py-1.5"
                    >
                      <span>
                        {s.departureDate} · {s.availableSeats}/{s.totalSeats} chỗ
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(s.id)}
                        className="rounded p-0.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourForm;
