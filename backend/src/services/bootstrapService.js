const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');
const ServiceCenter = require('../models/ServiceCenter');
const Technician = require('../models/Technician');
const Appointment = require('../models/Appointment');

const defaultServices = [
  {
    name: 'Device Diagnostics',
    description: 'Full hardware and software diagnostics for any smart device.',
    duration: 30,
    basePrice: 25
  },
  {
    name: 'Express Repair Consultation',
    description: 'Meet a technician to triage repair options and timelines.',
    duration: 20,
    basePrice: 15
  },
  {
    name: 'Warranty Claim Support',
    description: 'Guided assistance preparing documentation for warranty claims.',
    duration: 40,
    basePrice: 0
  }
];

async function ensureServiceCenters() {
  const defaultCenters = [
    {
      name: 'Downtown Service Center',
      address: '123 Main Street, Downtown',
      location: { type: 'Point', coordinates: [80.2167, 6.9271] },
      phone: '+94112345678',
      email: 'downtown@servicecenter.dev',
      operatingHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '14:00' },
        sunday: { open: '', close: '' }
      },
      facilities: ['WiFi', 'Waiting Lounge', 'Coffee', 'Certified Technicians'],
      rating: 4.5,
      totalRatings: 120,
      currentQueueLength: 3,
      averageWaitTime: 25
    },
    {
      name: 'Westside Auto Care',
      address: '456 West Avenue, Westside',
      location: { type: 'Point', coordinates: [80.1950, 6.9497] },
      phone: '+94112345679',
      email: 'westside@servicecenter.dev',
      operatingHours: {
        monday: { open: '07:30', close: '19:00' },
        tuesday: { open: '07:30', close: '19:00' },
        wednesday: { open: '07:30', close: '19:00' },
        thursday: { open: '07:30', close: '19:00' },
        friday: { open: '07:30', close: '19:00' },
        saturday: { open: '08:00', close: '16:00' },
        sunday: { open: '', close: '' }
      },
      facilities: ['WiFi', 'Waiting Lounge', 'Valet Parking', 'Express Service'],
      rating: 4.8,
      totalRatings: 95,
      currentQueueLength: 2,
      averageWaitTime: 20
    }
  ];

  for (const center of defaultCenters) {
    const existing = await ServiceCenter.findOne({ name: center.name });
    if (!existing) {
      await ServiceCenter.create(center);
      console.log(`Seeded service center: ${center.name}`);
    }
  }
}

async function ensureAdminUsers() {
  const downtown = await ServiceCenter.findOne({ name: 'Downtown Service Center' });
  const westside = await ServiceCenter.findOne({ name: 'Westside Auto Care' });

  const staffUsers = [
    // ─── Downtown Service Center Staff ──────────────────────────────
    {
      name: 'Downtown Admin',
      email: 'admin@servicecenter.dev',
      role: 'admin',
      password: 'Admin123!',
      serviceCenter: downtown?._id || null
    },
    {
      name: 'Downtown Inventory Manager',
      email: 'manager@servicecenter.dev',
      role: 'manager',
      password: 'Manager123!',
      serviceCenter: downtown?._id || null
    },
    {
      name: 'Downtown Supervisor',
      email: 'supervisor@servicecenter.dev',
      role: 'supervisor',
      password: 'Supervisor123!',
      serviceCenter: downtown?._id || null
    },
    {
      name: 'Downtown Cashier',
      email: 'cashier@servicecenter.dev',
      role: 'cashier',
      password: 'Cashier123!',
      serviceCenter: downtown?._id || null
    },
    {
      name: 'Downtown Receptionist',
      email: 'receptionist@servicecenter.dev',
      role: 'receptionist',
      password: 'Receptionist123!',
      serviceCenter: downtown?._id || null
    },

    // ─── Westside Auto Care Staff ────────────────────────────────────
    {
      name: 'Westside Admin',
      email: 'admin.westside@servicecenter.dev',
      role: 'admin',
      password: 'Admin123!',
      serviceCenter: westside?._id || null
    },
    {
      name: 'Westside Inventory Manager',
      email: 'manager.westside@servicecenter.dev',
      role: 'manager',
      password: 'Manager123!',
      serviceCenter: westside?._id || null
    },
    {
      name: 'Westside Supervisor',
      email: 'supervisor.westside@servicecenter.dev',
      role: 'supervisor',
      password: 'Supervisor123!',
      serviceCenter: westside?._id || null
    },
    {
      name: 'Westside Cashier',
      email: 'cashier.westside@servicecenter.dev',
      role: 'cashier',
      password: 'Cashier123!',
      serviceCenter: westside?._id || null
    },
    {
      name: 'Westside Receptionist',
      email: 'receptionist.westside@servicecenter.dev',
      role: 'receptionist',
      password: 'Receptionist123!',
      serviceCenter: westside?._id || null
    }
  ];

  for (const staff of staffUsers) {
    const existing = await User.findOne({ email: staff.email.toLowerCase() });
    if (!existing) {
      await User.create({
        name: staff.name,
        email: staff.email.toLowerCase(),
        role: staff.role,
        passwordHash: bcrypt.hashSync(staff.password, 10),
        serviceCenter: staff.serviceCenter
      });
      console.log(`Seeded staff user ${staff.email} for center ${staff.serviceCenter}`);
    } else if (!existing.serviceCenter && staff.serviceCenter) {
      existing.serviceCenter = staff.serviceCenter;
      await existing.save();
      console.log(`Linked staff user ${staff.email} to service center`);
    }
  }
}

async function ensureServices() {
  const count = await Service.countDocuments();
  if (count > 0) return;
  await Service.insertMany(defaultServices);
  console.log('Seeded default services');
}

async function ensureTechnicians() {
  const downtown = await ServiceCenter.findOne({ name: 'Downtown Service Center' });
  const westside = await ServiceCenter.findOne({ name: 'Westside Auto Care' });

  // Update any existing technicians missing serviceCenter
  if (downtown) {
    await Technician.updateMany(
      { $or: [{ serviceCenter: null }, { serviceCenter: { $exists: false } }] },
      { $set: { serviceCenter: downtown._id } }
    );
  }

  const count = await Technician.countDocuments();
  if (count === 0) {
    const defaultTechnicians = [
      {
        name: 'Kasun Perera',
        phone: '+94771234567',
        email: 'kasun@servicecenter.dev',
        specialization: 'Full Body & Washing Specialist',
        experienceYears: 5,
        status: 'active',
        serviceCenter: downtown?._id || null,
        skills: ['Full Body', 'Body Wash', 'Interior Cleaning'],
        totalJobs: 142,
        averageRating: 4.8,
        successRate: 98
      },
      {
        name: 'Nimal Fernando',
        phone: '+94772345678',
        email: 'nimal@servicecenter.dev',
        specialization: 'Engine & Mechanical Triage',
        experienceYears: 7,
        status: 'active',
        serviceCenter: downtown?._id || null,
        skills: ['Diagnostics', 'Engine Wash', 'Repair'],
        totalJobs: 210,
        averageRating: 4.9,
        successRate: 99
      },
      {
        name: 'Sunera Silva',
        phone: '+94773456789',
        email: 'sunera@servicecenter.dev',
        specialization: 'Interior & Detailing Expert',
        experienceYears: 3,
        status: 'active',
        serviceCenter: westside?._id || null,
        skills: ['Interior Cleaning', 'Polishing', 'Vacuuming'],
        totalJobs: 85,
        averageRating: 4.6,
        successRate: 95
      },
      {
        name: 'Ruwan Kumara',
        phone: '+94774567890',
        email: 'ruwan@servicecenter.dev',
        specialization: 'Express Maintenance & Oil Change',
        experienceYears: 4,
        status: 'active',
        serviceCenter: westside?._id || null,
        skills: ['Express Service', 'Oil Change', 'Filter Replacement'],
        totalJobs: 115,
        averageRating: 4.7,
        successRate: 97
      }
    ];
    await Technician.insertMany(defaultTechnicians);
    console.log('Seeded technicians for both service centers');
  } else if (westside) {
    // Ensure Westside has technicians
    const westsideTechs = await Technician.countDocuments({ serviceCenter: westside._id });
    if (westsideTechs === 0) {
      await Technician.insertMany([
        {
          name: 'Sunera Silva',
          phone: '+94773456789',
          email: 'sunera@servicecenter.dev',
          specialization: 'Interior & Detailing Expert',
          experienceYears: 3,
          status: 'active',
          serviceCenter: westside._id,
          skills: ['Interior Cleaning', 'Polishing', 'Vacuuming'],
          totalJobs: 85,
          averageRating: 4.6,
          successRate: 95
        },
        {
          name: 'Ruwan Kumara',
          phone: '+94774567890',
          email: 'ruwan@servicecenter.dev',
          specialization: 'Express Maintenance & Oil Change',
          experienceYears: 4,
          status: 'active',
          serviceCenter: westside._id,
          skills: ['Express Service', 'Oil Change', 'Filter Replacement'],
          totalJobs: 115,
          averageRating: 4.7,
          successRate: 97
        }
      ]);
      console.log('Seeded technicians for Westside Auto Care');
    }
  }
}

async function ensureAppointments() {
  const downtown = await ServiceCenter.findOne({ name: 'Downtown Service Center' });
  const westside = await ServiceCenter.findOne({ name: 'Westside Auto Care' });
  const service = await Service.findOne();

  // If downtown appointments exist without serviceCenter, link them
  if (downtown) {
    await Appointment.updateMany(
      { $or: [{ serviceCenter: null }, { serviceCenter: { $exists: false } }] },
      { $set: { serviceCenter: downtown._id } }
    );
  }

  // Ensure Westside Auto Care has sample queue appointments
  if (westside && service) {
    const westsideAppts = await Appointment.countDocuments({ serviceCenter: westside._id });
    if (westsideAppts === 0) {
      await Appointment.insertMany([
        {
          customerName: 'Saman Kumara',
          customerEmail: 'saman@example.com',
          customerPhone: '+94712345678',
          serviceCenter: westside._id,
          service: service._id,
          serviceId: service._id.toString(),
          serviceName: service.name,
          preferredDate: new Date().toISOString().split('T')[0],
          preferredTime: '10:00 AM',
          queueNumber: 201,
          confirmationCode: 'APPT-0201',
          status: 'in_progress',
          queueStatus: 'serving',
          estimatedCost: service.basePrice || 25,
          estimatedDuration: service.duration || 30
        },
        {
          customerName: 'Dilani Silva',
          customerEmail: 'dilani@example.com',
          customerPhone: '+94719876543',
          serviceCenter: westside._id,
          service: service._id,
          serviceId: service._id.toString(),
          serviceName: service.name,
          preferredDate: new Date().toISOString().split('T')[0],
          preferredTime: '11:30 AM',
          queueNumber: 202,
          confirmationCode: 'APPT-0202',
          status: 'booked',
          queueStatus: 'waiting',
          estimatedCost: service.basePrice || 25,
          estimatedDuration: service.duration || 30
        }
      ]);
      console.log('Seeded sample appointments for Westside Auto Care');
    }
  }
}

async function bootstrapData() {
  await ensureServiceCenters();
  await ensureAdminUsers();
  await ensureServices();
  await ensureTechnicians();
  await ensureAppointments();
}

module.exports = {
  bootstrapData
};
