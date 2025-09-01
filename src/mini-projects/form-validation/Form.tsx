// File: mini-projects/form-validation/Form.tsx

import React, { useState } from 'react';
import { useForm, useFieldArray } from './useForm';
import { 
  validators, 
  compositeValidators, 
  ValidationSchema, 
  FieldError 
} from './validation';

// Form data interfaces
interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    newsletter: boolean;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  skills: string[];
  website?: string;
  biography: string;
}

// Validation schema
const validationSchema: ValidationSchema = {
  firstName: {
    required: true,
    rules: [
      { validator: validators.required('First name is required') },
      { validator: validators.minLength(2, 'First name must be at least 2 characters') },
      { validator: validators.maxLength(50, 'First name must be less than 50 characters') },
      { 
        validator: validators.pattern(
          /^[a-zA-Z\s\-']+$/,
          'First name can only contain letters, spaces, hyphens, and apostrophes'
        )
      }
    ]
  },
  lastName: {
    required: true,
    rules: [
      { validator: validators.required('Last name is required') },
      { validator: validators.minLength(2, 'Last name must be at least 2 characters') },
      { validator: validators.maxLength(50, 'Last name must be less than 50 characters') }
    ]
  },
  email: {
    required: true,
    rules: [
      { validator: validators.required('Email is required') },
      { validator: validators.email('Please enter a valid email address') },
      { 
        validator: validators.async(
          async (email: string) => {
            // Simulate API call to check if email is available
            await new Promise(resolve => setTimeout(resolve, 500));
            return !['admin@example.com', 'test@test.com'].includes(email);
          },
          'This email is already taken',
          'emailAvailable'
        )
      }
    ],
    debounceMs: 500
  },
  phone: {
    required: true,
    rules: [
      { validator: validators.required('Phone number is required') },
      { validator: validators.phone('Please enter a valid phone number') }
    ]
  },
  password: {
    required: true,
    rules: compositeValidators.password(8, true, true, true)
  },
  confirmPassword: {
    required: true,
    rules: [
      { validator: validators.required('Please confirm your password') },
      { validator: validators.matches('password', 'Passwords must match') }
    ]
  },
  dateOfBirth: {
    required: true,
    rules: [
      { validator: validators.required('Date of birth is required') },
      { 
        validator: validators.dateRange(
          new Date('1900-01-01'),
          new Date(),
          'Please enter a valid date of birth'
        )
      }
    ]
  },
  'address.street': {
    required: true,
    rules: [
      { validator: validators.required('Street address is required') },
      { validator: validators.minLength(5, 'Street address must be at least 5 characters') }
    ]
  },
  'address.city': {
    required: true,
    rules: [
      { validator: validators.required('City is required') },
      { validator: validators.minLength(2, 'City must be at least 2 characters') }
    ]
  },
  'address.state': {
    required: true,
    rules: [
      { validator: validators.required('State is required') }
    ]
  },
  'address.zipCode': {
    required: true,
    rules: [
      { validator: validators.required('Zip code is required') },
      { validator: validators.pattern(/^\d{5}(-\d{4})?$/, 'Please enter a valid zip code') }
    ]
  },
  website: {
    rules: [
      { 
        validator: validators.url('Please enter a valid URL'),
        when: (context) => !!context.formData.website
      }
    ]
  },
  biography: {
    rules: [
      { validator: validators.maxLength(500, 'Biography must be less than 500 characters') }
    ]
  }
};

// Initial form values
const initialValues: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  },
  preferences: {
    newsletter: false,
    notifications: true,
    theme: 'light'
  },
  skills: [],
  website: '',
  biography: ''
};

// Field component for consistent styling
interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  errors?: FieldError[];
  touched?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Field: React.FC<FieldProps & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>> = ({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  errors,
  touched,
  children,
  className = '',
  ...props
}) => {
  const hasError = errors && errors.length > 0 && touched;
  
  return (
    <div className={`field-group mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children ? (
        children
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            hasError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            hasError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      
      {hasError && (
        <div className="mt-1">
          {errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm">
              {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// Skills input component
const SkillsInput: React.FC<{
  skills: string[];
  onChange: (skills: string[]) => void;
  errors?: FieldError[];
  touched?: boolean;
}> = ({ skills, onChange, errors, touched }) => {
  const [inputValue, setInputValue] = useState('');
  const hasError = errors && errors.length > 0 && touched;

  const addSkill = () => {
    if (inputValue.trim() && !skills.includes(inputValue.trim())) {
      onChange([...skills, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Skills
      </label>
      
      <div className="flex mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a skill..."
          className={`flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 transition-colors ${
            hasError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        <button
          type="button"
          onClick={addSkill}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {hasError && (
        <div className="mt-1">
          {errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm">
              {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// Main form component
const UserRegistrationForm: React.FC = () => {
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const form = useForm<UserFormData>({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, actions) => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Form submitted with values:', values);
        
        setSubmitResult({
          success: true,
          message: 'Registration completed successfully!'
        });
        
        // Reset form after successful submission
        setTimeout(() => {
          actions.resetForm();
          setSubmitResult(null);
        }, 3000);
        
      } catch (error) {
        setSubmitResult({
          success: false,
          message: 'Registration failed. Please try again.'
        });
      }
    },
    onValidationError: (errors) => {
      console.log('Validation errors:', errors);
    }
  });

  const skillsFieldArray = useFieldArray<string>('skills', form);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          User Registration Form
        </h1>
        <p className="text-gray-600">
          Complete form validation with real-time feedback and async validation
        </p>
      </div>

      {submitResult && (
        <div className={`mb-6 p-4 rounded-lg ${
          submitResult.success 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitResult.message}
        </div>
      )}

      <form onSubmit={form.handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="First Name"
              required
              {...form.getFieldProps('firstName')}
              placeholder="Enter your first name"
            />
            
            <Field
              label="Last Name"
              required
              {...form.getFieldProps('lastName')}
              placeholder="Enter your last name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Email"
              type="email"
              required
              {...form.getFieldProps('email')}
              placeholder="Enter your email address"
            />
            
            <Field
              label="Phone"
              type="tel"
              required
              {...form.getFieldProps('phone')}
              placeholder="Enter your phone number"
            />
          </div>

          <Field
            label="Date of Birth"
            type="date"
            required
            {...form.getFieldProps('dateOfBirth')}
          />
        </div>

        {/* Security Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Security
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Password"
              type="password"
              required
              {...form.getFieldProps('password')}
              placeholder="Create a strong password"
            />
            
            <Field
              label="Confirm Password"
              type="password"
              required
              {...form.getFieldProps('confirmPassword')}
              placeholder="Confirm your password"
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Address
          </h2>
          
          <Field
            label="Street Address"
            required
            {...form.getFieldProps('address.street')}
            placeholder="Enter your street address"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="City"
              required
              {...form.getFieldProps('address.city')}
              placeholder="Enter your city"
            />
            
            <Field
              label="State"
              required
              name="address.state"
              value={form.values.address.state}
              onChange={(e) => form.setFieldValue('address.state', e.target.value)}
              onBlur={() => form.setFieldTouched('address.state', true)}
              errors={form.errors['address.state']}
              touched={form.touched['address.state']}
            >
              <select
                id="address.state"
                name="address.state"
                value={form.values.address.state}
                onChange={(e) => form.setFieldValue('address.state', e.target.value)}
                onBlur={() => form.setFieldTouched('address.state', true)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  form.errors['address.state'] && form.touched['address.state']
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="">Select a state</option>
                <option value="CA">California</option>
                <option value="NY">New York</option>
                <option value="TX">Texas</option>
                <option value="FL">Florida</option>
                <option value="WA">Washington</option>
              </select>
            </Field>
            
            <Field
              label="Zip Code"
              required
              {...form.getFieldProps('address.zipCode')}
              placeholder="Enter zip code"
            />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Preferences
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="newsletter"
                type="checkbox"
                checked={form.values.preferences.newsletter}
                onChange={(e) => form.setFieldValue('preferences.newsletter', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                Subscribe to newsletter
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="notifications"
                type="checkbox"
                checked={form.values.preferences.notifications}
                onChange={(e) => form.setFieldValue('preferences.notifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                Enable notifications
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme Preference
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={form.values.preferences.theme === 'light'}
                    onChange={(e) => form.setFieldValue('preferences.theme', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Light</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={form.values.preferences.theme === 'dark'}
                    onChange={(e) => form.setFieldValue('preferences.theme', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Dark</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Additional Information
          </h2>
          
          <SkillsInput
            skills={form.values.skills}
            onChange={(skills) => form.setFieldValue('skills', skills)}
            errors={form.errors.skills}
            touched={form.touched.skills}
          />
          
          <Field
            label="Website"
            type="url"
            {...form.getFieldProps('website')}
            placeholder="https://your-website.com"
          />
          
          <Field
            label="Biography"
            type="textarea"
            {...form.getFieldProps('biography')}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        {/* Form Status */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Valid:</span>
              <span className={`ml-2 ${form.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {form.isValid ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Dirty:</span>
              <span className="ml-2 text-blue-600">
                {Object.values(form.dirty).some(Boolean) ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Touched:</span>
              <span className="ml-2 text-blue-600">
                {Object.values(form.touched).some(Boolean) ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Submitting:</span>
              <span className="ml-2 text-blue-600">
                {form.isSubmitting ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => form.resetForm()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset Form
          </button>
          
          <button
            type="submit"
            disabled={form.isSubmitting || !form.isValid}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {form.isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Register'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserRegistrationForm;