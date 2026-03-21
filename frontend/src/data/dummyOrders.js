export const dummyOrders = [
  {
    _id: "ORD-992841",
    isDummy: true,
    demandId: {
      title: "Premium Sugarcane Supply - Satara Region",
      ratePerTon: 3450,
    },
    farmerId: {
      name: "Rajesh Gaikwad",
      phone: "+91 98220 12345",
      email: "rajesh.g@farm.com"
    },
    quantity: 45,
    status: "Delivered",
    dispatchDetails: {
      driverName: "Suresh Patil",
      driverPhone: "+91 88888 11223",
      vehicleNumber: "MH-11-BV-4452",
      expectedDelivery: "2026-03-15T10:00:00Z",
      dispatchDate: "2026-03-14T08:30:00Z"
    },
    paymentStatus: "Paid",
    paymentDetails: {
      preOrderAmount: 50000,
      postDeliveryAmount: 105250,
      totalAmount: 155250,
      paymentMethod: "Bank Transfer"
    },
    farmers: [
      { name: "Rajesh Gaikwad", quantity: 25 },
      { name: "Sanjay Mane", quantity: 20 }
    ],
    documents: [
      { name: "Purchase Agreement", type: "PDF", date: "2026-03-14" },
      { name: "e-Way Bill", type: "PDF", date: "2026-03-14" },
      { name: "Weighbridge Receipt", type: "Image", date: "2026-03-15" }
    ]
  },
  {
    _id: "ORD-993102",
    isDummy: true,
    demandId: {
      title: "Winter Harvest - Bulk Collection",
      ratePerTon: 3200,
    },
    farmerId: {
      name: "Amol Deshmukh",
      phone: "+91 94220 54321",
    },
    quantity: 120,
    status: "In Transit",
    dispatchDetails: {
      driverName: "Vijay Kadam",
      driverPhone: "+91 77777 99001",
      vehicleNumber: "MH-12-FG-7781",
      expectedDelivery: "2026-03-21T18:00:00Z",
      dispatchDate: "2026-03-19T06:00:00Z"
    },
    paymentStatus: "Pending",
    paymentDetails: {
      preOrderAmount: 100000,
      postDeliveryAmount: 284000,
      totalAmount: 384000
    },
    farmers: [
      { name: "Amol Deshmukh", quantity: 50 },
      { name: "Prakash Shinde", quantity: 40 },
      { name: "Vitthal More", quantity: 30 }
    ],
    documents: [
      { name: "Standard Contract", type: "PDF", date: "2026-03-18" },
      { name: "Logistics Pass", type: "PDF", date: "2026-03-19" }
    ]
  },
  {
    _id: "ORD-994215",
    isDummy: true,
    demandId: {
      title: "Late Season Emergency Demand",
      ratePerTon: 3600,
    },
    farmerId: {
      name: "Sunil Pawar",
    },
    quantity: 28,
    status: "Dispatched",
    dispatchDetails: {
      driverName: "Rahul Chavan",
      driverPhone: "+91 99001 22334",
      vehicleNumber: "KA-05-YT-1122",
      dispatchDate: "2026-03-20T11:00:00Z"
    },
    paymentStatus: "Pending",
    paymentDetails: {
      preOrderAmount: 30000,
      totalAmount: 100800
    },
    farmers: [
      { name: "Sunil Pawar", quantity: 28 }
    ],
    documents: [
      { name: "Urgent Procurement Order", type: "PDF", date: "2026-03-20" }
    ]
  },
  {
    _id: "ORD-995001",
    isDummy: true,
    demandId: {
      title: "Organic Sugarcane Lot #04",
      ratePerTon: 4100,
    },
    farmerId: {
      name: "Kisan Sahakari Samiti",
    },
    quantity: 60,
    status: "Processing",
    paymentStatus: "Pending",
    paymentDetails: {
      totalAmount: 246000
    },
    farmers: [
      { name: "Farmer Cooperative A", quantity: 60 }
    ],
    documents: [
      { name: "Organic Certification Agreement", type: "PDF", date: "2026-03-19" }
    ]
  }
];
