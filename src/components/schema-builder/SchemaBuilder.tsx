import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileUpload } from '../ui/upload';
import { FieldEditor } from './FieldEditor';
import { FieldTemplateSelector } from './FieldTemplateSelector';
import { Plus, Edit, Trash2, FileJson, Upload, Layout } from 'lucide-react';
import { DataField, Schema, DataType } from '../../types';
import { FieldTemplate } from '../../constants/fieldTemplates';

interface SchemaBuilderProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
}

export const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ schema, onSchemaChange }) => {
  const [editingField, setEditingField] = useState<DataField | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const getDataTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      string: 'String',
      number: 'Number',
      boolean: 'Boolean',
      object: 'Object',
      array: 'Array',
      person_name: 'Person Name',
      product_name: 'Product Name',
      address: 'Address',
      email: 'Email',
      image_url: 'Image URL',
      paragraph: 'Paragraph',
      uuid: 'UUID',
      date: 'Date',
      price: 'Price',
    };
    return labels[type] || type;
  };

  const getDataTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      string: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      boolean: 'bg-purple-100 text-purple-800',
      object: 'bg-orange-100 text-orange-800',
      array: 'bg-pink-100 text-pink-800',
      person_name: 'bg-indigo-100 text-indigo-800',
      product_name: 'bg-teal-100 text-teal-800',
      address: 'bg-yellow-100 text-yellow-800',
      email: 'bg-red-100 text-red-800',
      image_url: 'bg-cyan-100 text-cyan-800',
      paragraph: 'bg-gray-100 text-gray-800',
      uuid: 'bg-violet-100 text-violet-800',
      date: 'bg-amber-100 text-amber-800',
      price: 'bg-emerald-100 text-emerald-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleAddField = () => {
    setEditingField(null);
    setShowFieldEditor(true);
  };

  const handleTemplateSelect = (template: FieldTemplate, customPrefix?: string) => {
    const constraints = { ...template.defaultConstraints };

    // Override prefix if custom one is provided
    if (customPrefix && (template.type === 'string' || template.type === 'number')) {
      constraints.prefix = customPrefix;
    }

    const newField: DataField = {
      id: `field_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      type: template.type as DataType,
      constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
    };

    const updatedFields = [...schema.fields, newField];
    onSchemaChange({
      ...schema,
      fields: updatedFields,
    });
  };

  const handleEditField = (field: DataField) => {
    setEditingField(field);
    setShowFieldEditor(true);
  };

  const handleSaveField = (field: DataField) => {
    let updatedFields: DataField[];

    if (editingField) {
      // Update existing field
      updatedFields = schema.fields.map(f => f.id === field.id ? field : f);
    } else {
      // Add new field
      updatedFields = [...schema.fields, field];
    }

    onSchemaChange({
      ...schema,
      fields: updatedFields,
    });

    setShowFieldEditor(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = schema.fields.filter(f => f.id !== fieldId);
    onSchemaChange({
      ...schema,
      fields: updatedFields,
    });
  };

  const exportSchema = () => {
    const schemaJson = JSON.stringify({
      name: schema.name,
      description: schema.description,
      fields: schema.fields.map(field => ({
        name: field.name,
        type: field.type,
        constraints: field.constraints,
        nestedSchema: field.nestedSchema,
      }))
    }, null, 2);

    const blob = new Blob([schemaJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name.replace(/\s+/g, '_').toLowerCase()}_schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSchemaUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      const file = files[0];
      const text = await file.text();
      const uploadedSchema = JSON.parse(text);

      // Validate the uploaded schema structure
      if (!uploadedSchema.name || !uploadedSchema.fields || !Array.isArray(uploadedSchema.fields)) {
        alert('Invalid schema format. Please check your JSON file.');
        return;
      }

      // Convert uploaded schema to our format
      const convertedFields: DataField[] = uploadedSchema.fields.map((field: any, index: number) => ({
        id: field.id || `field_${Date.now()}_${index}`,
        name: field.name,
        type: field.type,
        constraints: field.constraints,
        nestedSchema: field.nestedSchema,
      }));

      const newSchema: Schema = {
        id: schema.id,
        name: uploadedSchema.name,
        description: uploadedSchema.description || '',
        fields: convertedFields,
      };

      onSchemaChange(newSchema);
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading schema:', error);
      alert('Failed to parse schema file. Please ensure it\'s a valid JSON file.');
    }
  };

  const handleSampleSchema = () => {
    // Sample upload schema defined inline
    const sampleSchema = {
      name: "File Upload Schema",
      description: "Schema for handling file uploads with metadata",
      fields: [
        {
          name: "id",
          type: "uuid",
          constraints: {
            required: true
          }
        },
        {
          name: "originalName",
          type: "string",
          constraints: {
            minLength: 1,
            maxLength: 255,
            required: true
          }
        },
        {
          name: "fileName",
          type: "string",
          constraints: {
            minLength: 1,
            maxLength: 255,
            required: true
          }
        },
        {
          name: "mimeType",
          type: "string",
          constraints: {
            minLength: 3,
            maxLength: 100,
            required: true
          }
        },
        {
          name: "size",
          type: "number",
          constraints: {
            min: 0,
            max: 104857600,
            required: true
          }
        },
        {
          name: "uploadedAt",
          type: "date",
          constraints: {
            required: true
          }
        },
        {
          name: "metadata",
          type: "object",
          nestedSchema: [
            {
              name: "width",
              type: "number",
              constraints: {
                min: 1,
                max: 99999
              }
            },
            {
              name: "height",
              type: "number",
              constraints: {
                min: 1,
                max: 99999
              }
            },
            {
              name: "checksum",
              type: "string",
              constraints: {
                minLength: 32,
                maxLength: 64
              }
            }
          ]
        }
      ]
    };

    const convertedFields: DataField[] = sampleSchema.fields.map((field: any, index: number) => ({
      id: `field_${Date.now()}_${index}`,
      name: field.name,
      type: field.type,
      constraints: field.constraints,
      nestedSchema: field.nestedSchema,
    }));

    const newSchema: Schema = {
      id: schema.id,
      name: sampleSchema.name,
      description: sampleSchema.description,
      fields: convertedFields,
    };

    onSchemaChange(newSchema);
  };

  const renderConstraints = (field: DataField): string => {
    const constraints = field.constraints;
    if (!constraints) return '';

    const parts: string[] = [];

    if (constraints.minLength || constraints.maxLength) {
      parts.push(`len: ${constraints.minLength || '?'}-${constraints.maxLength || '?'}`);
    }

    if (constraints.min || constraints.max) {
      parts.push(`val: ${constraints.min || '?'}-${constraints.max || '?'}`);
    }

    if (constraints.minItems || constraints.maxItems) {
      parts.push(`items: ${constraints.minItems || '?'}-${constraints.maxItems || '?'}`);
    }

    if (constraints.startDate || constraints.endDate) {
      parts.push(`date: ${constraints.startDate || '?'} - ${constraints.endDate || '?'}`);
    }

    return parts.join(', ');
  };

  const renderNestedFields = (fields: DataField[], depth = 0): React.ReactNode => {
    return fields.map(field => (
      <div key={field.id} style={{ marginLeft: `${depth * 16}px` }} className="py-1">
        <span className="text-sm text-gray-600">
          {field.name}: <span className="font-medium">{getDataTypeLabel(field.type)}</span>
          {renderConstraints(field) && (
            <span className="text-xs text-gray-500 ml-1">({renderConstraints(field)})</span>
          )}
        </span>
        {field.nestedSchema && field.nestedSchema.length > 0 && (
          <div className="ml-2">
            {renderNestedFields(field.nestedSchema, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (showFieldEditor) {
    return (
      <FieldEditor
        field={editingField}
        onSave={handleSaveField}
        onCancel={() => {
          setShowFieldEditor(false);
          setEditingField(null);
        }}
        existingFields={schema.fields}
      />
    );
  }

  if (showUpload) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            accept=".json"
            maxFiles={1}
            onFilesChange={handleSchemaUpload}
            className="mb-4"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpload(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleSampleSchema}
            >
              Load Upload Sample
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showTemplateSelector) {
    return (
      <FieldTemplateSelector
        onTemplateSelect={handleTemplateSelect}
        onClose={() => setShowTemplateSelector(false)}
        existingFields={schema.fields}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Schema Configuration</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowTemplateSelector(true)}>
              <Layout className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={exportSchema}>
              <FileJson className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddField}>
              <Plus className="w-4 h-4 mr-2" />
              Custom Field
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {schema.fields.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <FileJson className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fields defined yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first field to define the data structure</p>
            <Button onClick={handleAddField}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Field
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {schema.fields.map((field) => (
              <div
                key={field.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{field.name}</h3>
                      <Badge className={getDataTypeColor(field.type)}>
                        {getDataTypeLabel(field.type)}
                      </Badge>
                    </div>

                    {renderConstraints(field) && (
                      <p className="text-sm text-gray-600 mb-2">
                        Constraints: {renderConstraints(field)}
                      </p>
                    )}

                    {field.nestedSchema && field.nestedSchema.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border">
                        <p className="text-sm font-medium text-gray-700 mb-2">Nested Schema:</p>
                        {renderNestedFields(field.nestedSchema)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditField(field)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {schema.fields.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Schema Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Fields:</span>
                  <span className="ml-2 font-medium text-blue-900">{schema.fields.length}</span>
                </div>
                <div>
                  <span className="text-blue-700">Nested Objects:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {schema.fields.filter(f => f.type === 'object').length}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Arrays:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {schema.fields.filter(f => f.type === 'array').length}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Required Fields:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {schema.fields.length} {/* All fields are currently required */}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};