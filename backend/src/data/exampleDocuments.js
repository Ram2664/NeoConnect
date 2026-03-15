const sampleUsers = [
  {
    name: "Asha Rao",
    email: "asha@neoconnect.com",
    password: "hashed-password-example",
    role: "Staff",
    department: "Operations",
    isActive: true
  },
  {
    name: "David Paul",
    email: "david@neoconnect.com",
    password: "hashed-password-example",
    role: "Secretariat",
    department: "Management",
    isActive: true
  },
  {
    name: "Mina Das",
    email: "mina@neoconnect.com",
    password: "hashed-password-example",
    role: "Case Manager",
    department: "HR",
    isActive: true
  },
  {
    name: "John Peter",
    email: "john@neoconnect.com",
    password: "hashed-password-example",
    role: "Admin",
    department: "IT",
    isActive: true
  }
];

const sampleComplaints = [
  {
    trackingId: "NEO-2026-001",
    title: "Broken emergency exit light",
    description: "The light near Block B exit is not working.",
    category: "Safety",
    department: "Operations",
    location: "Block B",
    severity: "High",
    anonymous: false,
    attachmentUrl: "/uploads/example-photo.png",
    attachmentName: "example-photo.png",
    status: "Assigned",
    publicUpdate: "Maintenance team has been notified."
  }
];

const samplePolls = [
  {
    question: "Which topic should the next staff town hall cover?",
    description: "Choose one option below.",
    options: [
      { label: "Workplace safety", votes: 12 },
      { label: "Facilities upgrades", votes: 9 },
      { label: "HR policies", votes: 5 }
    ],
    active: true
  }
];

const sampleVotes = [
  {
    user: "66b000000000000000000001",
    poll: "66b000000000000000000010",
    optionIndex: 0
  }
];

const sampleMeetingMinutes = [
  {
    title: "Quarter 1 Staff Council Minutes",
    quarter: "Q1 2026",
    meetingDate: "2026-01-25T00:00:00.000Z",
    pdfUrl: "/uploads/q1-minutes.pdf",
    pdfName: "q1-minutes.pdf"
  }
];

module.exports = {
  sampleUsers,
  sampleComplaints,
  samplePolls,
  sampleVotes,
  sampleMeetingMinutes
};
