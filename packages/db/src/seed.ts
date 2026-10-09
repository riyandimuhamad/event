import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Clear tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.benefitEvent.deleteMany();
  await prisma.benefit.deleteMany();
  await prisma.consumptionDistribution.deleteMany();
  await prisma.consumptionSlot.deleteMany();
  await prisma.sponsorDeliverable.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.talentCommunication.deleteMany();
  await prisma.talentShow.deleteMany();
  await prisma.talent.deleteMany();
  await prisma.crewAttendance.deleteMany();
  await prisma.vendorCrew.deleteMany();
  await prisma.vendorOrder.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.requisitionEvent.deleteMany();
  await prisma.requisitionItem.deleteMany();
  await prisma.task.deleteMany();
  await prisma.requisition.deleteMany();
  await prisma.printJob.deleteMany();
  await prisma.inventoryDistribution.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.volunteerShift.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.committeeMember.deleteMany();
  await prisma.divisionMember.deleteMany();
  await prisma.division.deleteMany();
  await prisma.eventPhase.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'Nusantara Creative Event Organizer',
      slug: 'nusantara-creative',
      description: 'Penyelenggara festival musik dan pameran kreatif nasional.',
    },
  });

  console.log('Seeding Users & Roles...');
  // 1 akun per peran untuk pengujian RBAC
  const userOwner = await prisma.user.create({
    data: {
      email: 'owner@eventops.local',
      fullName: 'Bambang Riyandi (EO Owner)',
      phone: '081200000001',
    },
  });

  const userEventManager = await prisma.user.create({
    data: {
      email: 'eventmanager@eventops.local',
      fullName: 'Siti Rahma (Event Manager)',
      phone: '081200000002',
    },
  });

  const userHeadAcara = await prisma.user.create({
    data: {
      email: 'head.acara@eventops.local',
      fullName: 'Ahmad Faisal (Head Acara)',
      phone: '081200000003',
    },
  });

  const userHeadLogistik = await prisma.user.create({
    data: {
      email: 'head.logistik@eventops.local',
      fullName: 'Dewi Lestari (Head Logistik)',
      phone: '081200000004',
    },
  });

  const userHeadKonsumsi = await prisma.user.create({
    data: {
      email: 'head.konsumsi@eventops.local',
      fullName: 'Rian Pratama (Head Konsumsi)',
      phone: '081200000005',
    },
  });

  const userCommittee = await prisma.user.create({
    data: {
      email: 'committee@eventops.local',
      fullName: 'Doni Firmansyah (Committee Acara)',
      phone: '081200000006',
    },
  });

  const userVolunteer = await prisma.user.create({
    data: {
      email: 'volunteer@eventops.local',
      fullName: 'Anisa Putri (Volunteer)',
      phone: '081200000007',
    },
  });

  const userTalentMgr = await prisma.user.create({
    data: {
      email: 'talentmgr@eventops.local',
      fullName: 'Gilang Ramadhan (Talent Manager)',
      phone: '081200000008',
    },
  });

  const userSponsorRep = await prisma.user.create({
    data: {
      email: 'sponsorrep@eventops.local',
      fullName: 'Maya Safira (Sponsor Rep - Telkomsel)',
      phone: '081200000009',
    },
  });

  const userVendorAdmin = await prisma.user.create({
    data: {
      email: 'vendoradmin@eventops.local',
      fullName: 'Hendra Gunawan (Vendor Admin Sound)',
      phone: '081200000010',
    },
  });

  // Organization members
  await prisma.organizationMember.createMany({
    data: [
      { organizationId: org.id, userId: userOwner.id, role: 'OWNER' },
      { organizationId: org.id, userId: userEventManager.id, role: 'ADMIN' },
      { organizationId: org.id, userId: userHeadAcara.id, role: 'MEMBER' },
      { organizationId: org.id, userId: userHeadLogistik.id, role: 'MEMBER' },
      { organizationId: org.id, userId: userHeadKonsumsi.id, role: 'MEMBER' },
      { organizationId: org.id, userId: userCommittee.id, role: 'MEMBER' },
      { organizationId: org.id, userId: userVolunteer.id, role: 'MEMBER' },
    ],
  });

  console.log('Seeding Event...');
  const now = new Date();
  const startsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead
  const endsAt = new Date(startsAt.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days duration

  const event = await prisma.event.create({
    data: {
      organizationId: org.id,
      name: 'Festival Musik Nusantara 2026',
      slug: 'fmn-2026',
      description: 'Festival musik dan seni budaya terbesar tahun 2026.',
      venueName: 'Gelora Bung Karno Parkir Timur',
      venueAddress: 'Jl. Pintu Satu Senayan, Gelora, Kecamatan Tanah Abang, Jakarta Pusat',
      startsAt,
      endsAt,
      status: 'ACTIVE',
      currentPhase: 'PRE_EVENT',
      expectedAttendees: 5000,
    },
  });

  // Event Phases
  await prisma.eventPhase.createMany({
    data: [
      {
        eventId: event.id,
        phase: 'PRE_EVENT',
        title: 'Persiapan dan Pengambilan Perlengkapan',
        startsAt: new Date(startsAt.getTime() - 14 * 24 * 60 * 60 * 1000),
        endsAt: startsAt,
        status: 'ACTIVE',
      },
      {
        eventId: event.id,
        phase: 'DAY_OF',
        title: 'Hari Pelaksanaan Acara',
        startsAt,
        endsAt,
        status: 'PLANNED',
      },
      {
        eventId: event.id,
        phase: 'POST_EVENT',
        title: 'Pencairan Benefit & Laporan Akhir',
        startsAt: endsAt,
        endsAt: new Date(endsAt.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'PLANNED',
      },
    ],
  });

  console.log('Seeding 6 Divisions...');
  const divAcara = await prisma.division.create({
    data: {
      organizationId: org.id,
      eventId: event.id,
      name: 'Divisi Acara',
      code: 'ACR',
      description: 'Pengisi acara, rundown, panggung, dan koordinasi pertunjukan.',
      headUserId: userHeadAcara.id,
      sortOrder: 1,
    },
  });

  const divLogistik = await prisma.division.create({
    data: {
      organizationId: org.id,
      eventId: event.id,
      name: 'Divisi Logistik & Perlengkapan',
      code: 'LOG',
      description: 'Peralatan teknis, panggung, tenda, kursi, dan transportasi.',
      headUserId: userHeadLogistik.id,
      sortOrder: 2,
    },
  });

  const divKonsumsi = await prisma.division.create({
    data: {
      organizationId: org.id,
      eventId: event.id,
      name: 'Divisi Konsumsi',
      code: 'KSM',
      description: 'Katering makanan panitia, talent, vendor, dan air minum.',
      headUserId: userHeadKonsumsi.id,
      sortOrder: 3,
    },
  });

  const divSponsorship = await prisma.division.create({
    data: {
      organizationId: org.id,
      eventId: event.id,
      name: 'Divisi Sponsorship',
      code: 'SPN',
      description: 'Hubungan dengan mitra sponsor dan pemenuhan deliverable.',
      sortOrder: 4,
    },
  });

  const divHumas = await prisma.division.create({
    data: {
      organizationId: org.id,
      eventId: event.id,
      name: 'Divisi Hubungan Masyarakat & Publikasi',
      code: 'HMS',
      description: 'Media partner, promosi sosmed, dan dokumentasi.',
      sortOrder: 5,
    },
  });

  const divKeuangan = await prisma.division.create({
    data: {
      organizationId: org.id,
      eventId: event.id,
      name: 'Divisi Keuangan & Bendahara',
      code: 'KEU',
      description: 'Anggaran belanja, verifikasi invoice, dan pencairan benefit.',
      sortOrder: 6,
    },
  });

  // Division membership
  await prisma.divisionMember.createMany({
    data: [
      { divisionId: divAcara.id, userId: userHeadAcara.id, role: 'HEAD' },
      { divisionId: divAcara.id, userId: userCommittee.id, role: 'MEMBER' },
      { divisionId: divLogistik.id, userId: userHeadLogistik.id, role: 'HEAD' },
      { divisionId: divKonsumsi.id, userId: userHeadKonsumsi.id, role: 'HEAD' },
    ],
  });

  console.log('Seeding Shifts...');
  const shiftPagiHari1 = await prisma.shift.create({
    data: {
      eventId: event.id,
      divisionId: divAcara.id,
      name: 'Shift Pagi Hari 1 (07.00 - 15.00)',
      startsAt: new Date(startsAt.getTime() + 7 * 3600 * 1000),
      endsAt: new Date(startsAt.getTime() + 15 * 3600 * 1000),
      capacity: 50,
    },
  });

  const shiftMalamHari1 = await prisma.shift.create({
    data: {
      eventId: event.id,
      divisionId: divAcara.id,
      name: 'Shift Malam Hari 1 (15.00 - 23.00)',
      startsAt: new Date(startsAt.getTime() + 15 * 3600 * 1000),
      endsAt: new Date(startsAt.getTime() + 23 * 3600 * 1000),
      capacity: 50,
    },
  });

  console.log('Seeding 20 Committee Members...');
  const committeeNames = [
    'Doni Firmansyah', 'Bella Anggraini', 'Cahyo Wibowo', 'Dina Marlina', 'Eko Prasetyo',
    'Farah Diba', 'Gunawan Saputra', 'Hesti Purwanti', 'Indra Gunawan', 'Joko Susilo',
    'Kartika Sari', 'Lukman Hakim', 'Mega Utami', 'Nanda Pratama', 'Oki Setiawan',
    'Priska Damayanti', 'Qori Iskandar', 'Rini Sulistyo', 'Surya Saputra', 'Tiara Andini'
  ];

  for (let i = 0; i < committeeNames.length; i++) {
    const div = [divAcara, divLogistik, divKonsumsi, divSponsorship, divHumas, divKeuangan][i % 6];
    await prisma.committeeMember.create({
      data: {
        organizationId: org.id,
        eventId: event.id,
        divisionId: div.id,
        fullName: committeeNames[i],
        email: `committee.${i + 1}@eventops.local`,
        phone: `081234000${(i + 1).toString().padStart(3, '0')}`,
        position: i === 0 ? 'Koordinator Lapangan' : `Staf ${div.name}`,
        confirmed: true,
      },
    });
  }

  console.log('Seeding 150 Volunteers...');
  const shirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const volunteerFirstNames = ['Adi', 'Budi', 'Citra', 'Dimas', 'Eka', 'Fajar', 'Gita', 'Hadi', 'Intan', 'Junaedi'];
  const volunteerLastNames = ['Kusuma', 'Santoso', 'Wijaya', 'Siregar', 'Hidayat', 'Nugroho', 'Pranata', 'Saputra', 'Utomo', 'Yuliana'];

  const volunteersToInsert = [];
  for (let i = 1; i <= 150; i++) {
    const code = `VOL-${i.toString().padStart(4, '0')}`;
    const fn = volunteerFirstNames[i % volunteerFirstNames.length];
    const ln = volunteerLastNames[Math.floor(i / 10) % volunteerLastNames.length];
    const div = [divAcara, divLogistik, divKonsumsi, divHumas][i % 4];
    volunteersToInsert.push({
      organizationId: org.id,
      eventId: event.id,
      code,
      fullName: `${fn} ${ln}`,
      email: `volunteer.${i}@eventops.local`,
      phone: `0818${i.toString().padStart(6, '0')}`,
      shirtSize: shirtSizes[i % shirtSizes.length],
      divisionId: div.id,
      registrationStatus: i <= 130 ? 'APPROVED' : (i <= 145 ? 'PENDING' : 'REJECTED'),
    });
  }
  await prisma.volunteer.createMany({ data: volunteersToInsert });

  // Assign shifts to some approved volunteers
  const approvedVols = await prisma.volunteer.findMany({
    where: { eventId: event.id, registrationStatus: 'APPROVED' },
    take: 40,
  });

  for (let i = 0; i < approvedVols.length; i++) {
    const shift = i < 20 ? shiftPagiHari1 : shiftMalamHari1;
    await prisma.volunteerShift.create({
      data: {
        volunteerId: approvedVols[i].id,
        shiftId: shift.id,
        status: 'ASSIGNED',
      },
    });
  }

  console.log('Seeding Inventory Items (Kaos, ID Card, Perlengkapan)...');
  const kaosM = await prisma.inventoryItem.create({
    data: {
      eventId: event.id,
      category: 'SHIRT',
      variant: 'M',
      name: 'Kaos Panitia & Volunteer (Size M)',
      totalStock: 80,
      distributed: 12,
    },
  });

  const kaosL = await prisma.inventoryItem.create({
    data: {
      eventId: event.id,
      category: 'SHIRT',
      variant: 'L',
      name: 'Kaos Panitia & Volunteer (Size L)',
      totalStock: 90,
      distributed: 15,
    },
  });

  const idCardItem = await prisma.inventoryItem.create({
    data: {
      eventId: event.id,
      category: 'ID_CARD',
      variant: 'Standard',
      name: 'ID Card Badge + Lanyard Acara',
      totalStock: 250,
      distributed: 30,
    },
  });

  console.log('Seeding 10 Requisitions with different statuses...');
  const reqData = [
    {
      code: 'REQ-0001',
      title: 'Panggung Utama & Rigging Sound 20.000 Watt',
      fromDivisionId: divAcara.id,
      toDivisionId: divLogistik.id,
      priority: 'URGENT',
      status: 'APPROVED',
      requestedBy: userHeadAcara.id,
      approvedBy: userHeadLogistik.id,
      items: [
        { name: 'Panggung Utama 12x10 meter', quantity: 1, unit: 'unit' },
        { name: 'Rigging Aluminium Heavy Duty', quantity: 1, unit: 'set' },
      ],
    },
    {
      code: 'REQ-0002',
      title: 'Konsumsi Nasi Kotak Gladi Bersih (H-1)',
      fromDivisionId: divAcara.id,
      toDivisionId: divKonsumsi.id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      requestedBy: userHeadAcara.id,
      approvedBy: userHeadKonsumsi.id,
      items: [
        { name: 'Nasi Kotak Ayam Bakar', quantity: 75, unit: 'porsi' },
        { name: 'Air Mineral Botol 600ml', quantity: 3, unit: 'dus' },
      ],
    },
    {
      code: 'REQ-0003',
      title: 'HT (Handy Talkie) 30 Unit untuk Lapangan',
      fromDivisionId: divAcara.id,
      toDivisionId: divLogistik.id,
      priority: 'HIGH',
      status: 'SUBMITTED',
      requestedBy: userHeadAcara.id,
      items: [
        { name: 'HT UHF Dual Band + Earset', quantity: 30, unit: 'unit' },
      ],
    },
    {
      code: 'REQ-0004',
      title: 'Kebutuhan Tenda Booth Sponsor (10 Booth)',
      fromDivisionId: divSponsorship.id,
      toDivisionId: divLogistik.id,
      priority: 'MEDIUM',
      status: 'DRAFT',
      requestedBy: userOwner.id,
      items: [
        { name: 'Tenda Sarnafil 3x3 meter', quantity: 10, unit: 'unit' },
        { name: 'Meja Lipat & 2 Kursi per booth', quantity: 10, unit: 'set' },
      ],
    },
    {
      code: 'REQ-0005',
      title: 'Snack Box VIP untuk Jumpa Pers',
      fromDivisionId: divHumas.id,
      toDivisionId: divKonsumsi.id,
      priority: 'MEDIUM',
      status: 'FULFILLED',
      requestedBy: userOwner.id,
      approvedBy: userHeadKonsumsi.id,
      items: [
        { name: 'Snack Box Premium (3 Kue + Air)', quantity: 40, unit: 'kotak' },
      ],
    },
    {
      code: 'REQ-0006',
      title: 'Pencetakan Backdrop Press Conference 6x3m',
      fromDivisionId: divHumas.id,
      toDivisionId: divLogistik.id,
      priority: 'LOW',
      status: 'CLOSED',
      requestedBy: userOwner.id,
      approvedBy: userHeadLogistik.id,
      items: [
        { name: 'Backdrop Flexi Korea 440gsm', quantity: 1, unit: 'buah' },
      ],
    },
    {
      code: 'REQ-0007',
      title: 'Genset Cadangan 100 KVA untuk Area F&B',
      fromDivisionId: divKonsumsi.id,
      toDivisionId: divLogistik.id,
      priority: 'URGENT',
      status: 'REJECTED',
      requestedBy: userHeadKonsumsi.id,
      approvedBy: userHeadLogistik.id,
      items: [
        { name: 'Genset Silent 100 KVA', quantity: 1, unit: 'unit' },
      ],
    },
    {
      code: 'REQ-0008',
      title: 'Barikade Pembatas Antrean Tiket 100 Meter',
      fromDivisionId: divAcara.id,
      toDivisionId: divLogistik.id,
      priority: 'HIGH',
      status: 'APPROVED',
      requestedBy: userHeadAcara.id,
      approvedBy: userHeadLogistik.id,
      items: [
        { name: 'Barikade Besi Mojo 2m', quantity: 50, unit: 'unit' },
      ],
    },
    {
      code: 'REQ-0009',
      title: 'Konsumsi Hari H Pagi (Sarapan Panitia)',
      fromDivisionId: divAcara.id,
      toDivisionId: divKonsumsi.id,
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      requestedBy: userHeadAcara.id,
      approvedBy: userHeadKonsumsi.id,
      items: [
        { name: 'Bubur Ayam & Teh Manis Hangat', quantity: 120, unit: 'porsi' },
      ],
    },
    {
      code: 'REQ-0010',
      title: 'Kamera Live Streaming & Operator 2 Orang',
      fromDivisionId: divHumas.id,
      toDivisionId: divLogistik.id,
      priority: 'MEDIUM',
      status: 'DRAFT',
      requestedBy: userOwner.id,
      items: [
        { name: 'Sony FX3 + Wireless Transmitter', quantity: 2, unit: 'set' },
      ],
    },
  ];

  for (const r of reqData) {
    const req = await prisma.requisition.create({
      data: {
        organizationId: org.id,
        eventId: event.id,
        code: r.code,
        title: r.title,
        fromDivisionId: r.fromDivisionId,
        toDivisionId: r.toDivisionId,
        priority: r.priority,
        status: r.status,
        requestedBy: r.requestedBy,
        approvedBy: r.approvedBy,
      },
    });

    for (const itm of r.items) {
      await prisma.requisitionItem.create({
        data: {
          requisitionId: req.id,
          name: itm.name,
          quantity: itm.quantity,
          unit: itm.unit,
        },
      });
    }

    // Add initial event
    await prisma.requisitionEvent.create({
      data: {
        requisitionId: req.id,
        fromStatus: null,
        toStatus: r.status,
        actorId: r.requestedBy,
        reason: r.status === 'REJECTED' ? 'Kapasitas daya genset utama sudah mencukupi 250 KVA.' : null,
      },
    });
  }

  console.log('Seeding 4 Vendors & Crews...');
  const vendorCatering = await prisma.vendor.create({
    data: {
      organizationId: org.id,
      name: 'CV Berkah Rasa Catering',
      category: 'CATERING',
      contactName: 'Ibu Ratna',
      contactPhone: '081288991122',
      contactEmail: 'berkah.catering@gmail.com',
    },
  });

  const vendorSound = await prisma.vendor.create({
    data: {
      organizationId: org.id,
      name: 'Melody Sound & Lighting Pro',
      category: 'SOUND',
      contactName: 'Hendra Gunawan',
      contactPhone: '081399887766',
      contactEmail: 'melody.sound@gmail.com',
    },
  });

  const vendorPanggung = await prisma.vendor.create({
    data: {
      organizationId: org.id,
      name: 'Megah Truss & Rigging Production',
      category: 'EQUIPMENT',
      contactName: 'Pak Joko',
      contactPhone: '081177665544',
      contactEmail: 'megah.rigging@gmail.com',
    },
  });

  const vendorSecurity = await prisma.vendor.create({
    data: {
      organizationId: org.id,
      name: 'Garda Wibawa Security Services',
      category: 'SECURITY',
      contactName: 'Kapten Aris',
      contactPhone: '081900112233',
      contactEmail: 'garda.security@gmail.com',
    },
  });

  // Vendor orders
  await prisma.vendorOrder.create({
    data: {
      eventId: event.id,
      vendorId: vendorSound.id,
      divisionId: divLogistik.id,
      description: 'Sewa Line Array Sound System 20.000 Watt + Lighting Rig',
      amount: BigInt(45000000), // Rp 45.000.000
      status: 'CONFIRMED',
    },
  });

  // Vendor crews
  for (let i = 1; i <= 10; i++) {
    await prisma.vendorCrew.create({
      data: {
        eventId: event.id,
        vendorId: i <= 5 ? vendorSound.id : vendorCatering.id,
        fullName: `Crew ${i <= 5 ? 'Sound' : 'Katering'} ${i}`,
        role: i <= 5 ? 'Operator Audio & Kabel' : 'Petugas Distribusi Makanan',
        phone: `08770000100${i}`,
      },
    });
  }

  console.log('Seeding 2 Talents...');
  const talent1 = await prisma.talent.create({
    data: {
      eventId: event.id,
      name: 'Kunto Aji & The Overground',
      category: 'Musik Indie Pop',
      managementName: 'Ramu Records Management',
      managementContact: '081299001122',
      managementEmail: 'management@kuntoaji.com',
      riderNotes: '2 Wireless Vocal Mic Shure Beta 58, IEM Senheiser, Ruang Tunggu AC + Snack Tradisional',
      fee: BigInt(65000000), // Rp 65.000.000
      contractStatus: 'SIGNED',
    },
  });

  const talent2 = await prisma.talent.create({
    data: {
      eventId: event.id,
      name: 'Nadin Amizah',
      category: 'Musik Folk Pop',
      managementName: 'Sorai Management',
      managementContact: '081388776655',
      managementEmail: 'contact@sorai.id',
      riderNotes: 'Akustik Guitar D.I. Box, 1 Vocal Mic, Akomodasi Hotel Bintang 4 untuk 8 kru',
      fee: BigInt(50000000),
      contractStatus: 'SIGNED',
    },
  });

  await prisma.talentShow.create({
    data: {
      talentId: talent1.id,
      stageName: 'Panggung Utama Garuda',
      startsAt: new Date(startsAt.getTime() + 19 * 3600 * 1000), // 19.00
      endsAt: new Date(startsAt.getTime() + 20 * 3600 * 1000 + 30 * 60 * 1000), // 20.30
      status: 'SCHEDULED',
    },
  });

  console.log('Seeding 3 Sponsors...');
  const sponsor1 = await prisma.sponsor.create({
    data: {
      eventId: event.id,
      companyName: 'PT Telekomunikasi Selular (Telkomsel)',
      packageName: 'Platinum Partner',
      packageValue: BigInt(150000000), // Rp 150.000.000
      paymentStatus: 'PAID',
      amountPaid: BigInt(150000000),
      repName: 'Maya Safira',
      repEmail: 'maya.safira@telkomsel.co.id',
      repUserId: userSponsorRep.id,
    },
  });

  await prisma.sponsorDeliverable.createMany({
    data: [
      { sponsorId: sponsor1.id, title: 'Booth Experience 6x6 Meter di Area Foyer', status: 'IN_PROGRESS' },
      { sponsorId: sponsor1.id, title: 'Penayangan Video Iklan 60 Detik di LED Screen Panggung Utama', status: 'DELIVERED' },
      { sponsorId: sponsor1.id, title: 'Logo Ukuran Utama di Seluruh ID Card, Poster, dan Tiket', status: 'DELIVERED' },
    ],
  });

  await prisma.sponsor.create({
    data: {
      eventId: event.id,
      companyName: 'Bank Central Asia (BCA)',
      packageName: 'Gold Partner (Official Banking)',
      packageValue: BigInt(85000000),
      paymentStatus: 'PARTIAL',
      amountPaid: BigInt(50000000),
      repName: 'Budi Santoso',
      repEmail: 'budi_santoso@bca.co.id',
    },
  });

  await prisma.sponsor.create({
    data: {
      eventId: event.id,
      companyName: 'Hydro Coco',
      packageName: 'Silver Partner (Official Beverage)',
      packageValue: BigInt(35000000),
      paymentStatus: 'UNPAID',
      amountPaid: BigInt(0),
      repName: 'Kevin Wijaya',
      repEmail: 'kevin@hydrococo.com',
    },
  });

  console.log('Seeding 3 Consumption Slots per day for 2 days...');
  const slotsData = [
    { kind: 'BREAKFAST', label: 'Sarapan Pagi Hari 1', hour: 7, target: 120, served: 110 },
    { kind: 'LUNCH', label: 'Makan Siang Hari 1', hour: 12, target: 180, served: 145 },
    { kind: 'DINNER', label: 'Makan Malam Hari 1', hour: 18, target: 180, served: 0 },
    { kind: 'BREAKFAST', label: 'Sarapan Pagi Hari 2', hour: 31, target: 120, served: 0 },
    { kind: 'LUNCH', label: 'Makan Siang Hari 2', hour: 36, target: 180, served: 0 },
    { kind: 'DINNER', label: 'Makan Malam Hari 2', hour: 42, target: 180, served: 0 },
  ];

  for (const s of slotsData) {
    await prisma.consumptionSlot.create({
      data: {
        eventId: event.id,
        kind: s.kind,
        label: s.label,
        startsAt: new Date(startsAt.getTime() + s.hour * 3600 * 1000),
        endsAt: new Date(startsAt.getTime() + (s.hour + 3) * 3600 * 1000),
        targetRecipients: s.target,
        servedCount: s.served,
        status: s.served > 0 ? 'OPEN' : 'OPEN',
      },
    });
  }

  console.log('Seeding Benefits (Fee & Certificate)...');
  const sampleVols = approvedVols.slice(0, 10);
  for (let i = 0; i < sampleVols.length; i++) {
    const v = sampleVols[i];
    // Fee
    await prisma.benefit.create({
      data: {
        eventId: event.id,
        recipientType: 'VOLUNTEER',
        recipientId: v.id,
        kind: 'FEE',
        amount: BigInt(250000), // Rp 250.000 uang saku/fee relawan
        status: i < 5 ? 'PAID' : (i < 8 ? 'PROCESSING' : 'UNPAID'),
        paidAt: i < 5 ? new Date() : null,
      },
    });

    // Certificate
    await prisma.benefit.create({
      data: {
        eventId: event.id,
        recipientType: 'VOLUNTEER',
        recipientId: v.id,
        kind: 'CERTIFICATE',
        status: i < 4 ? 'DELIVERED' : (i < 7 ? 'PRINTED' : 'NOT_PRINTED'),
        certificateNumber: `CERT/FMN2026/2026/${(i + 1).toString().padStart(4, '0')}`,
      },
    });
  }

  console.log('Seeding Audit Log...');
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: org.id,
        eventId: event.id,
        actorId: userOwner.id,
        action: 'event.created',
        entityType: 'Event',
        entityId: event.id,
        after: { name: event.name, status: event.status },
      },
      {
        organizationId: org.id,
        eventId: event.id,
        actorId: userHeadLogistik.id,
        action: 'requisition.approved',
        entityType: 'Requisition',
        entityId: (await prisma.requisition.findFirst())?.id || event.id,
        before: { status: 'SUBMITTED' },
        after: { status: 'APPROVED' },
      },
    ],
  });

  console.log('Seed successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
