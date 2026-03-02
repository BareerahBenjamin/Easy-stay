import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const cities = [
  ["上海", "黄浦区"],
  ["北京", "朝阳区"],
  ["深圳", "南山区"],
  ["广州", "天河区"],
  ["杭州", "西湖区"],
  ["成都", "高新区"],
  ["重庆", "渝中区"],
  ["武汉", "江汉区"],
  ["南京", "玄武区"],
  ["西安", "雁塔区"],
  ["苏州", "工业园区"],
  ["青岛", "崂山区"]
];

const tags = [
  { id: "t-001", name: "商务出行" },
  { id: "t-002", name: "文化体验" },
  { id: "t-003", name: "景观优先" },
  { id: "t-004", name: "亲子友好" },
  { id: "t-005", name: "高端精选" },
  { id: "t-006", name: "度假放松" },
  { id: "t-007", name: "会展便捷" },
  { id: "t-008", name: "高性价比" }
];

const imagePool = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
  "https://images.unsplash.com/photo-1455587734955-081b22074882",
  "https://images.unsplash.com/photo-1578898887932-dce23a595ad4",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"
];

function createRooms(index, minPrice) {
  return [
    {
      id: `r-${index}-01`,
      name: "高级大床房",
      price: minPrice,
      breakfast: true,
      cancelPolicy: "入住前一天 18:00 前可免费取消",
      stock: 8 + (index % 5)
    },
    {
      id: `r-${index}-02`,
      name: "行政双床房",
      price: minPrice + 180,
      breakfast: true,
      cancelPolicy: "入住前两天可免费取消",
      stock: 5 + (index % 4)
    },
    {
      id: `r-${index}-03`,
      name: "城市景观套房",
      price: minPrice + 420,
      breakfast: true,
      cancelPolicy: "不可取消",
      stock: 2 + (index % 3)
    }
  ];
}

const hotels = Array.from({ length: 32 }, (_, i) => {
  const index = i + 1;
  const [city, district] = cities[i % cities.length];
  const starRating = i % 4 === 0 ? 5 : i % 3 === 0 ? 4 : 3;
  const minPrice = 260 + (i % 8) * 70 + (starRating - 3) * 120;
  const auditStatus = i % 9 === 0 ? "PENDING" : i % 11 === 0 ? "REJECTED" : "APPROVED";
  const isOnline = auditStatus === "APPROVED" ? i % 7 !== 0 : false;
  const roomTypes = createRooms(index, minPrice);

  return {
    id: `h-${String(index).padStart(3, "0")}`,
    name: `易宿·${city}${["商旅", "轻居", "臻选", "中心", "云景", "会展"][i % 6]}酒店`,
    city,
    district,
    address: `${district}${10 + (i % 80)}号`,
    description: `${city}${district}核心区域，交通便利，适合商旅与休闲住宿。`,
    starRating,
    minPrice,
    maxPrice: roomTypes[2].price,
    auditStatus,
    isOnline,
    offlineReason: !isOnline && auditStatus === "APPROVED" ? "运营维护，临时下线" : undefined,
    tagIds: [tags[i % tags.length].id, tags[(i + 2) % tags.length].id],
    facilities: ["免费 Wi-Fi", "24h 前台", "健身房", "行李寄存"],
    images: [imagePool[i % imagePool.length], imagePool[(i + 2) % imagePool.length]],
    rooms: roomTypes,
    updatedAt: new Date(Date.now() - i * 3600_000).toISOString()
  };
});

const db = {
  hotels,
  tags,
  users: [
    { id: "u-001", role: "ADMIN", name: "平台管理员" },
    { id: "u-002", role: "MERCHANT", name: "示例商家" }
  ]
};

const target = resolve(process.cwd(), "src/mock-server/db.json");
writeFileSync(target, JSON.stringify(db, null, 2), "utf-8");
console.log(`mock db generated: ${target}`);
