export interface FieldTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  defaultConstraints?: {
    prefix?: string;
    suffix?: string;
    padLength?: number;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    decimal?: number;
    format?: string;
    startDate?: string;
    endDate?: string;
    minWords?: number;
    maxWords?: number;
  };
  category: 'identification' | 'business' | 'personal' | 'technical' | 'location' | 'media';
}

export const fieldTemplates: FieldTemplate[] = [
  // Identification templates
  {
    id: 'product_code',
    name: 'Product Code',
    type: 'string',
    description: 'Product identifier with custom prefix',
    category: 'identification',
    defaultConstraints: {
      prefix: 'PC-',
      padLength: 5,
      minLength: 3,
      maxLength: 20
    }
  },
  {
    id: 'product_id',
    name: 'Product ID',
    type: 'string',
    description: 'Product identifier with P prefix',
    category: 'identification',
    defaultConstraints: {
      prefix: 'P-',
      padLength: 6,
      minLength: 3,
      maxLength: 15
    }
  },
  {
    id: 'order_number',
    name: 'Order Number',
    type: 'string',
    description: 'Order number with prefix',
    category: 'identification',
    defaultConstraints: {
      prefix: 'ORD-',
      padLength: 8,
      minLength: 5,
      maxLength: 20
    }
  },
  {
    id: 'invoice_number',
    name: 'Invoice Number',
    type: 'string',
    description: 'Invoice number with prefix',
    category: 'identification',
    defaultConstraints: {
      prefix: 'INV-',
      padLength: 8,
      minLength: 5,
      maxLength: 20
    }
  },
  {
    id: 'serial_number',
    name: 'Serial Number',
    type: 'string',
    description: 'Device serial number',
    category: 'technical',
    defaultConstraints: {
      prefix: 'SN-',
      padLength: 10,
      minLength: 8,
      maxLength: 25
    }
  },
  {
    id: 'batch_number',
    name: 'Batch Number',
    type: 'string',
    description: 'Production batch identifier',
    category: 'technical',
    defaultConstraints: {
      prefix: 'B-',
      padLength: 6,
      minLength: 5,
      maxLength: 15
    }
  },
  {
    id: 'tracking_number',
    name: 'Tracking Number',
    type: 'string',
    description: 'Shipping tracking number',
    category: 'business',
    defaultConstraints: {
      prefix: 'TRK-',
      padLength: 12,
      minLength: 10,
      maxLength: 30
    }
  },
  {
    id: 'reference_id',
    name: 'Reference ID',
    type: 'string',
    description: 'General reference identifier',
    category: 'identification',
    defaultConstraints: {
      prefix: 'REF-',
      padLength: 8,
      minLength: 5,
      maxLength: 20
    }
  },
  {
    id: 'case_number',
    name: 'Case Number',
    type: 'string',
    description: 'Support case identifier',
    category: 'business',
    defaultConstraints: {
      prefix: 'CS-',
      padLength: 6,
      minLength: 5,
      maxLength: 15
    }
  },
  {
    id: 'ticket_number',
    name: 'Ticket Number',
    type: 'string',
    description: 'Support ticket identifier',
    category: 'business',
    defaultConstraints: {
      prefix: 'TKT-',
      padLength: 6,
      minLength: 5,
      maxLength: 15
    }
  },

  // Standard templates without special constraints
  {
    id: 'user_id',
    name: 'User ID',
    type: 'uuid',
    description: 'Unique user identifier',
    category: 'identification'
  },
  {
    id: 'session_id',
    name: 'Session ID',
    type: 'uuid',
    description: 'Session identifier',
    category: 'technical'
  },
  {
    id: 'transaction_id',
    name: 'Transaction ID',
    type: 'uuid',
    description: 'Transaction identifier',
    category: 'business'
  },
  {
    id: 'api_key',
    name: 'API Key',
    type: 'uuid',
    description: 'API authentication key',
    category: 'technical'
  },
  {
    id: 'customer_name',
    name: 'Customer Name',
    type: 'person_name',
    description: 'Customer full name',
    category: 'personal'
  },
  {
    id: 'product_name',
    name: 'Product Name',
    type: 'product_name',
    description: 'Product display name',
    category: 'business'
  },
  {
    id: 'email_address',
    name: 'Email Address',
    type: 'email',
    description: 'Email contact address',
    category: 'personal'
  },
  {
    id: 'phone_number',
    name: 'Phone Number',
    type: 'string',
    description: 'Contact phone number',
    category: 'personal',
    defaultConstraints: {
      minLength: 10,
      maxLength: 20
    }
  },
  {
    id: 'address',
    name: 'Address',
    type: 'address',
    description: 'Full street address',
    category: 'location'
  },
  {
    id: 'price',
    name: 'Price',
    type: 'price',
    description: 'Product or service price',
    category: 'business',
    defaultConstraints: {
      min: 0,
      max: 999999
    }
  },
  {
    id: 'quantity',
    name: 'Quantity',
    type: 'number',
    description: 'Item quantity',
    category: 'business',
    defaultConstraints: {
      min: 0,
      max: 10000
    }
  },
  {
    id: 'created_date',
    name: 'Created Date',
    type: 'date',
    description: 'Creation timestamp',
    category: 'technical',
    defaultConstraints: {
      startDate: '2020-01-01',
      endDate: '2024-12-31'
    }
  },
  {
    id: 'updated_date',
    name: 'Updated Date',
    type: 'date',
    description: 'Last update timestamp',
    category: 'technical',
    defaultConstraints: {
      startDate: '2020-01-01',
      endDate: '2024-12-31'
    }
  },
  {
    id: 'status',
    name: 'Status',
    type: 'string',
    description: 'Record status (active/inactive)',
    category: 'business',
    defaultConstraints: {
      minLength: 3,
      maxLength: 20
    }
  },
  {
    id: 'description',
    name: 'Description',
    type: 'paragraph',
    description: 'Detailed description text',
    category: 'business',
    defaultConstraints: {
      minWords: 10,
      maxWords: 100
    }
  },
  {
    id: 'image_url',
    name: 'Image URL',
    type: 'image_url',
    description: 'Image file URL',
    category: 'media'
  }
];

export const templatesByCategory = fieldTemplates.reduce((acc, template) => {
  if (!acc[template.category]) {
    acc[template.category] = [];
  }
  acc[template.category].push(template);
  return acc;
}, {} as Record<string, FieldTemplate[]>);