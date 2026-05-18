const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const Product  = require('../models/Product');

dotenv.config();

const sampleProducts = [
  // ── Audio ──────────────────────────────────────────────────
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with 30hr battery life, active noise cancellation, and studio-quality sound. Perfect for work and travel.',
    price: 299.99, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', stock: 15,
  },
  {
    name: 'True Wireless Earbuds Pro',
    description: 'Compact TWS earbuds with 8hr playtime + 32hr case, IPX5 water resistance, and customizable EQ via app.',
    price: 149.99, imageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&q=80', stock: 30,
  },
  {
    name: 'Bluetooth Speaker 360°',
    description: 'Portable 360° omnidirectional speaker, 24hr battery, IP67 waterproof, built-in microphone for calls.',
    price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80', stock: 22,
  },
  {
    name: 'Studio Monitor Headphones',
    description: 'Professional flat-response headphones used by audio engineers. 40mm drivers, detachable cable, foldable design.',
    price: 179.99, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80', stock: 10,
  },
  // ── Input Devices ──────────────────────────────────────────
  {
    name: 'Mechanical Keyboard TKL',
    description: 'Tenkeyless layout with Cherry MX switches, RGB backlighting, and aluminum frame. Tactile feedback for the ultimate typing experience.',
    price: 149.99, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80', stock: 25,
  },
  {
    name: 'Ergonomic Vertical Mouse',
    description: 'Vertical design reduces wrist strain by 57%. DPI adjustable 800–3200, 7 programmable buttons, wireless 2.4GHz.',
    price: 79.99, imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80', stock: 30,
  },
  {
    name: 'Wireless Trackpad Pro',
    description: 'Large glass surface trackpad with multi-touch gestures, Bluetooth 5.0, rechargeable battery lasts 3 months.',
    price: 69.99, imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80', stock: 18,
  },
  {
    name: 'Gaming Mouse 16000 DPI',
    description: 'Ultra-precise optical sensor up to 16000 DPI, 11 programmable buttons, RGB lighting, 80hr wireless battery.',
    price: 99.99, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80', stock: 20,
  },
  // ── Cameras & Video ────────────────────────────────────────
  {
    name: '4K Webcam Pro',
    description: 'Ultra HD 4K streaming camera with autofocus, built-in ring light, and dual microphone. Crystal clear video for any call.',
    price: 199.99, imageUrl: 'https://images.unsplash.com/photo-1623520703681-01e3a8c33e3c?w=600&q=80', stock: 12,
  },
  {
    name: 'Action Camera 5K',
    description: 'Waterproof to 10m without case, 5K video at 30fps, HyperSmooth stabilization, voice control, touch screen.',
    price: 349.99, imageUrl: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=600&q=80', stock: 8,
  },
  {
    name: 'Mirrorless Camera Kit',
    description: '24MP APS-C sensor, 4K video, in-body stabilization, weather-sealed, includes 18-55mm kit lens.',
    price: 1199.99, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', stock: 5,
  },
  // ── Connectivity & Hubs ────────────────────────────────────
  {
    name: 'USB-C Hub 7-in-1',
    description: 'Expand connectivity with HDMI 4K, 3× USB-A, SD card, USB-C PD 100W, and Ethernet. Slim aluminum design.',
    price: 59.99, imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=80', stock: 40,
  },
  {
    name: 'Wi-Fi 6E Router',
    description: 'Tri-band Wi-Fi 6E router, 6GHz band support, 8 antennas, covers up to 5000 sq ft, WPA3 security.',
    price: 249.99, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', stock: 14,
  },
  {
    name: 'Thunderbolt 4 Dock',
    description: 'Connect up to 4 monitors, 96W laptop charging, 4× Thunderbolt ports, 3× USB-A, SD card, Ethernet, audio.',
    price: 189.99, imageUrl: 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600&q=80', stock: 9,
  },
  // ── Storage ────────────────────────────────────────────────
  {
    name: 'Portable NVMe SSD 1TB',
    description: 'NVMe speeds up to 1050MB/s in a pocket-sized metal chassis. USB-C compatible, shock & water resistant.',
    price: 129.99, imageUrl: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=600&q=80', stock: 20,
  },
  {
    name: 'External HDD 4TB',
    description: 'Compact 2.5" USB 3.0 drive, no external power needed, compatible with PC, Mac, PS5, Xbox.',
    price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=600&q=80', stock: 35,
  },
  {
    name: 'NAS Drive 8TB',
    description: '2-bay NAS with 8TB total storage, built-in RAID, remote access, media server, automatic backup.',
    price: 449.99, imageUrl: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&q=80', stock: 6,
  },
  // ── Displays & Lighting ────────────────────────────────────
  {
    name: 'Monitor Light Bar',
    description: 'Screenbar with auto-dimming sensor, asymmetric lighting eliminates screen glare, touch controls. Clips to any monitor.',
    price: 49.99, imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c228a61bf4?w=600&q=80', stock: 50,
  },
  {
    name: '27" 4K IPS Monitor',
    description: '3840×2160 IPS panel, 99% sRGB, HDR400, 60Hz, USB-C 65W charging, height/tilt adjustable stand.',
    price: 549.99, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', stock: 7,
  },
  {
    name: 'Smart LED Desk Lamp',
    description: 'Touch-dimming desk lamp, 5 color temps 2700–6500K, wireless Qi charger base, USB-A charging port.',
    price: 59.99, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80', stock: 28,
  },
  // ── Workspace Accessories ──────────────────────────────────
  {
    name: 'Laptop Stand Adjustable',
    description: 'Aluminum foldable stand, 6-angle adjustment, heat dissipation vents, fits 10–17" laptops. Improves posture.',
    price: 39.99, imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80', stock: 35,
  },
  {
    name: 'Dual Monitor Arm',
    description: 'Full-motion VESA monitor arm for two displays up to 32". C-clamp or grommet mount, cable management built-in.',
    price: 119.99, imageUrl: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&q=80', stock: 12,
  },
  {
    name: 'Large Desk Pad',
    description: 'XXL 90×40cm desk mat, smooth micro-texture surface, stitched edges, non-slip base. Space grey finish.',
    price: 29.99, imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', stock: 60,
  },
  // ── Power ──────────────────────────────────────────────────
  {
    name: '140W USB-C Charger GaN',
    description: 'Dual USB-C + USB-A GaN charger, charges MacBook Pro at full speed, foldable plug, ultra-compact design.',
    price: 79.99, imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80', stock: 45,
  },
  {
    name: 'Portable Power Bank 26800mAh',
    description: '26800mAh capacity, dual USB-C 65W PD + USB-A, charges laptops, LED battery indicator, airline approved.',
    price: 69.99, imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80', stock: 25,
  },
  {
    name: 'Smart Power Strip 6-outlet',
    description: '6 smart outlets + 4 USB ports, voice control, energy monitoring, surge protection, works with Alexa & Google.',
    price: 49.99, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', stock: 32,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await Product.deleteMany({});
    console.log('Cleared existing products');
    await Product.insertMany(sampleProducts);
    console.log(`✅ Seeded ${sampleProducts.length} products successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
