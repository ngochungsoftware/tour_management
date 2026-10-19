#!/bin/bash
# Script seed tour data qua API
# Chạy: bash seed-tours.sh

API="http://localhost:8080/api/v1"
TOKEN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@travelgo.com","password":"Admin@123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

if [ -z "$TOKEN" ]; then
  echo "❌ Không lấy được token"
  exit 1
fi
echo "✅ Token: ${TOKEN:0:30}..."

# Tour 1: Phú Quốc - biển, nổi bật
curl -s -X POST "$API/admin/tours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TQ-PQ-4N3D",
    "name": "Tour Phú Quốc 4N3Đ - Khám phá đảo ngọc",
    "categoryId": 1,
    "destinationId": 6,
    "description": "Khám phá đảo ngọc Phú Quốc với những bãi biển tuyệt đẹp, hải sản tươi sống và nhiều hoạt động thú vị. Bao gồm: tham quan VinWonders, safari, câu cá, lặn san hô.",
    "durationDays": 4,
    "durationNights": 3,
    "originalPrice": 7990000,
    "adultPrice": 5990000,
    "childPrice": 3990000,
    "infantPrice": 1500000,
    "maxPeople": 20,
    "status": "ACTIVE",
    "featured": true,
    "images": [
      {"imageUrl":"https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800","displayOrder":0},
      {"imageUrl":"https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800","displayOrder":1}
    ],
    "itineraries": [
      {"dayNumber":1,"title":"Đón sân bay - Check-in resort","description":"Đón khách tại sân bay Phú Quốc, di chuyển về resort nhận phòng, nghỉ ngơi và dùng bữa tối hải sản."},
      {"dayNumber":2,"title":"VinWonders & Safari","description":"Tham quan VinWonders Phú Quốc - công viên chủ đề lớn nhất Việt Nam và Vinpearl Safari."},
      {"dayNumber":3,"title":"Câu cá & Lặn san hô","description":"Khám phá các đảo nhỏ, câu cá, lặn san hô ngắm san hô và cá biển."},
      {"dayNumber":4,"title":"Mua sắm & Tiễn sân bay","description":"Mua sắm đặc sản địa phương, tham quan chợ đêm, tiễn khách ra sân bay."}
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('  → Tour 1:', d.get('success'), '-', d.get('data',{}).get('name',''))" 2>&1

# Tour 2: Đà Lạt - núi
curl -s -X POST "$API/admin/tours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TQ-DL-3N2D",
    "name": "Tour Đà Lạt 3N2Đ - Thành phố ngàn hoa",
    "categoryId": 2,
    "destinationId": 2,
    "description": "Hành trình đến thành phố ngàn hoa với khí hậu mát mẻ. Tham quan thác Datanla, hồ Xuân Hương, chợ đêm Đà Lạt và các điểm check-in nổi tiếng.",
    "durationDays": 3,
    "durationNights": 2,
    "originalPrice": 3490000,
    "adultPrice": 2490000,
    "childPrice": 1790000,
    "infantPrice": 800000,
    "maxPeople": 15,
    "status": "ACTIVE",
    "featured": true,
    "images": [
      {"imageUrl":"https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800","displayOrder":0},
      {"imageUrl":"https://images.unsplash.com/photo-1528127269322-539801943592?w=800","displayOrder":1}
    ],
    "itineraries": [
      {"dayNumber":1,"title":"Đón khách - Tham quan thành phố","description":"Đón khách tại sân bay Liên Khương, tham quan Hồ Xuân Hương, Quảng trường Lâm Viên."},
      {"dayNumber":2,"title":"Thác Datanla - Núi Langbiang","description":"Trải nghiệm máng trượt Datanla, chinh phục đỉnh Langbiang ngắm toàn cảnh."},
      {"dayNumber":3,"title":"Chợ đêm - Tiễn sân bay","description":"Mua sắm đặc sản, tham quan chợ đêm Đà Lạt, tiễn khách."}
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('  → Tour 2:', d.get('success'), '-', d.get('data',{}).get('name',''))" 2>&1

# Tour 3: Sapa - núi, mới
curl -s -X POST "$API/admin/tours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TQ-SP-2N1D",
    "name": "Tour Sapa 2N1Đ - Ruộng bậc thang",
    "categoryId": 2,
    "destinationId": 3,
    "description": "Khám phá Sapa mờ sương với ruộng bậc thang hùng vĩ, bản làng dân tộc và đỉnh Fansipan - nóc nhà Đông Dương.",
    "durationDays": 2,
    "durationNights": 1,
    "originalPrice": 2590000,
    "adultPrice": 1890000,
    "childPrice": 1290000,
    "infantPrice": 500000,
    "maxPeople": 12,
    "status": "ACTIVE",
    "featured": false,
    "images": [
      {"imageUrl":"https://images.unsplash.com/photo-1528127269322-539801943592?w=800","displayOrder":0}
    ],
    "itineraries": [
      {"dayNumber":1,"title":"Fansipan - Bản Cát Cát","description":"Đi cáp treo lên đỉnh Fansipan, tham quan bản Cát Cát của người H Mông."},
      {"dayNumber":2,"title":"Chợ tình Sa Pa - Tiễn khách","description":"Tham quan chợ tình (nếu đúng dịp cuối tuần), mua đặc sản."}
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('  → Tour 3:', d.get('success'), '-', d.get('data',{}).get('name',''))" 2>&1

# Tour 4: Hạ Long - biển
curl -s -X POST "$API/admin/tours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TQ-HL-2N1D",
    "name": "Tour Hạ Long 2N1Đ - Du thuyền vịnh",
    "categoryId": 1,
    "destinationId": 4,
    "description": "Trải nghiệm du thuyền sang trọng trên vịnh Hạ Long - di sản thiên nhiên thế giới. Kayak, bơi lội, câu mực đêm.",
    "durationDays": 2,
    "durationNights": 1,
    "originalPrice": 3290000,
    "adultPrice": 2290000,
    "childPrice": 1590000,
    "infantPrice": 700000,
    "maxPeople": 25,
    "status": "ACTIVE",
    "featured": true,
    "images": [
      {"imageUrl":"https://images.unsplash.com/photo-1528127269322-539801943592?w=800","displayOrder":0}
    ],
    "itineraries": [
      {"dayNumber":1,"title":"Đón khách - Du thuyền","description":"Đón tại Hà Nội, lên du thuyền, ăn trưa hải sản, kayak khám phá hang động."},
      {"dayNumber":2,"title":"Câu mực - Tiễn khách","description":"Dậy sớm ngắm bình minh, tập Thái Cực, ăn sáng, về Hà Nội."}
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('  → Tour 4:', d.get('success'), '-', d.get('data',{}).get('name',''))" 2>&1

# Tour 5: Nha Trang - biển
curl -s -X POST "$API/admin/tours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TQ-NT-4N3D",
    "name": "Tour Nha Trang 4N3Đ - Biển xanh cát trắng",
    "categoryId": 1,
    "destinationId": 5,
    "description": "Nghỉ dưỡng tại Nha Trang - thành phố biển xinh đẹp. Tham quan VinWonders, đảo hòn Mun, tour 4 đảo.",
    "durationDays": 4,
    "durationNights": 3,
    "originalPrice": 5990000,
    "adultPrice": 4290000,
    "childPrice": 2990000,
    "infantPrice": 1000000,
    "maxPeople": 20,
    "status": "ACTIVE",
    "featured": false,
    "images": [
      {"imageUrl":"https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800","displayOrder":0}
    ],
    "itineraries": [
      {"dayNumber":1,"title":"Check-in resort","description":"Đón sân bay Cam Ranh, về resort nghỉ ngơi."},
      {"dayNumber":2,"title":"Tour 4 đảo","description":"Khám phá Hòn Mun, Hòn Tằm, lặn san hô, ăn trưa trên biển."},
      {"dayNumber":3,"title":"VinWonders","description":"Công viên giải trí VinWonders Nha Trang."},
      {"dayNumber":4,"title":"Mua sắm - Tiễn khách","description":"Mua sắm đặc sản, tiễn sân bay."}
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('  → Tour 5:', d.get('success'), '-', d.get('data',{}).get('name',''))" 2>&1

# Tour 6: Đà Nẵng - văn hóa
curl -s -X POST "$API/admin/tours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TQ-DN-3N2D",
    "name": "Tour Đà Nẵng - Hội An - Huế 3N2Đ",
    "categoryId": 5,
    "destinationId": 1,
    "description": "Hành trình di sản miền Trung: Đà Nẵng, Hội An, Huế. Tham quan Bà Nà Hills, phố cổ Hội An, Đại Nội Huế.",
    "durationDays": 3,
    "durationNights": 2,
    "originalPrice": 4990000,
    "adultPrice": 3490000,
    "childPrice": 2490000,
    "infantPrice": 900000,
    "maxPeople": 18,
    "status": "ACTIVE",
    "featured": true,
    "images": [
      {"imageUrl":"https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800","displayOrder":0}
    ],
    "itineraries": [
      {"dayNumber":1,"title":"Bà Nà Hills","description":"Đón sân bay Đà Nẵng, đi Bà Nà Hills, Cầu Vàng."},
      {"dayNumber":2,"title":"Hội An - Huế","description":"Phố cổ Hội An, di sản UNESCO, di chuyển vào Huế tham quan Đại Nội."},
      {"dayNumber":3,"title":"Lăng tẩm - Tiễn khách","description":"Tham quan lăng Minh Mạng, mua sắm, tiễn sân bay."}
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('  → Tour 6:', d.get('success'), '-', d.get('data',{}).get('name',''))" 2>&1

# Tour 7: Hà Nội - văn hóa
curl -s -X POST "$API/admin/tours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TQ-HN-1N",
    "name": "Tour Hà Nội 1 ngày - Thủ đô nghìn năm",
    "categoryId": 5,
    "destinationId": 7,
    "description": "Tour 1 ngày khám phá Hà Nội: Hồ Hoàn Kiếm, Văn Miếu, Lăng Bác, Phố cổ.",
    "durationDays": 1,
    "durationNights": 0,
    "adultPrice": 990000,
    "childPrice": 690000,
    "infantPrice": 0,
    "maxPeople": 30,
    "status": "ACTIVE",
    "featured": false,
    "images": [
      {"imageUrl":"https://images.unsplash.com/photo-1528127269322-539801943592?w=800","displayOrder":0}
    ],
    "itineraries": [
      {"dayNumber":1,"title":"Hà Nội thủ đô","description":"Tham quan Lăng Chủ tịch, Văn Miếu, Hồ Gươm, Phố cổ, ăn trưa phở Hà Nội."}
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('  → Tour 7:', d.get('success'), '-', d.get('data',{}).get('name',''))" 2>&1

# Tour 8: HCM - nghỉ dưỡng
curl -s -X POST "$API/admin/tours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TQ-HCM-3N2D",
    "name": "Tour TP HCM 3N2Đ - Kinh đô ẩm thực",
    "categoryId": 3,
    "destinationId": 8,
    "description": "Khám phá Sài Gòn sôi động: Nhà thờ Đức Bà, Bitexco, chợ Bến Thành, địa đạo Củ Chi.",
    "durationDays": 3,
    "durationNights": 2,
    "originalPrice": 3990000,
    "adultPrice": 2790000,
    "childPrice": 1990000,
    "infantPrice": 800000,
    "maxPeople": 20,
    "status": "ACTIVE",
    "featured": false,
    "images": [
      {"imageUrl":"https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800","displayOrder":0}
    ],
    "itineraries": [
      {"dayNumber":1,"title":"Trung tâm Sài Gòn","description":"Nhà thờ Đức Bà, Bưu điện Trung tâm, Dinh Độc Lập."},
      {"dayNumber":2,"title":"Địa đạo Củ Chi","description":"Tham quan địa đạo Củ Chi, kênh đào Lý Nhơn."},
      {"dayNumber":3,"title":"Ẩm thực - Mua sắm","description":"Chợ Bến Thành, phố đi bộ Nguyễn Huệ, tiễn sân bay."}
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('  → Tour 8:', d.get('success'), '-', d.get('data',{}).get('name',''))" 2>&1

# Tour 9: Hội An - khám phá
curl -s -X POST "$API/admin/tours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TQ-HA-1N",
    "name": "Tour Hội An nửa ngày - Phố cổ đèn lồng",
    "categoryId": 4,
    "destinationId": 9,
    "description": "Khám phá phố cổ Hội An về đêm với hàng ngàn chiếc đèn lồng rực rỡ. Thưởng thức ẩm thực đặc sắc.",
    "durationDays": 1,
    "durationNights": 0,
    "adultPrice": 790000,
    "childPrice": 490000,
    "infantPrice": 0,
    "maxPeople": 25,
    "status": "ACTIVE",
    "featured": false,
    "images": [
      {"imageUrl":"https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800","displayOrder":0}
    ],
    "itineraries": [
      {"dayNumber":1,"title":"Hội An về đêm","description":"Tham quan Chùa Cầu, Hội quán Phúc Kiến, ăn tối Cao lầu, thả đèn hoa đăng."}
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('  → Tour 9:', d.get('success'), '-', d.get('data',{}).get('name',''))" 2>&1

# Tour 10: Huế - văn hóa
curl -s -X POST "$API/admin/tours" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TQ-HUE-2N1D",
    "name": "Tour Huế 2N1Đ - Cố đô",
    "categoryId": 5,
    "destinationId": 10,
    "description": "Hành trình về cố đô Huế - tham quan Đại Nội, các lăng tẩm vua Nguyễn, nghe ca Huế sông Hương.",
    "durationDays": 2,
    "durationNights": 1,
    "originalPrice": 2490000,
    "adultPrice": 1790000,
    "childPrice": 1290000,
    "infantPrice": 500000,
    "maxPeople": 15,
    "status": "ACTIVE",
    "featured": false,
    "images": [
      {"imageUrl":"https://images.unsplash.com/photo-1528127269322-539801943592?w=800","displayOrder":0}
    ],
    "itineraries": [
      {"dayNumber":1,"title":"Đại Nội - Lăng Minh Mạng","description":"Tham quan Hoàng cung triều Nguyễn, lăng vua Minh Mạng."},
      {"dayNumber":2,"title":"Chùa Thiên Mụ - Ca Huế","description":"Chùa Thiên Mụ, nghe ca Huế sông Hương, tiễn sân bay."}
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('  → Tour 10:', d.get('success'), '-', d.get('data',{}).get('name',''))" 2>&1

echo ""
echo "✅ Hoàn tất seed 10 tours!"
echo ""
echo "Verify: curl -s http://localhost:8080/api/v1/tours?size=2 | python3 -m json.tool | head -20"
