import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  await prisma.hotProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.marketingMaterial.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.station.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash("123456", 10);

  // Create Super Admin
  const admin = await prisma.user.create({
    data: {
      name: "系统管理员",
      email: "admin@ddcm.com",
      phone: "13800000000",
      password: defaultPassword,
      role: "SUPER_ADMIN",
      avatarUrl: "https://picsum.photos/seed/admin/200/200",
    },
  });

  // Create Agent User + Agent
  const agentUser = await prisma.user.create({
    data: {
      name: "王代理",
      email: "agent@ddcm.com",
      phone: "13800000001",
      password: defaultPassword,
      role: "COUNTY_AGENT",
      avatarUrl: "https://picsum.photos/seed/agent/200/200",
    },
  });

  const agent = await prisma.agent.create({
    data: {
      userId: agentUser.id,
      name: "王代理",
      phone: "13800000001",
      region: "北京市朝阳区",
      commissionRate: 0.15,
      basePrice: 299,
    },
  });

  // Create Station Master 1
  const stationUser1 = await prisma.user.create({
    data: {
      name: "张站长",
      email: "zhang@ddcm.com",
      phone: "13800000002",
      password: defaultPassword,
      role: "STATION_MASTER",
      avatarUrl: "https://picsum.photos/seed/zhang/200/200",
    },
  });

  const station1 = await prisma.station.create({
    data: {
      userId: stationUser1.id,
      name: "立水桥提货点",
      phone: "13800000002",
      address: "北京市朝阳区立水桥南里2号",
      avatarUrl: "https://picsum.photos/seed/station1/200/200",
      agentId: agent.id,
      planType: "BASIC",
      status: "APPROVED",
    },
  });

  // Create Station Master 2
  const stationUser2 = await prisma.user.create({
    data: {
      name: "李站长",
      email: "li@ddcm.com",
      phone: "13800000003",
      password: defaultPassword,
      role: "STATION_MASTER",
      avatarUrl: "https://picsum.photos/seed/li/200/200",
    },
  });

  const station2 = await prisma.station.create({
    data: {
      userId: stationUser2.id,
      name: "望京提货点",
      phone: "13800000003",
      address: "北京市朝阳区望京SOHO T1",
      avatarUrl: "https://picsum.photos/seed/station2/200/200",
      agentId: agent.id,
      planType: "ADVANCED",
      status: "APPROVED",
    },
  });

  // Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        openid: "wx_customer_001",
        phone: "13900001111",
        password: defaultPassword,
        nickname: "小王",
        avatarUrl: "https://picsum.photos/seed/c1/100/100",
        stationId: station1.id,
      },
    }),
    prisma.customer.create({
      data: {
        openid: "wx_customer_002",
        phone: "13900002222",
        password: defaultPassword,
        nickname: "小李",
        avatarUrl: "https://picsum.photos/seed/c2/100/100",
        stationId: station1.id,
      },
    }),
    prisma.customer.create({
      data: {
        openid: "wx_customer_003",
        phone: "13900003333",
        password: defaultPassword,
        nickname: "小张",
        avatarUrl: "https://picsum.photos/seed/c3/100/100",
        stationId: station1.id,
      },
    }),
    prisma.customer.create({
      data: {
        openid: "wx_customer_004",
        phone: "13900004444",
        password: defaultPassword,
        nickname: "小赵",
        avatarUrl: "https://picsum.photos/seed/c4/100/100",
        stationId: station1.id,
      },
    }),
    prisma.customer.create({
      data: {
        openid: "wx_customer_005",
        phone: "13900005555",
        password: defaultPassword,
        nickname: "小陈",
        avatarUrl: "https://picsum.photos/seed/c5/100/100",
        stationId: station2.id,
      },
    }),
  ]);

  // Create Complaints
  await prisma.complaint.createMany({
    data: [
      {
        customerId: customers[0].id,
        stationId: station1.id,
        problemType: "MISSING",
        description: "订单里少了一袋大米，5斤装的那种，麻烦站长帮忙处理一下",
        images: JSON.stringify(["https://picsum.photos/seed/food1/400/300"]),
        orderNo: "DD20260501001",
        status: "PENDING",
      },
      {
        customerId: customers[1].id,
        stationId: station1.id,
        problemType: "DAMAGED",
        description: "收到的鸡蛋碎了好几个，盒子都变形了，需要赔偿",
        images: JSON.stringify(["https://picsum.photos/seed/food2/400/300", "https://picsum.photos/seed/food3/400/300"]),
        orderNo: "DD20260501002",
        status: "PENDING",
      },
      {
        customerId: customers[2].id,
        stationId: station1.id,
        problemType: "WRONG_ITEM",
        description: "我买的是苹果，结果收到了梨子，希望能换一下",
        images: JSON.stringify(["https://picsum.photos/seed/food4/400/300"]),
        orderNo: "DD20260501003",
        status: "RESOLVED",
        resolveType: "replace",
        resolveRemark: "已联系客户，明天补发苹果",
        resolvedAt: new Date("2026-05-10T10:00:00"),
      },
      {
        customerId: customers[3].id,
        stationId: station1.id,
        problemType: "QUALITY",
        description: "西红柿都烂了，完全不能吃，要求退款",
        images: JSON.stringify(["https://picsum.photos/seed/food5/400/300"]),
        orderNo: "DD20260501004",
        status: "RESOLVED",
        resolveType: "refund",
        resolveRemark: "已退款15元",
        resolvedAt: new Date("2026-05-09T14:00:00"),
      },
      {
        customerId: customers[0].id,
        stationId: station1.id,
        problemType: "MISSING",
        description: "订单少了一瓶酱油，麻烦补发",
        orderNo: "DD20260501005",
        status: "ESCALATED",
      },
      {
        customerId: customers[4].id,
        stationId: station2.id,
        problemType: "DAMAGED",
        description: "牛奶包装破了，漏了一袋子",
        images: JSON.stringify(["https://picsum.photos/seed/food6/400/300"]),
        orderNo: "DD20260501006",
        status: "PENDING",
      },
    ],
  });

  // Create Jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        stationId: station1.id,
        title: "夜班分拣员",
        requirements: "年龄18-45岁，能接受夜班工作，有责任心",
        salary: "4500-6000元/月",
        workLocation: "北京市朝阳区立水桥",
        workLocationDetail: "立水桥南里2号仓库",
        contactPhone: "13800000002",
      },
    }),
    prisma.job.create({
      data: {
        stationId: station1.id,
        title: "配送司机",
        requirements: "C1驾照，熟悉朝阳区路线，有配送经验优先",
        salary: "6000-8000元/月",
        workLocation: "北京市朝阳区",
        contactPhone: "13800000002",
      },
    }),
    prisma.job.create({
      data: {
        stationId: station2.id,
        title: "兼职理货员",
        requirements: "工作认真负责，能搬运货物",
        salary: "20元/小时",
        workLocation: "北京市朝阳区望京",
        contactPhone: "13800000003",
      },
    }),
  ]);

  // Create Job Applications
  await prisma.jobApplication.createMany({
    data: [
      { jobId: jobs[0].id, name: "刘小明", phone: "13700001111", status: "PENDING" },
      { jobId: jobs[0].id, name: "王大力", phone: "13700002222", status: "HIRED" },
      { jobId: jobs[1].id, name: "张师傅", phone: "13700003333", status: "PENDING" },
      { jobId: jobs[2].id, name: "李小花", phone: "13700004444", status: "PENDING" },
    ],
  });

  // Create Hot Products
  await prisma.hotProduct.createMany({
    data: [
      { stationId: station1.id, title: "新疆阿克苏苹果5斤装", imageUrl: "https://picsum.photos/seed/hot1/300/300", price: 29.9, pddPath: "pages/goods/detail?goods_id=10001", sortOrder: 1 },
      { stationId: station1.id, title: "赣南脐橙3斤装", imageUrl: "https://picsum.photos/seed/hot2/300/300", price: 19.9, pddPath: "pages/goods/detail?goods_id=10002", sortOrder: 2 },
      { stationId: station1.id, title: "东北五常大米10斤", imageUrl: "https://picsum.photos/seed/hot3/300/300", price: 39.9, pddPath: "pages/goods/detail?goods_id=10003", sortOrder: 3 },
      { stationId: station1.id, title: "散养土鸡蛋30枚", imageUrl: "https://picsum.photos/seed/hot4/300/300", price: 25.8, pddPath: "pages/goods/detail?goods_id=10004", sortOrder: 4 },
      { stationId: station1.id, title: "云南鲜花饼礼盒", imageUrl: "https://picsum.photos/seed/hot5/300/300", price: 35.0, pddPath: "pages/goods/detail?goods_id=10005", sortOrder: 5 },
      { stationId: station1.id, title: "内蒙古牛肉干200g", imageUrl: "https://picsum.photos/seed/hot6/300/300", price: 42.8, pddPath: "pages/goods/detail?goods_id=10006", sortOrder: 6 },
    ],
  });

  // Create Products (Mall)
  const products = await Promise.all([
    prisma.product.create({
      data: {
        stationId: station1.id,
        name: "新鲜有机蔬菜礼盒",
        images: JSON.stringify(["https://picsum.photos/seed/p1/400/400", "https://picsum.photos/seed/p1b/400/400"]),
        description: "精选当季有机蔬菜，包含西兰花、胡萝卜、黄瓜、西红柿等8种蔬菜，新鲜直达。",
        price: 49.9,
        originalPrice: 69.9,
        stock: 100,
        salesCount: 256,
      },
    }),
    prisma.product.create({
      data: {
        stationId: station1.id,
        name: "智利进口车厘子1斤",
        images: JSON.stringify(["https://picsum.photos/seed/p2/400/400"]),
        description: "JJ级智利车厘子，果径28-30mm，甜度高，果肉紧实。",
        price: 59.9,
        originalPrice: 89.9,
        stock: 50,
        salesCount: 189,
      },
    }),
    prisma.product.create({
      data: {
        stationId: station1.id,
        name: "澳洲安格斯牛排200g*4片",
        images: JSON.stringify(["https://picsum.photos/seed/p3/400/400", "https://picsum.photos/seed/p3b/400/400"]),
        description: "原切牛排，不拼接不合成，肉质鲜嫩多汁，送黄油和黑椒酱。",
        price: 99.0,
        originalPrice: 158.0,
        stock: 30,
        salesCount: 128,
      },
    }),
    prisma.product.create({
      data: {
        stationId: station1.id,
        name: "三都港黄花鱼500g",
        images: JSON.stringify(["https://picsum.photos/seed/p4/400/400"]),
        description: "冰鲜黄花鱼，肉质细刺少，适合清蒸红烧。",
        price: 29.9,
        originalPrice: 45.0,
        stock: 80,
        salesCount: 342,
      },
    }),
    prisma.product.create({
      data: {
        stationId: station1.id,
        name: "农夫山泉NFC果汁12瓶",
        images: JSON.stringify(["https://picsum.photos/seed/p5/400/400"]),
        description: "100%鲜榨果汁，不加糖不加水，橙汁/苹果汁/芒果汁混装。",
        price: 68.0,
        originalPrice: 88.0,
        stock: 200,
        salesCount: 567,
      },
    }),
    prisma.product.create({
      data: {
        stationId: station2.id,
        name: "东北黑木耳250g",
        images: JSON.stringify(["https://picsum.photos/seed/p6/400/400"]),
        description: "长白山野生黑木耳，朵大肉厚，泡发率高。",
        price: 18.9,
        originalPrice: 28.0,
        stock: 150,
        salesCount: 234,
      },
    }),
    prisma.product.create({
      data: {
        stationId: station2.id,
        name: "云南普洱茶饼357g",
        images: JSON.stringify(["https://picsum.photos/seed/p7/400/400"]),
        description: "2024年春茶，古树普洱生茶，回甘持久。",
        price: 128.0,
        originalPrice: 198.0,
        stock: 20,
        salesCount: 45,
      },
    }),
    prisma.product.create({
      data: {
        stationId: station1.id,
        name: "本地散养土鸡1只",
        images: JSON.stringify(["https://picsum.photos/seed/p8/400/400"]),
        description: "农村散养180天以上，肉质紧实，炖汤鲜美。约2.5-3斤/只。",
        price: 78.0,
        originalPrice: 98.0,
        stock: 25,
        salesCount: 89,
      },
    }),
    prisma.product.create({
      data: {
        stationId: station1.id,
        name: "手工水饺（猪肉白菜）500g*3袋",
        images: JSON.stringify(["https://picsum.photos/seed/p9/400/400"]),
        description: "手工包制，皮薄馅大，每袋约30个，方便速食。",
        price: 39.9,
        originalPrice: 55.0,
        stock: 60,
        salesCount: 178,
      },
    }),
    prisma.product.create({
      data: {
        stationId: station2.id,
        name: "阳澄湖大闸蟹4对装",
        images: JSON.stringify(["https://picsum.photos/seed/p10/400/400"]),
        description: "公蟹3.5两+母蟹2.5两，鲜活到家，死蟹包赔。",
        price: 188.0,
        originalPrice: 298.0,
        stock: 15,
        salesCount: 34,
      },
    }),
  ]);

  // Create Addresses
  await prisma.address.createMany({
    data: [
      {
        customerId: customers[0].id,
        name: "王小明",
        phone: "13900001111",
        province: "北京市",
        city: "北京市",
        district: "朝阳区",
        detail: "立水桥北里1号楼3单元502",
        isDefault: true,
      },
      {
        customerId: customers[0].id,
        name: "王小明",
        phone: "13900001111",
        province: "北京市",
        city: "北京市",
        district: "海淀区",
        detail: "中关村大街1号",
        isDefault: false,
      },
      {
        customerId: customers[1].id,
        name: "李小红",
        phone: "13900002222",
        province: "北京市",
        city: "北京市",
        district: "朝阳区",
        detail: "望京西园三区301楼1205室",
        isDefault: true,
      },
    ],
  });

  // Create Orders
  const order1 = await prisma.order.create({
    data: {
      orderNo: "ORD20260501001",
      customerId: customers[0].id,
      stationId: station1.id,
      totalAmount: 109.8,
      status: "COMPLETED",
      receiverName: "王小明",
      receiverPhone: "13900001111",
      receiverAddress: "北京市朝阳区立水桥北里1号楼3单元502",
      logisticsCompany: "顺丰速运",
      logisticsNo: "SF1234567890",
      payTime: new Date("2026-05-01T10:00:00"),
      shipTime: new Date("2026-05-01T16:00:00"),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, productId: products[0].id, productName: "新鲜有机蔬菜礼盒", productImage: "https://picsum.photos/seed/p1/400/400", price: 49.9, quantity: 1, subtotal: 49.9 },
      { orderId: order1.id, productId: products[1].id, productName: "智利进口车厘子1斤", productImage: "https://picsum.photos/seed/p2/400/400", price: 59.9, quantity: 1, subtotal: 59.9 },
    ],
  });

  const order2 = await prisma.order.create({
    data: {
      orderNo: "ORD20260502001",
      customerId: customers[1].id,
      stationId: station1.id,
      totalAmount: 99.0,
      status: "SHIPPED",
      receiverName: "李小红",
      receiverPhone: "13900002222",
      receiverAddress: "北京市朝阳区望京西园三区301楼1205室",
      logisticsCompany: "中通快递",
      logisticsNo: "ZT9876543210",
      payTime: new Date("2026-05-02T14:00:00"),
      shipTime: new Date("2026-05-03T09:00:00"),
    },
  });

  await prisma.orderItem.create({
    data: { orderId: order2.id, productId: products[2].id, productName: "澳洲安格斯牛排200g*4片", productImage: "https://picsum.photos/seed/p3/400/400", price: 99.0, quantity: 1, subtotal: 99.0 },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNo: "ORD20260503001",
      customerId: customers[2].id,
      stationId: station1.id,
      totalAmount: 68.0,
      status: "PAID",
      receiverName: "张小强",
      receiverPhone: "13900003333",
      receiverAddress: "北京市朝阳区立水桥南里5号楼",
      payTime: new Date("2026-05-03T11:00:00"),
    },
  });

  await prisma.orderItem.create({
    data: { orderId: order3.id, productId: products[4].id, productName: "农夫山泉NFC果汁12瓶", productImage: "https://picsum.photos/seed/p5/400/400", price: 68.0, quantity: 1, subtotal: 68.0 },
  });

  const order4 = await prisma.order.create({
    data: {
      orderNo: "ORD20260504001",
      customerId: customers[3].id,
      stationId: station1.id,
      totalAmount: 78.0,
      status: "UNPAID",
      receiverName: "赵小丽",
      receiverPhone: "13900004444",
      receiverAddress: "北京市朝阳区大屯路甲1号",
    },
  });

  await prisma.orderItem.create({
    data: { orderId: order4.id, productId: products[7].id, productName: "本地散养土鸡1只", productImage: "https://picsum.photos/seed/p8/400/400", price: 78.0, quantity: 1, subtotal: 78.0 },
  });

  // Create Withdrawal Requests
  await prisma.withdrawalRequest.createMany({
    data: [
      { stationId: station1.id, amount: 500.0, status: "PENDING", bankInfo: "工商银行 6222****1234" },
      { stationId: station1.id, amount: 1000.0, status: "APPROVED", bankInfo: "工商银行 6222****1234", reviewedBy: admin.id, reviewedAt: new Date("2026-05-05T10:00:00") },
      { stationId: station2.id, amount: 800.0, status: "COMPLETED", bankInfo: "建设银行 6227****5678", reviewedBy: admin.id, reviewedAt: new Date("2026-05-04T15:00:00") },
    ],
  });

  // Create Marketing Materials
  await prisma.marketingMaterial.createMany({
    data: [
      { title: "新站长招募海报", type: "IMAGE", url: "https://picsum.photos/seed/mat1/800/600", description: "用于招募新站长的宣传海报", agentId: agent.id },
      { title: "爆品推荐话术", type: "DOCUMENT", url: "#", description: "每日爆品推荐的标准话术模板", agentId: agent.id },
      { title: "售后处理流程图", type: "IMAGE", url: "https://picsum.photos/seed/mat2/800/600", description: "客诉处理标准流程", agentId: agent.id },
      { title: "系统使用教程", type: "VIDEO", url: "#", description: "站长后台操作视频教程", agentId: null },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
