import React, { useState } from 'react';

// Giả lập cấu trúc JSON Schema đơn giản
interface JsonSchema {
  title?: string;
  type: 'object';
  required?: string[];
  properties: Record<string, {
    type: 'string' | 'number' | 'boolean';
    title: string;
    description?: string;
  }>;
}

interface DynamicFormBuilderProps {
  schema: JsonSchema;
  onSubmit: (formData: Record<string, any>) => void;
  isLoading?: boolean;
}

/**
 * 🎨 DynamicFormBuilder (Schema-Driven UI Engine)
 * Linh kiện này tự động biến JSON Schema (Tải từ Server) thành Giao diện người dùng.
 * Phục vụ tầm nhìn No-code cho các SME.
 */
export function DynamicFormBuilder({ schema, onSubmit, isLoading }: DynamicFormBuilderProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Xóa lỗi khi người dùng bắt đầu gõ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto Validate dựa trên Schema
    const newErrors: Record<string, string> = {};
    if (schema.required) {
      schema.required.forEach(reqField => {
        if (!formData[reqField]) {
          newErrors[reqField] = `Trường này là bắt buộc`;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="panel" style={{ maxWidth: '42rem', margin: '0 auto', borderTop: '4px solid #3b82f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <div className="panel-header">
        <h3 className="panel-title" style={{ color: '#1e3a8a', fontSize: '1.25rem' }}>
          {schema.title || "Form Động (No-code)"}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Giao diện này được sinh ra tự động từ JSON Schema</p>
      </div>
      <div className="panel-body" style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(schema.properties).map(([key, prop]) => {
            const isRequired = schema.required?.includes(key);
            
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label htmlFor={key} style={{ fontWeight: 600, color: '#334155' }}>
                  {prop.title} {isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                
                {prop.description && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{prop.description}</span>
                )}
                
                {prop.type === 'string' && (
                  <input 
                    id={key}
                    placeholder={`Nhập ${prop.title.toLowerCase()}...`}
                    value={formData[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      border: errors[key] ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      width: '100%',
                      background: '#0f172a',
                      color: 'white'
                    }}
                  />
                )}
                
                {prop.type === 'number' && (
                  <input 
                    id={key}
                    type="number"
                    placeholder="0"
                    value={formData[key] || ''}
                    onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      border: errors[key] ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      width: '100%',
                      background: '#0f172a',
                      color: 'white'
                    }}
                  />
                )}

                {/* Có thể mở rộng thêm Checkbox, Select, v.v. tại đây */}

                {errors[key] && <span style={{ fontSize: '0.875rem', color: '#ef4444' }}>{errors[key]}</span>}
              </div>
            );
          })}
          
          <div style={{ paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ padding: '8px 16px' }}>
              {isLoading ? "Đang xử lý..." : "Lưu & Chạy Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
