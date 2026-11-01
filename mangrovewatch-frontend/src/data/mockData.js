/**
 * MangroveWatch Integrated Data & Fallbacks
 * 
 * Contains verified GeoJSON layers, sample legal evidence dossiers,
 * and community eyewitness reports for the Sundarbans Biosphere Reserve.
 */

export const EXTENT_GEOJSON = {
  type: "FeatureCollection",
  name: "sundarbans_mangrove_extent",
  features: [
    {
      type: "Feature",
      properties: {
        id: "extent_001",
        name: "Sundarbans Core Mangrove Zone",
        area_ha: 42500,
        source: "Global Mangrove Watch & Sentinel-2 L2A",
        last_updated: "2026-10-30"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.85, 21.82], [89.08, 21.82], [89.25, 21.78], [89.45, 21.75], [89.65, 21.72], [89.80, 21.68], [89.90, 21.60], [89.85, 21.55], [89.75, 21.50], [89.60, 21.48], [89.40, 21.50], [89.20, 21.52], [89.00, 21.55], [88.85, 21.60], [88.78, 21.68], [88.80, 21.75], [88.85, 21.82]]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "extent_002",
        name: "Sundarbans East Buffer",
        area_ha: 18200,
        source: "Global Mangrove Watch",
        last_updated: "2026-10-30"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.90, 21.68], [90.05, 21.65], [90.15, 21.60], [90.20, 21.55], [90.15, 21.48], [90.00, 21.45], [89.85, 21.48], [89.75, 21.50], [89.85, 21.55], [89.90, 21.60], [89.90, 21.68]]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "extent_003",
        name: "Sundarbans West Fringe",
        area_ha: 12300,
        source: "Global Mangrove Watch",
        last_updated: "2026-10-30"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.55, 21.75], [88.70, 21.80], [88.85, 21.82], [88.80, 21.75], [88.78, 21.68], [88.70, 21.62], [88.58, 21.60], [88.50, 21.65], [88.48, 21.70], [88.55, 21.75]]
        ]
      }
    }
  ]
};

export const PROTECTED_AREAS_GEOJSON = {
  type: "FeatureCollection",
  name: "sundarbans_protected_areas",
  features: [
    {
      type: "Feature",
      properties: {
        id: "pa_001",
        name: "Sundarbans National Park",
        wdpa_id: "902",
        designation: "UNESCO World Heritage Site & National Park",
        iucn_cat: "II",
        country: "India",
        area_ha: 133010,
        status: "Strictly Protected",
        status_yr: 1984
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[88.85, 21.82], [89.15, 21.82], [89.25, 21.78], [89.20, 21.62], [89.00, 21.55], [88.85, 21.60], [88.78, 21.68], [88.80, 21.75], [88.85, 21.82]]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "pa_002",
        name: "Sundarbans Reserve Forest",
        wdpa_id: "903",
        designation: "Reserve Forest Sanctuary",
        iucn_cat: "IV",
        country: "Bangladesh",
        area_ha: 601700,
        status: "Strictly Protected",
        status_yr: 1875
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.25, 21.78], [89.65, 21.72], [89.90, 21.60], [89.85, 21.45], [89.60, 21.40], [89.30, 21.42], [89.10, 21.50], [89.20, 21.62], [89.25, 21.78]]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "pa_003",
        name: "Sundarbans Tiger Reserve",
        wdpa_id: "904",
        designation: "Core Tiger Habitat & Ramsar Wetland",
        iucn_cat: "IV",
        country: "India",
        area_ha: 258500,
        status: "Special Protection",
        status_yr: 1973
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.30, 21.65], [89.50, 21.62], [89.55, 21.55], [89.50, 21.48], [89.35, 21.45], [89.25, 21.50], [89.22, 21.58], [89.30, 21.65]]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "pa_004",
        name: "Sundarbans West Wildlife Sanctuary",
        wdpa_id: "905",
        designation: "Wildlife Sanctuary",
        iucn_cat: "IV",
        country: "Bangladesh",
        area_ha: 71502,
        status: "Strict Nature Reserve",
        status_yr: 1996
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.65, 21.72], [89.80, 21.68], [89.90, 21.60], [89.85, 21.55], [89.75, 21.52], [89.65, 21.55], [89.60, 21.62], [89.65, 21.72]]
        ]
      }
    }
  ]
};

export const LOSS_PATCHES_GEOJSON = {
  type: "FeatureCollection",
  name: "sundarbans_loss_patches",
  features: [
    {
      type: "Feature",
      properties: {
        patch_id: "MW-2026-089A",
        detection_date: "2026-10-28",
        area_ha: 14.8,
        cause: "pond_conversion",
        confidence: 0.96,
        severity: "critical",
        ndvi_before: 0.76,
        ndvi_after: 0.11,
        in_protected_area: true,
        protected_area_name: "Sundarbans National Park (Core)",
        wdpa_id: "902",
        status: "confirmed",
        carbon_loss_tco2: 6660.0,
        year: 2026,
        sha256_hash: "8f4b1e92a472c3d9a180bb52fe4c1d2938a91c0e3b6d7a8e9f0123456789abcd",
        notes: "Excavation and commercial shrimp dyke construction inside pristine Rhizophora mangrove canopy."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[89.12, 21.72], [89.15, 21.72], [89.15, 21.69], [89.12, 21.69], [89.12, 21.72]]]
      }
    },
    {
      type: "Feature",
      properties: {
        patch_id: "MW-2026-074C",
        detection_date: "2026-10-15",
        area_ha: 8.6,
        cause: "illegal_logging",
        confidence: 0.94,
        severity: "critical",
        ndvi_before: 0.79,
        ndvi_after: 0.18,
        in_protected_area: true,
        protected_area_name: "Sundarbans Reserve Forest",
        wdpa_id: "903",
        status: "confirmed",
        carbon_loss_tco2: 3870.0,
        year: 2026,
        sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        notes: "Mechanized timber felling along tidal channel; barge transportation signatures detected on SAR."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[89.38, 21.64], [89.41, 21.64], [89.41, 21.61], [89.38, 21.61], [89.38, 21.64]]]
      }
    },
    {
      type: "Feature",
      properties: {
        patch_id: "MW-2026-061B",
        detection_date: "2026-09-24",
        area_ha: 21.4,
        cause: "erosion_cyclone",
        confidence: 0.88,
        severity: "high",
        ndvi_before: 0.71,
        ndvi_after: 0.23,
        in_protected_area: true,
        protected_area_name: "Sundarbans West Wildlife Sanctuary",
        wdpa_id: "905",
        status: "confirmed",
        carbon_loss_tco2: 9630.0,
        year: 2026,
        sha256_hash: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
        notes: "Severe riverbank destabilization and tidal surge wash-out following Cyclone Remal."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[89.68, 21.65], [89.72, 21.65], [89.72, 21.61], [89.68, 21.61], [89.68, 21.65]]]
      }
    },
    {
      type: "Feature",
      properties: {
        patch_id: "MW-2025-045A",
        detection_date: "2025-11-12",
        area_ha: 6.2,
        cause: "pond_conversion",
        confidence: 0.91,
        severity: "medium",
        ndvi_before: 0.69,
        ndvi_after: 0.28,
        in_protected_area: false,
        protected_area_name: "Buffer Perimeter Zone",
        wdpa_id: null,
        status: "confirmed",
        carbon_loss_tco2: 2790.0,
        year: 2025,
        sha256_hash: "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9",
        notes: "Brackish water aquaculture expansion without environmental clearance certificate."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[89.51, 21.56], [89.54, 21.56], [89.54, 21.53], [89.51, 21.53], [89.51, 21.56]]]
      }
    },
    {
      type: "Feature",
      properties: {
        patch_id: "MW-2025-019F",
        detection_date: "2025-04-03",
        area_ha: 11.3,
        cause: "illegal_logging",
        confidence: 0.95,
        severity: "critical",
        ndvi_before: 0.81,
        ndvi_after: 0.14,
        in_protected_area: true,
        protected_area_name: "Sundarbans Tiger Reserve",
        wdpa_id: "904",
        status: "confirmed",
        carbon_loss_tco2: 5085.0,
        year: 2025,
        sha256_hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        notes: "Selective extraction of mature Heritiera fomes (Sundari) trees inside primary tiger breeding corridor."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[89.32, 21.58], [89.36, 21.58], [89.36, 21.54], [89.32, 21.54], [89.32, 21.58]]]
      }
    },
    {
      type: "Feature",
      properties: {
        patch_id: "MW-2024-082D",
        detection_date: "2024-08-19",
        area_ha: 17.5,
        cause: "pond_conversion",
        confidence: 0.97,
        severity: "critical",
        ndvi_before: 0.74,
        ndvi_after: 0.12,
        in_protected_area: true,
        protected_area_name: "Sundarbans National Park",
        wdpa_id: "902",
        status: "confirmed",
        carbon_loss_tco2: 7875.0,
        year: 2024,
        sha256_hash: "7d793037a0760186574b0282f2f435e70ec71e16ff26f102697a3fe459715c80",
        notes: "Commercial gher installation with diesel pumps diverting salt water into forest interior."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[88.98, 21.68], [89.02, 21.68], [89.02, 21.64], [88.98, 21.64], [88.98, 21.68]]]
      }
    }
  ]
};

export const SAMPLE_CITIZEN_REPORTS = [
  {
    id: "CR-2026-104",
    report_id: "CR-2026-104",
    lat: 21.724,
    lng: 89.135,
    latitude: 21.724,
    longitude: 89.135,
    category: "clearing",
    description: "Heavy machinery and earthmovers clearing dense mangrove canopy along Arpangasia riverbank for new gher ponds. Timber loaded onto motorized trawlers.",
    reporter_name: "Rashidul Islam (Koyra Ranger)",
    photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    created_at: "2026-10-29T09:14:00Z",
    status: "confirmed",
    linked_patch_id: "MW-2026-089A",
    officer_notes: "Matches Sentinel-2 L2A alert MW-2026-089A. Enforcement squad dispatched. Seizure notice filed under Wildlife Act Sec 34."
  },
  {
    id: "CR-2026-098",
    report_id: "CR-2026-098",
    lat: 21.642,
    lng: 89.395,
    latitude: 21.642,
    longitude: 89.395,
    category: "illegal_logging",
    description: "Chainsaw noises and felled mature Sundari logs floating tied to country boats near Katka river bend. Armed woodcutters observed at dusk.",
    reporter_name: "Anonymous Citizen / Forest Eco-Patrol",
    photo_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80",
    created_at: "2026-10-18T16:40:00Z",
    status: "confirmed",
    linked_patch_id: "MW-2026-074C",
    officer_notes: "Patrol team intercepted 2 timber boats. Case registered with Forest Beat Officer."
  },
  {
    id: "CR-2026-079",
    report_id: "CR-2026-079",
    lat: 21.621,
    lng: 89.695,
    latitude: 21.621,
    longitude: 89.695,
    category: "erosion_cyclone",
    description: "Over 500 meters of mangrove mudbank collapsed into Passur channel after nocturnal tidal surge. Saline intrusion spreading inland.",
    reporter_name: "Fatima Khatun (Mongla Community)",
    photo_url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80",
    created_at: "2026-09-25T11:20:00Z",
    status: "confirmed",
    linked_patch_id: "MW-2026-061B",
    officer_notes: "Erosion barrier proposal submitted to Water Development Board."
  },
  {
    id: "CR-2026-052",
    report_id: "CR-2026-052",
    lat: 21.572,
    lng: 89.525,
    latitude: 21.572,
    longitude: 89.525,
    category: "dumping",
    description: "Industrial wastewater effluent discharge from cargo transit vessel causing black oily sheen and localized mangrove root die-off.",
    reporter_name: "Tarek Mahmud (Vessel Pilot)",
    photo_url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&auto=format&fit=crop&q=80",
    created_at: "2026-09-02T14:35:00Z",
    status: "pending",
    linked_patch_id: null,
    officer_notes: "Water quality samples scheduled for Department of Environment laboratory."
  },
  {
    id: "CR-2026-031",
    report_id: "CR-2026-031",
    lat: 21.554,
    lng: 89.340,
    latitude: 21.554,
    longitude: 89.340,
    category: "illegal_logging",
    description: "Secret charcoal kiln found concealed in deep jungle with freshly cut Goran wood piles.",
    reporter_name: "Forest Guard B. Roy",
    photo_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80",
    created_at: "2026-08-14T08:05:00Z",
    status: "confirmed",
    linked_patch_id: "MW-2025-019F",
    officer_notes: "Kiln dismantled, 4 tonnes of raw fuel wood seized."
  }
];
