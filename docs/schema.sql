-- SOMFIX Property & Maintenance Operations — MVP starter schema

create table properties (
  id uuid primary key,
  property_code varchar(30) unique not null,
  name varchar(160) not null,
  property_type varchar(60) not null,
  owner_name varchar(160),
  phone varchar(40),
  address text,
  district varchar(80),
  city varchar(80) default 'Mogadishu',
  latitude decimal(10,7),
  longitude decimal(10,7),
  notes text,
  created_at timestamp not null,
  updated_at timestamp not null
);

create table property_units (
  id uuid primary key,
  property_id uuid not null references properties(id),
  unit_code varchar(40) not null,
  bedrooms integer,
  bathrooms decimal(4,1),
  square_feet decimal(10,2),
  status varchar(30) not null default 'vacant',
  market_rent decimal(12,2),
  currency char(3) not null default 'USD',
  notes text,
  unique(property_id, unit_code)
);

create table tenants (
  id uuid primary key,
  full_name varchar(160) not null,
  phone varchar(40) not null,
  whatsapp varchar(40),
  email varchar(160),
  preferred_contact varchar(30),
  status varchar(30) not null default 'active',
  notes text,
  created_at timestamp not null,
  updated_at timestamp not null
);

create table leases (
  id uuid primary key,
  lease_code varchar(30) unique not null,
  tenant_id uuid not null references tenants(id),
  unit_id uuid not null references property_units(id),
  start_date date not null,
  end_date date not null,
  monthly_rent decimal(12,2) not null,
  currency char(3) not null default 'USD',
  security_deposit decimal(12,2),
  payment_due_day integer,
  late_fee decimal(12,2),
  status varchar(30) not null default 'pending',
  notes text
);

create table maintenance_requests (
  id uuid primary key,
  request_code varchar(30) unique not null,
  property_id uuid not null references properties(id),
  unit_id uuid references property_units(id),
  tenant_id uuid references tenants(id),
  category varchar(80) not null,
  priority varchar(20) not null default 'normal',
  description text not null,
  status varchar(30) not null default 'new',
  reported_at timestamp not null,
  closed_at timestamp,
  created_at timestamp not null,
  updated_at timestamp not null
);

create table job_orders (
  id uuid primary key,
  job_code varchar(30) unique not null,
  maintenance_request_id uuid references maintenance_requests(id),
  property_id uuid references properties(id),
  unit_id uuid references property_units(id),
  assigned_user_id uuid,
  scheduled_at timestamp,
  started_at timestamp,
  completed_at timestamp,
  customer_price decimal(12,2),
  labor_cost decimal(12,2) default 0,
  material_cost decimal(12,2) default 0,
  transport_cost decimal(12,2) default 0,
  status varchar(30) not null default 'scheduled',
  notes text
);

create table invoices (
  id uuid primary key,
  invoice_code varchar(30) unique not null,
  job_order_id uuid references job_orders(id),
  tenant_id uuid references tenants(id),
  total decimal(12,2) not null,
  currency char(3) not null default 'USD',
  due_date date,
  status varchar(30) not null default 'unpaid',
  created_at timestamp not null
);

create table payments (
  id uuid primary key,
  invoice_id uuid not null references invoices(id),
  amount decimal(12,2) not null,
  currency char(3) not null default 'USD',
  method varchar(40) not null,
  reference_no varchar(100),
  paid_at timestamp not null,
  received_by uuid
);

