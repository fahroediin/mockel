import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { DataField, DataType, FieldConstraints } from '../../types';

const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array', 'person_name', 'product_name', 'address', 'email', 'image_url', 'paragraph', 'uuid', 'date', 'price']),
  constraints: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    minWords: z.number().optional(),
    maxWords: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    decimal: z.number().optional(),
    minItems: z.number().optional(),
    maxItems: z.number().optional(),
    itemType: z.enum(['string', 'number', 'boolean', 'object', 'array', 'person_name', 'product_name', 'address', 'email', 'image_url', 'paragraph', 'uuid', 'date', 'price']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    format: z.string().optional(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    pattern: z.string().optional(),
    padLength: z.number().optional(),
  }).optional(),
});

interface FieldEditorProps {
  field?: DataField;
  onSave: (field: DataField) => void;
  onCancel: () => void;
  existingFields: DataField[];
}

const dataTypeOptions: { value: DataType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' },
  { value: 'person_name', label: 'Person Name' },
  { value: 'product_name', label: 'Product Name' },
  { value: 'address', label: 'Address' },
  { value: 'email', label: 'Email' },
  { value: 'image_url', label: 'Image URL' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'uuid', label: 'UUID' },
  { value: 'date', label: 'Date' },
  { value: 'price', label: 'Price' },
];

export const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel, existingFields }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: field ? {
      name: field.name,
      type: field.type,
      constraints: field.constraints,
    } : {
      type: 'string',
    },
  });

  const selectedType = watch('type');
  const [nestedFields, setNestedFields] = React.useState<DataField[]>(field?.nestedSchema || []);

  const onSubmit = (data: z.infer<typeof fieldSchema>) => {
    const newField: DataField = {
      id: field?.id || Date.now().toString(),
      name: data.name,
      type: data.type,
      constraints: data.constraints,
      nestedSchema: (data.type === 'object' || data.type === 'array') ? nestedFields : undefined,
    };

    onSave(newField);
  };

  const addNestedField = () => {
    const newField: DataField = {
      id: Date.now().toString(),
      name: `field_${nestedFields.length + 1}`,
      type: 'string',
    };
    setNestedFields([...nestedFields, newField]);
  };

  const updateNestedField = (index: number, updatedField: DataField) => {
    const updatedFields = [...nestedFields];
    updatedFields[index] = updatedField;
    setNestedFields(updatedFields);
  };

  const removeNestedField = (index: number) => {
    setNestedFields(nestedFields.filter((_, i) => i !== index));
  };

  const renderConstraints = () => {
    switch (selectedType) {
      case 'string':
      case 'paragraph':
        return (
          <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
            <Label className="text-sm font-medium">String Constraints</Label>

            {/* Prefix/Suffix/Pattern Section */}
            <div className="space-y-3 border-b border-gray-200 pb-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="prefix">Prefix (Optional)</Label>
                  <Input
                    id="prefix"
                    placeholder="e.g., PC-, P-, ORD-"
                    {...register('constraints.prefix')}
                  />
                </div>
                <div>
                  <Label htmlFor="suffix">Suffix (Optional)</Label>
                  <Input
                    id="suffix"
                    placeholder="e.g., -ID, -NUM"
                    {...register('constraints.suffix')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pattern">Pattern (Optional)</Label>
                  <Input
                    id="pattern"
                    placeholder="e.g., PC-###, P-????"
                    {...register('constraints.pattern')}
                  />
                  <p className="text-xs text-gray-500 mt-1"># for numbers, ? for letters</p>
                </div>
                <div>
                  <Label htmlFor="padLength">Number Length</Label>
                  <Input
                    type="number"
                    id="padLength"
                    placeholder="e.g., 5"
                    {...register('constraints.padLength', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for padding numbers with zeros</p>
                </div>
              </div>
            </div>

            {/* Length Constraints */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="minLength">Min Length</Label>
                <Input
                  type="number"
                  id="minLength"
                  {...register('constraints.minLength', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="maxLength">Max Length</Label>
                <Input
                  type="number"
                  id="maxLength"
                  {...register('constraints.maxLength', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
        );

      case 'number':
      case 'price':
        return (
          <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
            <Label className="text-sm font-medium">Number Constraints</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="min">Min Value</Label>
                <Input
                  type="number"
                  id="min"
                  {...register('constraints.min', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="max">Max Value</Label>
                <Input
                  type="number"
                  id="max"
                  {...register('constraints.max', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
            <Label className="text-sm font-medium">Date Constraints</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  {...register('constraints.startDate')}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  id="endDate"
                  {...register('constraints.endDate')}
                />
              </div>
            </div>
          </div>
        );

      case 'array':
        return (
          <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
            <Label className="text-sm font-medium">Array Constraints</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="minItems">Min Items</Label>
                <Input
                  type="number"
                  id="minItems"
                  {...register('constraints.minItems', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="maxItems">Max Items</Label>
                <Input
                  type="number"
                  id="maxItems"
                  {...register('constraints.maxItems', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{field ? 'Edit Field' : 'Add New Field'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Field Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., product_name, price, is_available"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="type">Data Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value: DataType) => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {dataTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderConstraints()}

          {(selectedType === 'object' || selectedType === 'array') && (
            <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Nested Schema</Label>
                <Button type="button" variant="outline" size="sm" onClick={addNestedField}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Nested Field
                </Button>
              </div>

              {nestedFields.map((nestedField, index) => (
                <div key={nestedField.id} className="flex gap-2 items-center">
                  <Input
                    value={nestedField.name}
                    onChange={(e) => updateNestedField(index, { ...nestedField, name: e.target.value })}
                    placeholder="Field name"
                  />
                  <Select
                    value={nestedField.type}
                    onValueChange={(value: DataType) => updateNestedField(index, { ...nestedField, type: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNestedField(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {nestedFields.length === 0 && (
                <p className="text-gray-500 text-sm">No nested fields defined</p>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {field ? 'Update Field' : 'Add Field'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};