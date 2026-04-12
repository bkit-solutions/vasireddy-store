export type HomeProduct = {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  collection: "New Arrivals" | "Wedding" | "Festive";
  price: number;
};

export const categories = [
  { title: "Sarees", slug: "sarees", image: "/categories/sarees.jpg" },
  { title: "Lehengas", slug: "lehengas", image: "/categories/lehengas.jpg" },
  { title: "Blouses", slug: "blouses", image: "/categories/blouses.jpg" },
  { title: "Accessories", slug: "accessories", image: "/categories/accessories.jpg" },
];

export const products: HomeProduct[] = [
  {
    id: "prod_1",
    name: "Handwoven Kanchipuram Silk",
    slug: "handwoven-kanchipuram-silk",
    image: "/products/kanchipuram.jpg",
    category: "Sarees",
    collection: "Wedding",
    price: 16999,
  },
  {
    id: "prod_2",
    name: "Emerald Zari Bridal Lehenga",
    slug: "emerald-zari-bridal-lehenga",
    image: "/products/bridal-lehenga.jpg",
    category: "Lehengas",
    collection: "Wedding",
    price: 24999,
  },
  {
    id: "prod_3",
    name: "Festive Banarasi Tissue Saree",
    slug: "festive-banarasi-tissue-saree",
    image: "/products/banarasi.jpg",
    category: "Sarees",
    collection: "Festive",
    price: 13999,
  },
  {
    id: "prod_4",
    name: "Mirrorwork Velvet Blouse",
    slug: "mirrorwork-velvet-blouse",
    image: "/products/blouse.jpg",
    category: "Blouses",
    collection: "New Arrivals",
    price: 4999,
  },
  {
    id: "prod_5",
    name: "Gota Patti Celebration Dupatta",
    slug: "gota-patti-celebration-dupatta",
    image: "/products/dupatta.jpg",
    category: "Accessories",
    collection: "Festive",
    price: 3199,
  },
  {
    id: "prod_6",
    name: "Pastel Organza Reception Saree",
    slug: "pastel-organza-reception-saree",
    image: "/products/organza.jpg",
    category: "Sarees",
    collection: "New Arrivals",
    price: 11999,
  },
];
