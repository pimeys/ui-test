// Fake data for gavel365 test UI — all names/emails/addresses are made up

const PEOPLE = [
  { first: 'Alice', last: 'Thornton', email: 'alice.thornton@testmail.com', phone: '(212) 555-0101' },
  { first: 'Brian', last: 'Whitfield', email: 'b.whitfield@fakemail.org', phone: '(718) 555-0202' },
  { first: 'Carla', last: 'Jennings', email: 'carla.j@mockbox.net', phone: '(917) 555-0303' },
  { first: 'Derek', last: 'Nakamura', email: 'dnakamura@testinbox.com', phone: '(646) 555-0404' },
  { first: 'Elena', last: 'Petrova', email: 'elena.p@demomail.org', phone: '(516) 555-0505' },
  { first: 'Frank', last: 'DeLuca', email: 'fdeluca@samplemail.com', phone: '(347) 555-0606' },
  { first: 'Grace', last: 'Okafor', email: 'grace.o@testbox.net', phone: '(914) 555-0707' },
  { first: 'Henry', last: 'Bloom', email: 'hbloom@fakeinbox.org', phone: '(631) 555-0808' },
  { first: 'Irene', last: 'Vasquez', email: 'irene.v@mockmail.com', phone: '(845) 555-0909' },
  { first: 'James', last: 'Park', email: 'jpark@demobox.net', phone: '(201) 555-1010' },
  { first: 'Karen', last: 'Mitchell', email: 'kmitchell@testmail.com', phone: '(973) 555-1111' },
  { first: 'Leonard', last: 'Cross', email: 'lcross@fakebox.org', phone: '(908) 555-1212' },
  { first: 'Monica', last: 'Fields', email: 'mfields@samplebox.net', phone: '(732) 555-1313' },
  { first: 'Nathan', last: 'Webb', email: 'nwebb@testinbox.com', phone: '(551) 555-1414' },
  { first: 'Olivia', last: 'Grant', email: 'ogrant@mockmail.org', phone: '(862) 555-1515' },
  // These are the specific people the agent tasks reference (with fake names)
  { first: 'Joseph', last: 'Baretti', email: 'jbaretti@testmail.net', phone: '(212) 555-2001' },
  { first: 'Eileen', last: 'Harlow', email: 'eharlow@fakemail.org', phone: '(718) 555-2002' },
  { first: 'Sharon', last: 'Keane', email: 'skeane@mockbox.net', phone: '(917) 555-2003' },
  { first: 'Sharon Maria', last: 'Keane', email: 'smkeane@mockbox.net', phone: '(917) 555-2004' },
  { first: 'Gregory T.', last: 'Keane', email: 'gtkeane@mockbox.net', phone: '(917) 555-2005' },
  { first: 'Cameron', last: 'Keane', email: 'ckeane@mockbox.net', phone: '(917) 555-2006' },
  { first: 'Lori', last: 'Keane', email: 'lkeane@mockbox.net', phone: '(917) 555-2007' },
  { first: 'Devin', last: 'Keane', email: 'dkeane@mockbox.net', phone: '(917) 555-2008' },
  { first: 'Zoey', last: 'Keane', email: 'zkeane@mockbox.net', phone: '(917) 555-2009' },
  { first: 'Maria R.', last: 'Delgado', email: 'mrdelgado@demomail.org', phone: '(646) 555-2010' },
  { first: 'Michael', last: 'Preston', email: 'mpreston@testbox.net', phone: '(516) 555-2011' },
  { first: 'Steve', last: 'Vega', email: 'svega@samplemail.com', phone: '(347) 555-2012' },
  { first: 'Evelyn', last: 'Vega', email: 'evega@samplemail.com', phone: '(347) 555-2013' },
  { first: 'Miriam', last: 'Vega', email: 'mvega@samplemail.com', phone: '(347) 555-2014' },
  { first: 'Roman', last: 'Vega', email: 'rvega@samplemail.com', phone: '(347) 555-2015' },
  { first: 'Joshua', last: 'Vegaro', email: 'jvegaro@testmail.com', phone: '(914) 555-2016' },
  { first: 'Yoneiby', last: 'Vegaro', email: 'yvegaro@testmail.com', phone: '(914) 555-2017' },
  { first: 'Julia', last: 'Vegas', email: 'jvegas@fakemail.org', phone: '(631) 555-2018' },
];

const MATTERS = [
  { no: 'ADMIN', client: 'Law Office of Jane Doe', details: 'Estate Planning - ADMIN', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'IOLTA', client: 'Law Office of Jane Doe', details: 'Accounting - IOLTA', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0004', client: 'Thornton', details: 'Estate Planning - Thornton', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0005', client: 'Whitfield', details: 'Real Estate', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0006', client: 'Jennings', details: 'Estate Planning - Jennings', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0007', client: 'DeLuca', details: 'Landlord - Tenant - Petrova', staff: 'JD', status: 'RETURN DATE' },
  { no: 'GAVEL-0008', client: 'Preston', details: 'Guardianship of Adults - Queens County Guardianship', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0009', client: 'Delgado', details: 'Guardianship of Adults - Delgado', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0010', client: 'Bloom', details: 'Estate Planning - Grant, Bloom', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0011', client: 'Mitchell, Cross', details: 'Guardianship of Adults - New York County Supreme Court', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0012', client: 'Fields & Vasquez', details: 'Guardianship of Adults - Fields', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0013', client: 'Keane', details: 'Estate Planning - Keane, Keane', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0014', client: 'Webb', details: 'Elder Law - Webb Trust', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0015', client: 'Okafor', details: 'Family Law - Okafor', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0016', client: 'Park', details: 'Business & Corporate - Park LLC', staff: 'JD', status: 'IN PROGRESS' },
  { no: 'GAVEL-0017', client: 'Baretti', details: 'Criminal - Baretti', staff: 'JD', status: 'IN PROGRESS' },
];

const MATTER_TYPE_TREE = [
  { name: 'Banking & Finance', children: ['Banking Litigation', 'Loan Modification'] },
  { name: 'Bankruptcy', children: ['Chapter 7', 'Chapter 11', 'Chapter 13'] },
  { name: 'Business & Corporate', children: ['Business Formation', 'Contract Disputes', 'Mergers & Acquisitions'] },
  { name: 'Construction', children: ['Construction Defect', 'Mechanic\'s Liens'] },
  { name: 'Consumer Law', children: ['Consumer Protection', 'Product Liability'] },
  { name: 'Criminal', children: ['DUI/DWI', 'Felony Defense', 'Misdemeanor Defense'] },
  { name: 'Education Law', children: ['Special Education', 'Student Discipline'] },
  { name: 'Elder Law', children: ['Elder Abuse', 'Medicaid Planning'] },
  { name: 'Employment & Labor Law', children: ['Discrimination', 'Wage & Hour', 'Wrongful Termination'] },
  { name: 'Estate Administration and Probate', children: ['Guardianship of Adults', 'Probate', 'Trust Administration'] },
  { name: 'Estate Planning', children: ['Estate Planning'] },
  { name: 'Family Law', children: ['Adoption', 'Child Custody', 'Divorce'] },
  { name: 'Immigration', children: ['Employment Visas', 'Family Immigration', 'Naturalization'] },
  { name: 'Insurance', children: ['Bad Faith', 'Coverage Disputes'] },
  { name: 'Litigation', children: [
    'Arbitration', 'Civil Appeal', 'Civil Litigation', 'Commercial Litigation',
    'Debt Recovery & Enforcement', 'Eminent Domain / Condemnation', 'Environmental Law',
    'Estates & Trusts', 'Federal General Litigation', 'Foreclosure', 'General Litigation',
    'Insurance Litigation', 'Landlord - Tenant'
  ]},
  { name: 'Personal Injury', children: ['Auto Accident', 'Medical Malpractice', 'Slip & Fall'] },
  { name: 'Real Estate', children: ['Commercial Real Estate', 'Residential Real Estate'] },
  { name: 'Tax Law', children: ['Tax Controversy', 'Tax Planning'] },
];

// Matter type descriptions
const MATTER_TYPE_INFO = {
  'Estate Planning': 'Estate Planning matters involve the organization and documentation of an individual\'s wishes regarding asset distribution, guardianship, and healthcare decisions through legal instruments like wills, trusts, and powers of attorney.',
  'Landlord - Tenant': 'For matters related to landlord tenant disputes in New York',
  'Guardianship of Adults': 'Matters involving the appointment of a legal guardian for an incapacitated adult, including court proceedings and fiduciary responsibilities.',
  'Probate': 'Administration and settlement of a deceased person\'s estate through the court system.',
  'Divorce': 'Legal dissolution of a marriage, including property division, alimony, and child custody arrangements.',
};

// Default party roles per matter type
const MATTER_TYPE_PARTIES = {
  'Estate Planning': { client: 'Client', otherSide: '', otherAttorney: '', otherInsurer: '' },
  'Landlord - Tenant': { client: 'Petitioner', otherSide: 'Respondent', otherAttorney: 'Respondent\'s Attorney', otherInsurer: '' },
  'Guardianship of Adults': { client: 'Petitioner', otherSide: 'Alleged Incapacitated Person', otherAttorney: 'Court Evaluator', otherInsurer: '' },
  'Divorce': { client: 'Plaintiff', otherSide: 'Defendant', otherAttorney: 'Defendant\'s Attorney', otherInsurer: '' },
};

// Leads data for the Access Legal equivalent page
const LEADS = [
  { id: 1553837, area: 'Guardianship', jurisdiction: 'Ozone Park, NY 11417', name: 'Aisha Koroma', phone: '(212) 555-1831', email: 'akoroma@testmail.com', created: '2026-04-15' },
  { id: 1553676, area: 'Guardianship', jurisdiction: 'Columbus, NJ 08022', name: 'Donna Park-Henry', phone: '(609) 555-0284', email: 'dph83715@fakemail.com', created: '2026-04-14' },
  { id: 1553485, area: 'Estate', jurisdiction: 'Brooklyn, NY 11229', name: 'Guy Palmer', phone: '(917) 555-7791', email: 'gpalmer8690@mockmail.com', created: '2026-04-13' },
  { id: 1553336, area: 'Guardianship', jurisdiction: 'New York County, NY', name: 'Karina Novak', phone: '(917) 555-7739', email: 'knovak2006@demomail.com', created: '2026-04-12' },
  { id: 1542822, area: 'Guardianship', jurisdiction: 'Bronx, Bronx County, NY', name: 'Eleton James', phone: '(843) 555-7205', email: 'ejames@testbox.com', created: '2026-03-28' },
  { id: 1542713, area: 'Estate', jurisdiction: 'Ridge, Suffolk County, NY', name: 'Jose Ortiz', phone: '(646) 555-0842', email: 'jortiz_40@fakemail.com', created: '2026-03-27' },
  { id: 1542606, area: 'Estate', jurisdiction: 'Manhattan, New York County, NY', name: 'Robert Kane', phone: '(516) 555-6041', email: 'rkane212@mockmail.com', created: '2026-03-26' },
  { id: 1542485, area: 'Estate', jurisdiction: 'Ronkonkoma, Suffolk County, NY', name: 'Joseph Savino', phone: '(516) 555-2404', email: 'jsavino@testinbox.com', created: '2026-03-25' },
  { id: 1542083, area: 'Estate', jurisdiction: 'East Hampton, Suffolk County, NY', name: 'Victor Cruz', phone: '(516) 555-0865', email: 'vcruz4@demomail.com', created: '2026-03-24' },
  { id: 1541962, area: 'Guardianship', jurisdiction: 'Bronx, Bronx County, NY', name: 'Adrienne Robinson', phone: '(347) 555-4026', email: 'arobinson391@testmail.com', created: '2026-03-23' },
  { id: 1541581, area: 'Estate', jurisdiction: 'New Rochelle, Westchester County, NY', name: 'Pradeep Kumar', phone: '(914) 555-8894', email: 'pkumar4@fakemail.com', created: '2026-03-22' },
  { id: 1541558, area: 'Estate', jurisdiction: 'Albertson, Nassau County, NY', name: 'Alan Seltzer', phone: '(516) 555-7077', email: 'aseltzer@mockmail.com', created: '2026-03-21' },
  { id: 1541429, area: 'Estate', jurisdiction: 'Elmont, Nassau County, NY', name: 'Norma Roth', phone: '(646) 555-6844', email: 'nroth61@demomail.com', created: '2026-02-28' },
  { id: 1541359, area: 'Estate', jurisdiction: 'Commack, Suffolk County, NY', name: 'William Brooks', phone: '(603) 555-9816', email: 'wbrooks14@testbox.com', created: '2026-02-27' },
  { id: 1541112, area: 'Estate', jurisdiction: 'Massapequa Park, Nassau County, NY', name: 'Frank Martino', phone: '(516) 555-2540', email: 'fmartino@fakeinbox.com', created: '2026-02-26' },
  { id: 1540879, area: 'Guardianship', jurisdiction: 'Yonkers, Westchester County, NY', name: 'Maria Santos', phone: '(646) 555-7354', email: 'msantos2@samplemail.com', created: '2026-02-25' },
  { id: 1540684, area: 'Estate', jurisdiction: 'Mount Sinai, Suffolk County, NY', name: 'Barbara Cole', phone: '(516) 555-1152', email: 'bcole113@testinbox.com', created: '2026-02-24' },
];
