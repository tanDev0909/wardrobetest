import type { Item } from "@/types";

// ~21 seeded items so the wardrobe always looks full on first open.
// Clean product photos come from the DummyJSON product CDN for the categories it
// covers (tops/shirts, dresses, shoes, watches, sunglasses, bags). DummyJSON has
// no trousers/coats, so bottoms + outerwear use real keyword photos from
// loremflickr. If any photo fails to load, ItemImage falls back to a swatch.

const CDN = "https://cdn.dummyjson.com/product-images";

type Seed = Omit<Item, "id" | "owned" | "createdAt" | "imageUrl"> & {
  /** Explicit product image URL (DummyJSON). */
  img?: string;
  /** loremflickr keyword query, used when no img is given. */
  q?: string;
};

const raw: Seed[] = [
  // Tops — DummyJSON mens-shirts (real product shots)
  { name: "Blue & black check shirt", category: "top", colors: ["blue", "black"], pattern: "plaid", fabric: "cotton", formality: "smart-casual", season: ["spring", "autumn", "winter"], img: `${CDN}/mens-shirts/blue-&-black-check-shirt/thumbnail.webp` },
  { name: "Graphic black tee", category: "top", colors: ["black"], pattern: "print", fabric: "cotton", formality: "casual", season: ["spring", "summer", "autumn"], img: `${CDN}/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp` },
  { name: "Plaid flannel shirt", category: "top", colors: ["grey", "black"], pattern: "plaid", fabric: "cotton", formality: "casual", season: ["autumn", "winter"], img: `${CDN}/mens-shirts/man-plaid-shirt/thumbnail.webp` },
  { name: "White short-sleeve shirt", category: "top", colors: ["white"], pattern: "solid", fabric: "cotton", formality: "smart-casual", season: ["spring", "summer"], img: `${CDN}/mens-shirts/man-short-sleeve-shirt/thumbnail.webp` },
  { name: "Blue check shirt", category: "top", colors: ["blue"], pattern: "plaid", fabric: "cotton", formality: "casual", season: ["spring", "autumn"], img: `${CDN}/mens-shirts/men-check-shirt/thumbnail.webp` },

  // Bottoms — Platzi store catalog (clean product-only photos, no models)
  { name: "Comfort-fit joggers", category: "bottom", colors: ["grey"], pattern: "solid", fabric: "cotton", formality: "casual", season: ["spring", "autumn", "winter"], img: "https://i.imgur.com/ZKGofuB.jpeg" },
  { name: "Drawstring joggers", category: "bottom", colors: ["navy"], pattern: "solid", fabric: "cotton", formality: "casual", season: ["autumn", "winter"], img: "https://i.imgur.com/mp3rUty.jpeg" },
  { name: "Olive chino shorts", category: "bottom", colors: ["green"], pattern: "solid", fabric: "cotton", formality: "smart-casual", season: ["spring", "summer"], img: "https://i.imgur.com/UsFIvYs.jpeg" },
  { name: "Athletic shorts", category: "bottom", colors: ["grey"], pattern: "solid", fabric: "polyester", formality: "casual", season: ["summer"], img: "https://i.imgur.com/eGOUveI.jpeg" },

  // Outerwear — FakeStoreAPI catalog jackets/coats (real product shots)
  { name: "Cotton zip jacket", category: "outerwear", colors: ["grey"], pattern: "solid", fabric: "cotton", formality: "casual", season: ["spring", "autumn"], img: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png" },
  { name: "Faux-leather biker jacket", category: "outerwear", colors: ["black"], pattern: "solid", fabric: "leather", formality: "smart-casual", season: ["autumn", "winter"], img: "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png" },
  { name: "Snowboard winter coat", category: "outerwear", colors: ["black"], pattern: "solid", fabric: "nylon", formality: "casual", season: ["winter"], img: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png" },

  // Dresses — DummyJSON (real product shots)
  { name: "Black evening gown", category: "dress", colors: ["black"], pattern: "solid", fabric: "polyester", formality: "formal", season: ["spring", "summer", "autumn", "winter"], img: `${CDN}/womens-dresses/black-women's-gown/thumbnail.webp` },
  { name: "Summer frock", category: "dress", colors: ["blue"], pattern: "floral", fabric: "cotton", formality: "smart-casual", season: ["summer"], img: `${CDN}/tops/girl-summer-dress/thumbnail.webp` },
  { name: "Red & black suit dress", category: "dress", colors: ["red", "black"], pattern: "solid", fabric: "wool", formality: "formal", season: ["autumn", "winter"], img: `${CDN}/womens-dresses/marni-red-&-black-suit/thumbnail.webp` },

  // Footwear — DummyJSON (real product shots)
  { name: "Air Jordan 1 sneakers", category: "footwear", colors: ["red", "black"], pattern: "solid", fabric: "leather", formality: "casual", season: ["spring", "summer", "autumn"], img: `${CDN}/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp` },
  { name: "Off-white trainers", category: "footwear", colors: ["white"], pattern: "solid", fabric: "mesh", formality: "casual", season: ["spring", "summer", "autumn"], img: `${CDN}/mens-shoes/puma-future-rider-trainers/thumbnail.webp` },
  { name: "Heeled shoes", category: "footwear", colors: ["black"], pattern: "solid", fabric: "leather", formality: "formal", season: ["spring", "autumn", "winter"], img: `${CDN}/womens-shoes/calvin-klein-heel-shoes/thumbnail.webp` },

  // Accessories — DummyJSON (real product shots)
  { name: "Brown leather watch", category: "accessory", colors: ["brown"], pattern: "solid", fabric: "leather", formality: "formal", season: ["spring", "summer", "autumn", "winter"], img: `${CDN}/mens-watches/brown-leather-belt-watch/thumbnail.webp` },
  { name: "Black sunglasses", category: "accessory", colors: ["black"], pattern: "solid", fabric: null, formality: "casual", season: ["spring", "summer"], img: `${CDN}/sunglasses/black-sun-glasses/thumbnail.webp` },
  { name: "Black leather handbag", category: "accessory", colors: ["black"], pattern: "solid", fabric: "leather", formality: "smart-casual", season: ["spring", "summer", "autumn", "winter"], img: `${CDN}/womens-bags/women-handbag-black/thumbnail.webp` },
];

export function imageFor(query: string, lock: number, size = 600): string {
  return `https://loremflickr.com/${size}/${size}/${encodeURIComponent(query)}?lock=${lock}`;
}

export function seedItems(): Item[] {
  return raw.map(({ q, img, ...r }, i) => ({
    ...r,
    id: `seed-${i}`,
    imageUrl: img ?? imageFor(q ?? r.category, i + 1),
    owned: true,
    createdAt: i,
  }));
}
