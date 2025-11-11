import { Schema, DataField, GenerationConfig, DataType } from '../types';

export class MockDataGenerator {
  private generateValue(field: DataField): any {
    const { type, constraints, nestedSchema } = field;

    switch (type) {
      case 'string':
        return this.generateString(constraints);

      case 'number':
        return this.generateNumber(constraints);

      case 'boolean':
        return Math.random() > 0.5;

      case 'uuid':
        return this.generateUUID();

      case 'date':
        return this.generateDate(constraints);

      case 'email':
        return this.generateEmail();

      case 'person_name':
        return this.generatePersonName();

      case 'product_name':
        return this.generateProductName();

      case 'address':
        return this.generateAddress();

      case 'image_url':
        return this.generateImageUrl();

      case 'paragraph':
        return this.generateParagraph(constraints);

      case 'price':
        return this.generatePrice(constraints);

      case 'object':
        return this.generateObject(nestedSchema || []);

      case 'array':
        return this.generateArray(nestedSchema || [], constraints);

      default:
        return null;
    }
  }

  private generateString(constraints?: any): string {
    const adjectives = ['Beautiful', 'Smart', 'Fast', 'Creative', 'Modern', 'Classic', 'Premium', 'Basic'];
    const nouns = ['Product', 'Service', 'Solution', 'Platform', 'System', 'Application', 'Tool', 'Framework'];

    let result = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;

    if (constraints?.minLength && result.length < constraints.minLength) {
      result = result.padEnd(constraints.minLength, 'x');
    }

    if (constraints?.maxLength && result.length > constraints.maxLength) {
      result = result.substring(0, constraints.maxLength);
    }

    return result;
  }

  private generateNumber(constraints?: any): number {
    const min = constraints?.min || 0;
    const max = constraints?.max || 100;
    const decimal = constraints?.decimal || 0;

    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(decimal));
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generateDate(constraints?: any): string {
    const startDate = constraints?.startDate ? new Date(constraints.startDate) : new Date(2020, 0, 1);
    const endDate = constraints?.endDate ? new Date(constraints.endDate) : new Date();

    const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

    if (constraints?.format) {
      return date.toISOString().split('T')[0]; // Basic formatting
    }

    return date.toISOString();
  }

  private generateEmail(): string {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com'];
    const names = ['john.doe', 'jane.smith', 'user123', 'admin', 'contact'];
    const name = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}@${domain}`;
  }

  private generatePersonName(): string {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  private generateProductName(): string {
    const products = ['iPhone 15', 'Samsung Galaxy S24', 'MacBook Pro', 'iPad Air', 'AirPods Pro', 'Apple Watch', 'Dell XPS', 'ThinkPad X1'];
    return products[Math.floor(Math.random() * products.length)];
  }

  private generateAddress(): string {
    const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'Elm St', 'Pine Rd'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ'];

    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const zip = Math.floor(Math.random() * 90000) + 10000;

    return `${streetNumber} ${street}, ${city}, ${state} ${zip}`;
  }

  private generateImageUrl(): string {
    const widths = [200, 400, 600, 800];
    const heights = [200, 300, 400, 600];
    const categories = ['nature', 'people', 'technology', 'animals', 'food'];

    const width = widths[Math.floor(Math.random() * widths.length)];
    const height = heights[Math.floor(Math.random() * heights.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];

    return `https://picsum.photos/${width}/${height}?category=${category}`;
  }

  private generateParagraph(constraints?: any): string {
    const sentences = [
      'This innovative solution transforms the way businesses operate in the digital age.',
      'Our cutting-edge technology provides unparalleled performance and reliability.',
      'Experience the future of productivity with our comprehensive platform.',
      'This revolutionary approach delivers exceptional results for modern enterprises.',
      'Discover how our advanced features streamline your workflow and boost efficiency.'
    ];

    const sentenceCount = constraints?.minWords ? Math.max(1, Math.floor(constraints.minWords / 10)) : 3;
    const selectedSentences: string[] = [];

    for (let i = 0; i < sentenceCount; i++) {
      selectedSentences.push(sentences[Math.floor(Math.random() * sentences.length)]);
    }

    return selectedSentences.join(' ');
  }

  private generatePrice(constraints?: any): number {
    const min = constraints?.min || 10000;
    const max = constraints?.max || 5000000;
    const price = Math.random() * (max - min) + min;
    return Math.round(price);
  }

  private generateObject(fields: DataField[]): any {
    const obj: any = {};
    fields.forEach(field => {
      obj[field.name] = this.generateValue(field);
    });
    return obj;
  }

  private generateArray(fields: DataField[], constraints?: any): any[] {
    const minItems = constraints?.minItems || 1;
    const maxItems = constraints?.maxItems || 5;
    const itemCount = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;

    const array: any[] = [];
    for (let i = 0; i < itemCount; i++) {
      if (fields.length === 1) {
        array.push(this.generateValue(fields[0]));
      } else {
        array.push(this.generateObject(fields));
      }
    }
    return array;
  }

  generateMockData(schema: Schema, config: GenerationConfig): any[] {
    const data: any[] = [];

    for (let i = 0; i < config.recordCount; i++) {
      const record: any = {};

      schema.fields.forEach(field => {
        if (config.includeNulls && Math.random() < 0.1) {
          record[field.name] = null;
        } else {
          record[field.name] = this.generateValue(field);
        }
      });

      data.push(record);
    }

    return data;
  }
}

// LLM Integration (placeholder for future implementation)
export class LLMService {
  async generateMockData(schema: Schema, config: GenerationConfig): Promise<any[]> {
    // This is where you would integrate with an LLM service like OpenAI, Anthropic, etc.
    // For now, we'll use the local generator

    const generator = new MockDataGenerator();
    return generator.generateMockData(schema, config);
  }

  private createLLMPrompt(schema: Schema, config: GenerationConfig): string {
    const prompt = {
      instruction: `Generate an array of ${config.recordCount} JSON objects based on the following schema. Ensure the data is realistic and diverse.`,
      schema: schema.fields.reduce((acc, field) => {
        acc[field.name] = {
          type: field.type,
          ...field.constraints
        };
        return acc;
      }, {} as any)
    };

    return JSON.stringify(prompt, null, 2);
  }
}

export const mockService = new MockDataGenerator();
export const llmService = new LLMService();