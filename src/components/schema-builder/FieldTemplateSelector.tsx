import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { X, Search, Package, User, Building, MapPin, Monitor, Image } from 'lucide-react';
import { fieldTemplates, templatesByCategory, FieldTemplate } from '../../constants/fieldTemplates';
import { DataField, DataType, FieldConstraints } from '../../types';

interface FieldTemplateSelectorProps {
  onTemplateSelect: (template: FieldTemplate, customPrefix?: string) => void;
  onClose: () => void;
  existingFields: DataField[];
}

const categoryIcons = {
  identification: Package,
  business: Building,
  personal: User,
  technical: Monitor,
  location: MapPin,
  media: Image,
};

const categoryColors = {
  identification: 'bg-blue-100 text-blue-800',
  business: 'bg-green-100 text-green-800',
  personal: 'bg-purple-100 text-purple-800',
  technical: 'bg-orange-100 text-orange-800',
  location: 'bg-yellow-100 text-yellow-800',
  media: 'bg-pink-100 text-pink-800',
};

export const FieldTemplateSelector: React.FC<FieldTemplateSelectorProps> = ({
  onTemplateSelect,
  onClose,
  existingFields,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customPrefix, setCustomPrefix] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FieldTemplate | null>(null);

  const filteredTemplates = fieldTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;

    // Check if field name already exists
    const fieldExists = existingFields.some(field =>
      field.name.toLowerCase() === template.name.toLowerCase()
    );

    return matchesSearch && matchesCategory && !fieldExists;
  });

  const handleTemplateSelect = (template: FieldTemplate) => {
    setSelectedTemplate(template);
    if (template.defaultConstraints?.prefix) {
      setCustomPrefix(template.defaultConstraints.prefix);
    } else {
      setCustomPrefix('');
    }
  };

  const handleAddField = () => {
    if (!selectedTemplate) return;

    const finalConstraints: FieldConstraints = {
      ...selectedTemplate.defaultConstraints,
    };

    // Override with custom prefix if provided
    if (customPrefix && (selectedTemplate.type === 'string' || selectedTemplate.type === 'number')) {
      finalConstraints.prefix = customPrefix;
    }

    const newField: DataField = {
      id: `field_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      name: selectedTemplate.name,
      type: selectedTemplate.type as DataType,
      constraints: Object.keys(finalConstraints).length > 0 ? finalConstraints : undefined,
    };

    onTemplateSelect(selectedTemplate, customPrefix);
    onClose();
  };

  const isAddButtonDisabled = !selectedTemplate;

  return (
    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Choose Field Template</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search field templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Templates
          </Button>
          {Object.entries(templatesByCategory).map(([category, templates]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="flex items-center gap-1"
              >
                <Icon className="w-3 h-3" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <Badge variant="secondary" className="ml-1">
                  {templates.length}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTemplates.map((template) => {
            const Icon = categoryIcons[template.category];
            const isSelected = selectedTemplate?.id === template.id;

            return (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <h3 className="font-medium text-sm">{template.name}</h3>
                  </div>
                  <Badge className={categoryColors[template.category]} variant="secondary">
                    {template.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{template.description}</p>

                {template.defaultConstraints && Object.keys(template.defaultConstraints).length > 0 && (
                  <div className="text-xs text-gray-500">
                    {template.defaultConstraints.prefix && (
                      <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-1">
                        Prefix: {template.defaultConstraints.prefix}
                      </span>
                    )}
                    {template.defaultConstraints.padLength && (
                      <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-1">
                        Length: {template.defaultConstraints.padLength}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Template Configuration */}
        {selectedTemplate && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Configure: {selectedTemplate.name}</h3>

            {selectedTemplate.type === 'string' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customPrefix">Custom Prefix (Optional)</Label>
                  <Input
                    id="customPrefix"
                    placeholder={selectedTemplate.defaultConstraints?.prefix || "e.g., PC-, P-, ORD-"}
                    value={customPrefix}
                    onChange={(e) => setCustomPrefix(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use default or no prefix
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  <strong>Example output:</strong> {customPrefix || selectedTemplate.defaultConstraints?.prefix || ''}12345
                </div>
              </div>
            )}

            {selectedTemplate.type === 'number' && selectedTemplate.defaultConstraints && (
              <div className="text-sm text-gray-600">
                <strong>Constraints:</strong>
                {selectedTemplate.defaultConstraints.min !== undefined && ` Min: ${selectedTemplate.defaultConstraints.min}`}
                {selectedTemplate.defaultConstraints.max !== undefined && ` Max: ${selectedTemplate.defaultConstraints.max}`}
                {selectedTemplate.defaultConstraints.decimal !== undefined && ` Decimal: ${selectedTemplate.defaultConstraints.decimal}`}
              </div>
            )}

            {selectedTemplate.type === 'uuid' && (
              <div className="text-sm text-gray-600">
                <strong>Example output:</strong> 550e8400-e29b-41d4-a716-446655440000
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddField}
            disabled={isAddButtonDisabled}
          >
            Add Field
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};