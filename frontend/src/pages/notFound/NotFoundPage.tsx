import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => (
  <div className="grid min-h-[60vh] place-items-center px-4">
    <div className="text-center">
      <div className="text-6xl">🗺️</div>
      <h1 className="mt-4 text-3xl font-bold text-slate-800">404 - Không tìm thấy</h1>
      <p className="mt-2 text-slate-500">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <Link to="/" className="btn-primary mt-6"><Home className="h-4 w-4" />Về trang chủ</Link>
    </div>
  </div>
);

export default NotFoundPage;
